import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Mic,
  Phone,
  MessageCircle,
  ArrowRight,
  BriefcaseBusiness,
  ShieldCheck,
  UserRound,
  UsersRound,
  Clock3,
  Check,
  Volume2,
  VolumeX,
  Languages,
  Sparkles,
  Send,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Tool, ToolHeader, ToolContent } from "@/components/ai-elements/tool";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useDemo } from "@/lib/e-chowk/store";
import { mockMarketplaceService } from "@/lib/e-chowk/mock-service";
import {
  AppShell,
  PageHeading,
  Brand,
  Pill,
  IconBox,
  JobCard,
  Confirm,
  DemoNote,
  ArchitectureStrip,
} from "./shared";
import { toast } from "sonner";
export function VoiceExperience() {
  const { jobs, role, currentUser, live, sendAgentMessage, refresh } = useDemo();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [typedInput, setTypedInput] = useState("");
  const [history, setHistory] = useState<
    Array<{ id: string; role: "user" | "assistant"; text: string; time: string }>
  >([
    {
      id: "initial",
      role: "assistant",
      text: "नमस्ते! मैं ई-चौक लाइव वॉइस असिस्टेंट हूँ। आप माइक दबाकर सीधे हिंदी या English में बोल सकते हैं—जैसे अपना नाम, हुनर, शहर बदलना या काम खोजना। बोलिए, मैं सुन रहा हूँ!",
      time: "Just now",
    },
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = typeof window !== "undefined" ? (window as unknown as Record<string, any>) : {};
    const SpeechRecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "hi-IN";

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let current = "";
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error !== "no-speech") {
          toast.error(`Microphone notice: ${event.error}. You can also type below.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn("Speech recognition not initialized:", e);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#_~`]/g, "");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "hi-IN";
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().includes("hi") ||
        v.lang.toLowerCase().includes("in") ||
        v.name.toLowerCase().includes("india"),
    );
    if (hindiVoice) utterance.voice = hindiVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleSend = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isProcessing) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    stopSpeaking();

    const userMsgId = crypto.randomUUID();
    const userMsg = {
      id: userMsgId,
      role: "user" as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setHistory((prev) => [...prev, userMsg]);
    setTranscript("");
    setTypedInput("");
    setIsProcessing(true);

    try {
      let reply = "";
      if (live) {
        const res = await sendAgentMessage(text);
        reply = res?.reply || "आपकी बात नोट कर ली गई है।";
        await refresh();
      } else {
        const understood = await mockMarketplaceService.understand(text, role, jobs);
        reply =
          understood.parts.map((p) => p.text).join(" ") ||
          "मैंने आपकी बात समझ ली है। कृपया अपने वर्कस्पेस में चेक करें।";
      }

      const botMsg = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setHistory((prev) => [...prev, botMsg]);
      speak(reply);
    } catch {
      toast.error("AI Assistant request failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      if (transcript.trim()) {
        void handleSend(transcript);
      }
    } else {
      stopSpeaking();
      setTranscript("");
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          toast.info("Microphone ready. Speak clearly into your mic.");
        }
      } else {
        toast.info("Browser speech recognition not detected. You can type in Hindi/English below!");
      }
    }
  };

  const presets = [
    "मेरा नाम राहुल है, मैं जयपुर में बढ़ई हूँ और ₹850 रोज़ लेता हूँ",
    "मुझे कल के लिए 2 पेंटर चाहिए ₹700 में",
    "जयपुर में उपलब्ध इलेक्ट्रीशियन के काम दिखाओ",
    "मेरी प्रोफाइल और दैनिक मजदूरी चेक करो",
  ];

  return (
    <AppShell>
      <div className="voice-page">
        <div className="between">
          <Link to="/" className="text-link">
            ← Back to E-Chowk
          </Link>
          <div className="flex items-center gap-2">
            <Pill tone="success">LIVE IN-APP VOICE AI</Pill>
            {live && (
              <Pill tone="neutral">
                {currentUser?.role === "employer" ? "Employer" : "Worker"} · {currentUser?.full_name || "Active"}
              </Pill>
            )}
          </div>
        </div>

        <div className="voice-main">
          <span className="section-kicker justify-center">
            <Languages className="h-4 w-4" />
            HINDI-FIRST VOICE ASSISTANT · बोलकर काम करें
          </span>
          <h1>
            Live Voice AI<span className="bilingual-subtext">अपनी बात बोलिए, ई-चौक समझेगा</span>
          </h1>
          <p>
            {isListening
              ? "सुन रहा हूँ… अपनी बात बोलिए (Finish speaking to send)"
              : isProcessing
                ? "AI समझ रहा है और आपके काम को अपडेट कर रहा है…"
                : isSpeaking
                  ? "AI बोल रहा है… सुनिए"
                  : "माइक दबाकर बोलिए या नीचे लिखकर अपना काम करवाइए"}
          </p>

          <Button
            aria-label={isListening ? "Stop listening and send" : "Start speaking"}
            onClick={toggleListen}
            disabled={isProcessing}
            className={`mic-button ${isListening ? "listening" : ""} ${isSpeaking ? "speaking animate-pulse" : ""}`}
          >
            {isListening ? <Square className="h-6 w-6" /> : isSpeaking ? <Volume2 className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          <div
            className={`voice-wave ${isListening || isSpeaking ? "listening" : ""}`}
            aria-hidden="true"
          >
            {Array.from({ length: 19 }, (_, i) => (
              <span key={i} />
            ))}
          </div>

          <strong className="block small text-success" aria-live="polite">
            {isListening
              ? "Listening… बोलिए (समाप्त करने के लिए फिर से क्लिक करें)"
              : isProcessing
                ? "Processing with Groq Llama 3.3 70B AI…"
                : isSpeaking
                  ? "Speaking reply in Hindi…"
                  : "Tap mic to speak · माइक दबाकर बोलें"}
          </strong>

          {transcript && (
            <div className="mt-3 p-3 bg-muted/60 border rounded-xl text-sm font-medium text-foreground max-w-lg mx-auto">
              <span className="text-muted-foreground text-xs block mb-1">आप बोल रहे हैं:</span>
              “{transcript}”
              <div className="mt-2 flex justify-center gap-2">
                <Button size="sm" onClick={() => void handleSend(transcript)} disabled={isProcessing}>
                  Send this <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setTranscript("")}>
                  Clear
                </Button>
              </div>
            </div>
          )}

          {isSpeaking && (
            <div className="mt-2">
              <Button size="sm" variant="outline" onClick={stopSpeaking} className="text-xs">
                <VolumeX className="h-3.5 w-3.5 mr-1" />
                Mute Voice / आवाज़ रोकें
              </Button>
            </div>
          )}

          {/* Quick presets */}
          <div className="mt-5 max-w-xl mx-auto">
            <span className="text-xs text-muted-foreground block mb-2">
              💡 Example commands · आप ऐसा बोल सकते हैं:
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => void handleSend(preset)}
                  className="text-xs bg-card hover:bg-accent border px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer"
                >
                  “{preset}”
                </button>
              ))}
            </div>
          </div>

          {/* Fallback Text Input */}
          <div className="mt-6 max-w-lg mx-auto w-full">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (typedInput.trim()) void handleSend(typedInput);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="यहाँ हिंदी या English में टाइप भी कर सकते हैं…"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                disabled={isProcessing}
                className="input flex-1 text-sm py-2 px-3 rounded-xl border bg-background"
              />
              <Button type="submit" size="sm" disabled={isProcessing || !typedInput.trim()}>
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
            </form>
          </div>
        </div>

        {/* Live Conversation Transcript */}
        <section className="panel mt-6">
          <div className="panel-title">
            <h3>Voice conversation · बातचीत का इतिहास</h3>
            <div className="flex items-center gap-2">
              <Pill tone="success">Real-Time Sync</Pill>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setHistory([
                    {
                      id: "initial",
                      role: "assistant",
                      text: "नमस्ते! मैं ई-चौक हूँ। आपकी क्या मदद करूँ?",
                      time: "Just now",
                    },
                  ]);
                }}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="voice-transcript">
            {history.map((msg) => (
              <div key={msg.id} className="transcript-line">
                <span className={`avatar ${msg.role === "assistant" ? "tone-1" : ""}`}>
                  {msg.role === "assistant" ? <Sparkles className="h-4 w-4" /> : "ME"}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <strong>{msg.role === "assistant" ? "E-CHOWK AI" : "YOU"}</strong>
                    <span className="text-[11px] text-muted-foreground">{msg.time}</span>
                  </div>
                  <p className="mt-1 text-sm">{msg.text}</p>
                  {msg.role === "assistant" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs mt-1 h-7 px-2"
                      onClick={() => speak(msg.text)}
                    >
                      <Volume2 className="h-3.5 w-3.5 mr-1" />
                      Listen again
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <hr className="rule" />
          <div className="flex-row small muted">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span>
              Voice/Text input → Llama 3.3 70B AI intent parsing → backend tools (update profile, post job, find matches) → Hindi speech reply.
            </span>
          </div>
        </section>

        <div className="mt-5 flex justify-center gap-3">
          <Button asChild className="button-large">
            <Link to={role === "employer" ? "/employer" : "/worker"}>
              View Your Workspace <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="button-large">
            <Link to="/profile">
              <UserRound className="h-4 w-4 mr-1" />
              Check Profile
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
export function Assistant() {
  const { messages, setMessages, jobs, role, apply, live, sendAgentMessage } = useDemo();
  const [status, setStatus] = useState<"ready" | "submitted">("ready");
  const [input, setInput] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const mounted = useRef(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  useEffect(() => {
    mounted.current = true;
    textarea.current?.focus();
    return () => {
      mounted.current = false;
    };
  }, []);
  async function send(text: string) {
    if (!text.trim() || status === "submitted") return;
    const msg = {
      id: crypto.randomUUID(),
      role: "user" as const,
      parts: [{ type: "text" as const, text }],
    };
    setMessages((prev) => [...prev, msg]);
    setStatus("submitted");
    setInput("");
    textarea.current?.focus();
    try {
      if (live) {
        await sendAgentMessage(text);
      } else {
        const result = await mockMarketplaceService.understand(text, role, jobs);
        if (!mounted.current) return;
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", ...result }]);
      }
    } catch {
      if (mounted.current)
        toast.error("The assistant could not complete this request. Please try again.");
    } finally {
      if (mounted.current) {
        setStatus("ready");
        textarea.current?.focus();
      }
    }
  }
  const suggested = jobs.find((j) => j.status === "open" && j.required_skill === "Plumber");
  return (
    <AppShell>
      <PageHeading
        title="AI Assistant"
        hindi="Chat in Hindi or English · लिखकर अपनी बात कहिए"
        action={
          <Button variant="outline" size="sm" onClick={() => setHistoryOpen(!historyOpen)}>
            <Clock3 />
            Session history ({messages.filter((m) => m.role === "user").length})
          </Button>
        }
      />
      {historyOpen && (
        <div className="panel mb-5">
          <h3>This conversation</h3>
          <p className="small muted mt-2">
            Session-only history. A page refresh clears the demo conversation.
          </p>
          {messages.filter((m) => m.role === "user").length ? (
            messages
              .filter((m) => m.role === "user")
              .map((m) => (
                <p key={m.id} className="small mt-3">
                  {m.parts.map((p) => p.text).join(" ")}
                </p>
              ))
          ) : (
            <p className="small muted mt-3">Your messages will appear here.</p>
          )}
        </div>
      )}
      <div
        className={`chat-layout ${messages.some((m) => m.role === "user") ? "" : "chat-layout-empty"}`}
      >
        <section className="chat-main">
          <div className="chat-header">
            <div className="flex-row">
              <Brand compact />
              <span className="dot" />
            </div>
            <Pill tone="neutral">{live ? "Live AI assistant" : "Simulated assistant"}</Pill>
          </div>
          <Conversation
            className="chat-transcript"
            initial={messages.some((m) => m.role === "user") ? "smooth" : false}
            resize="smooth"
          >
            <ConversationContent className="chat-message-stack">
              {messages.map((m) => (
                <Message key={m.id} from={m.role}>
                  <MessageContent>
                    <>
                      {m.parts.map((part, i) =>
                        part.type === "text" ? (
                          <MessageResponse key={i}>{part.text}</MessageResponse>
                        ) : null,
                      )}
                      {m.tool && (
                        <Tool defaultOpen={false} className="mt-4">
                          <ToolHeader
                            type="tool-marketplace"
                            state="output-available"
                            title="Marketplace action · simulated"
                          />
                          <ToolContent>
                            <div className="notice">
                              <ShieldCheck />
                              <span>{m.tool}</span>
                            </div>
                            <p className="small muted mt-3">
                              No direct database access. Backend permission checks are represented
                              here as a simulation.
                            </p>
                          </ToolContent>
                        </Tool>
                      )}
                      {m.tool?.includes("find_job") && suggested && (
                        <div className="mt-3">
                          <Link
                            to="/jobs/$jobId"
                            params={{ jobId: suggested.id }}
                            className="text-link"
                          >
                            Review {suggested.title} <ArrowRight />
                          </Link>
                          <div className="mt-3">
                            <Confirm
                              title="Apply for this sample job?"
                              description={`${suggested.title} · ₹${suggested.offered_wage}/day. The backend must check role, open status, and duplicates.`}
                              trigger={<Button size="sm">Confirm application</Button>}
                              onConfirm={() => apply(suggested)}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  </MessageContent>
                </Message>
              ))}
              {!messages.some((m) => m.role === "user") && (
                <div className="chat-starters">
                  <h3>What can we do today?</h3>
                  <p className="muted small">कैसे मदद करूँ?</p>
                  <div className="starter-grid">
                    {[
                      {
                        label: role === "employer" ? "Find workers" : "Find a job",
                        hindi: role === "employer" ? "कामगार ढूँढें" : "काम ढूँढें",
                        icon: role === "employer" ? UsersRound : BriefcaseBusiness,
                        prompt:
                          role === "employer"
                            ? "Find a plumber worker near Mansarovar."
                            : "Bhai mujhe kal Jaipur mein plumber ka kaam chahiye.",
                      },
                      {
                        label: "Update profile",
                        hindi: "प्रोफाइल बदलें",
                        icon: UserRound,
                        prompt: "Help me update my profile.",
                      },
                      {
                        label: "Check application",
                        hindi: "आवेदन की स्थिति",
                        icon: Clock3,
                        prompt: "Check my application status.",
                      },
                    ].map((starter) => (
                      <Button
                        key={starter.label}
                        variant="outline"
                        className="starter-prompt"
                        disabled={status === "submitted"}
                        onClick={() => void send(starter.prompt)}
                      >
                        <starter.icon />
                        <span>
                          {starter.label}
                          <small className="bilingual-subtext">{starter.hindi}</small>
                        </span>
                        <ArrowRight className="ml-auto" />
                      </Button>
                    ))}
                  </div>
                  <p className="starter-example">
                    {role === "employer"
                      ? "“Mansarovar mein kal ek plumber chahiye.”"
                      : "“Bhai, mujhe kal Jaipur mein plumber ka kaam chahiye.”"}
                  </p>
                </div>
              )}
              {status === "submitted" && (
                <Message from="assistant">
                  <MessageContent>
                    <Shimmer>समझ रहा हूँ… Understanding your request</Shimmer>
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
            {messages.some((m) => m.role === "user") && <ConversationScrollButton />}
          </Conversation>
          <div className="chat-composer">
            <PromptInput onSubmit={(msg) => send(msg.text)}>
              <PromptInputTextarea
                ref={textarea}
                aria-label="Message E-Chowk"
                placeholder="Kaam ke baare mein bataiye… Type in Hindi or English"
                value={input}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              />
              <PromptInputFooter>
                <Button asChild variant="ghost" size="sm" title="Voice AI / बोलकर काम">
                  <Link to="/voice">
                    <Mic /> Voice AI
                  </Link>
                </Button>
                <span className="text-xs text-muted-foreground">हिंदी / English</span>
                <PromptInputSubmit
                  status={status}
                  disabled={status === "submitted" || !input.trim()}
                  aria-label="Send message"
                />
              </PromptInputFooter>
            </PromptInput>
            <p className="chat-footnote">
              {live ? "Live AI responses · Backend agent connected. You confirm every consequential action." : "Mock AI responses · No live model calls. You confirm every consequential action."}
            </p>
          </div>
        </section>
        <aside className="chat-aside">
          {messages.some((m) => m.role === "user") && (
            <section className="panel">
              <h3>What can we do today?</h3>
              <p>कैसे मदद करूँ?</p>
              <div className="context-actions">
                {[
                  {
                    text: "Find a job",
                    icon: BriefcaseBusiness,
                    prompt: "Bhai mujhe kal Jaipur mein plumber ka kaam chahiye.",
                  },
                  { text: "Update profile", icon: UserRound, prompt: "Help me update my profile." },
                  {
                    text: "Check application",
                    icon: Clock3,
                    prompt: "Check my application status.",
                  },
                  {
                    text: "Find workers",
                    icon: UsersRound,
                    prompt: "Find a plumber worker near Mansarovar.",
                  },
                ].map((c) => (
                  <Button
                    key={c.text}
                    disabled={status === "submitted"}
                    variant="outline"
                    onClick={() => void send(c.prompt)}
                  >
                    <c.icon />
                    {c.text}
                    <ArrowRight className="ml-auto" />
                  </Button>
                ))}
              </div>
            </section>
          )}
          <section className="panel">
            <IconBox tone="green">
              <ShieldCheck />
            </IconBox>
            <h3 className="mt-4">You stay in control.</h3>
            <p>
              AI interprets your request. The backend validates the action. You confirm before
              anything changes.
            </p>
            <Link to="/architecture" className="text-link mt-4">
              How AI works <ArrowRight />
            </Link>
          </section>
          <DemoNote>
            Advanced AI tool calling is coming soon. This conversation is a UI simulation with
            session-only history.
          </DemoNote>
        </aside>
      </div>
    </AppShell>
  );
}