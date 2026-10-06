import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import * as WebSocket from 'ws';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

// This is the AI Persona for E-Chowk
const SYSTEM_PROMPT = `You are the AI voice assistant for "E-Chowk", a platform that connects Indian daily wage laborers with employers.
Your role is to help workers (mazduron) register their skills on the platform by having a friendly, conversational phone call with them.

IMPORTANT RULES:
- Always respond in HINDI (Devanagari/Romanized Hindi) as most workers speak Hindi.
- Keep responses SHORT (1-2 sentences max). This is a phone call, not a text chat.
- Be warm, simple, and patient. Many workers may not be educated.
- Your goal: collect the worker's name, their main skill (e.g., carpenter, plumber, electrician, painter, driver, mason), and their city.
- After collecting all 3, confirm it back to them and say "Dhanyavaad! Aapki jaankari E-Chowk par save ho gayi hai. Hum aapko jald hi kaam dilayenge!"
- Start the conversation with: "Namaste! E-Chowk mein aapka swagat hai. Main aapko platform par register karne mein madad karunga. Kripya apna naam bataiye?"`;

@WebSocketGateway({ path: '/stream' })
export class VoiceGateway implements OnGatewayConnection, OnGatewayDisconnect {

  handleConnection(client: WebSocket, ...args: any[]) {
    console.log('\n\n==========================================');
    console.log('📞 [CALL CONNECTED] New Live Call Started!');
    console.log('==========================================\n');

    let streamSid: string | null = null;
    let audioBuffer: Buffer[] = [];
    let conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [];
    let isProcessing = false;
    let silenceTimer: NodeJS.Timeout | null = null;

    // Setup Azure Speech-to-Text (STT) Recognizer
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY!,
      process.env.AZURE_SPEECH_REGION!,
    );
    speechConfig.speechRecognitionLanguage = 'hi-IN'; // Hindi!

    // Azure uses PCM audio but Twilio sends mulaw8000. We push raw frames directly.
    const pushStream = sdk.AudioInputStream.createPushStream(
      sdk.AudioStreamFormat.getWaveFormatPCM(8000, 16, 1),
    );
    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    // Azure TTS (Text-to-Speech) helper
    const speak = (text: string) => {
      console.log(`[🤖 AI Speaking]: ${text}`);
      const ttsConfig = sdk.SpeechConfig.fromSubscription(
        process.env.AZURE_SPEECH_KEY!,
        process.env.AZURE_SPEECH_REGION!,
      );
      ttsConfig.speechSynthesisVoiceName = 'hi-IN-SwaraNeural'; // Hindi Female Voice
      ttsConfig.speechSynthesisOutputFormat =
        sdk.SpeechSynthesisOutputFormat.Raw8Khz16BitMonoPcm;

      const synthesizer = new sdk.SpeechSynthesizer(ttsConfig, null);
      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (result.audioData && streamSid && client.readyState === WebSocket.OPEN) {
            // Convert PCM to mulaw for Twilio
            const pcm = Buffer.from(result.audioData);
            const mulaw = pcmToMulaw(pcm);
            const payload = mulaw.toString('base64');

            // Send audio back to Twilio (and therefore to the caller's phone!)
            client.send(JSON.stringify({
              event: 'media',
              streamSid: streamSid,
              media: { payload },
            }));
          }
          synthesizer.close();
        },
        (err) => {
          console.error('[TTS Error]', err);
          synthesizer.close();
        },
      );
    };

    // Called when Azure STT recognizes what the user said
    recognizer.recognized = async (s, e) => {
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
        const userText = e.result.text.trim();
        if (!userText || isProcessing) return;

        console.log(`[👤 Worker Said]: ${userText}`);
        isProcessing = true;

        conversationHistory.push({ role: 'user', content: userText });

        try {
          // Ask Groq AI for a response
          const chatCompletion = await groq.chat.completions.create({
            model: 'openai/gpt-oss-20b', // Fast, free model
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...conversationHistory,
            ],
            max_tokens: 100, // Keep responses short for phone calls
          });

          const aiResponse = chatCompletion.choices[0]?.message?.content || 'Maafi kijiye, kuch galti ho gayi.';
          conversationHistory.push({ role: 'assistant', content: aiResponse });

          console.log(`[🤖 Groq AI Response]: ${aiResponse}`);
          speak(aiResponse);
        } catch (err) {
          console.error('[Groq Error]', err);
          speak('Maafi kijiye, kuch takneeki gadbad ho gayi. Kripya dobara koshish karein.');
        } finally {
          isProcessing = false;
        }
      }
    };

    recognizer.startContinuousRecognitionAsync(
      () => console.log('[✅ Azure STT]: Listening for Hindi speech...'),
      (err) => console.error('[❌ Azure STT Error]:', err),
    );

    client.on('message', (message: string) => {
      try {
        const msg = JSON.parse(message.toString());

        switch (msg.event) {
          case 'connected':
            console.log('[✅ WebSocket]: Twilio Stream Connected!');
            break;

          case 'start':
            streamSid = msg.start.streamSid;
            console.log(`[▶️ Stream Started]: SID = ${streamSid}`);
            // Greet the caller in Hindi!
            setTimeout(() => speak('Namaste! E-Chowk mein aapka swagat hai. Main aapko platform par register karne mein madad karunga. Kripya apna naam bataiye?'), 1500);
            break;

          case 'media':
            // Decode Twilio mulaw audio and push to Azure STT
            const mulawData = Buffer.from(msg.media.payload, 'base64');
            const pcmData = mulawToPcm(mulawData);
            // Cast to ArrayBuffer as required by Azure SDK pushStream API
            const ab = pcmData.buffer.slice(pcmData.byteOffset, pcmData.byteOffset + pcmData.byteLength) as ArrayBuffer;
            pushStream.write(ab);
            process.stdout.write('.');
            break;

          case 'stop':
            console.log(`\n[🛑 Stream Stopped]`);
            pushStream.close();
            recognizer.stopContinuousRecognitionAsync();
            break;
        }
      } catch (err) {
        // ignore parse errors for non-json frames
      }
    });
  }

  handleDisconnect(client: WebSocket) {
    console.log('\n[📉 CALL DISCONNECTED] User hung up the phone.');
  }
}

// ─── Audio Codec Conversion Helpers ──────────────────────────────────────────

// Twilio sends μ-law (mulaw) 8kHz audio. Azure needs Linear PCM 16-bit.
function mulawToPcm(mulawBuffer: Buffer): Buffer {
  const pcm = Buffer.alloc(mulawBuffer.length * 2);
  for (let i = 0; i < mulawBuffer.length; i++) {
    const sample = mulawDecode(mulawBuffer[i]);
    pcm.writeInt16LE(sample, i * 2);
  }
  return pcm;
}

function mulawDecode(u: number): number {
  u = ~u & 0xFF;
  const sign = u & 0x80;
  const exp = (u >> 4) & 0x07;
  const mant = u & 0x0F;
  let sample = (mant << (exp + 3)) + (33 << exp) - 33;
  return sign ? -sample : sample;
}

// Azure TTS sends Linear PCM 8kHz. Twilio needs μ-law for the phone call.
function pcmToMulaw(pcmBuffer: Buffer): Buffer {
  const mulaw = Buffer.alloc(pcmBuffer.length / 2);
  for (let i = 0; i < mulaw.length; i++) {
    const sample = pcmBuffer.readInt16LE(i * 2);
    mulaw[i] = mulawEncode(sample);
  }
  return mulaw;
}

function mulawEncode(sample: number): number {
  const MULAW_MAX = 0x1FFF;
  const MULAW_BIAS = 33;
  const sign = (sample >> 8) & 0x80;
  if (sign) sample = -sample;
  if (sample > MULAW_MAX) sample = MULAW_MAX;
  sample += MULAW_BIAS;
  let exp = 7;
  for (let expMask = 0x4000; (sample & expMask) === 0 && exp > 0; exp--, expMask >>= 1) {}
  const mant = (sample >> (exp + 3)) & 0x0F;
  return ~(sign | (exp << 4) | mant) & 0xFF;
}
