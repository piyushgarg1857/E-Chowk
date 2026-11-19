import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'config.dart';
import 'services/session.dart';
import 'e_chowk_theme.dart';

class VoiceAIScreen extends StatefulWidget {
  const VoiceAIScreen({super.key});

  @override
  State<VoiceAIScreen> createState() => _VoiceAIScreenState();
}

class _VoiceAIScreenState extends State<VoiceAIScreen> {
  bool _calling = false;

  Future<void> startCall() async {
    if (AppSession.accessToken == null) {
      if (!mounted) return;
      Navigator.pop(context);
      return;
    }
    setState(() => _calling = true);
    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/voice/register-call'),
        headers: AppSession.authHeaders,
        body: jsonEncode({}),
      );
      final data = jsonDecode(response.body);
      if (!mounted) return;
      if (response.statusCode >= 200 && response.statusCode < 300) {
        showDialog(context: context, builder: (_) => AlertDialog(
          title: const Text('AI call शुरू हो गई'),
          content: Text(data['message']?.toString() ?? 'अपने registered number पर call उठाइए और Hindi में बात कीजिए।'),
          actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('ठीक है'))],
        ));
      } else {
        throw Exception(data['message'] ?? 'Call start failed');
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Call शुरू नहीं हो पाई: $e')));
    } finally {
      if (mounted) setState(() => _calling = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Voice AI / बोलकर काम')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(children: [
          const SizedBox(height: 12),
          Container(
            width: 150, height: 150,
            decoration: BoxDecoration(color: EChowkTheme.emerald.withValues(alpha: .10), shape: BoxShape.circle),
            child: const Icon(Icons.mic_rounded, size: 72, color: EChowkTheme.emerald),
          ),
          const SizedBox(height: 24),
          const Text('बोलिए, ई-चौक समझेगा', textAlign: TextAlign.center, style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: EChowkTheme.text)),
          const SizedBox(height: 10),
          const Text('Smartphone इस्तेमाल करना जरूरी नहीं. AI voice call पर Hindi में profile, skills, availability और काम की जानकारी संभालने में मदद मिलेगी.', textAlign: TextAlign.center, style: TextStyle(color: EChowkTheme.muted, fontSize: 15, height: 1.45)),
          const SizedBox(height: 24),
          Card(child: Padding(padding: const EdgeInsets.all(18), child: Column(children: const [
            _Step(icon: Icons.call_outlined, text: 'अपने registered number पर call'),
            _Step(icon: Icons.record_voice_over_outlined, text: 'Hindi में अपनी बात बताएं'),
            _Step(icon: Icons.person_outline, text: 'AI profile information संभालेगा'),
            _Step(icon: Icons.work_outline, text: 'Relevant काम के updates पाएं'),
          ]))),
          const SizedBox(height: 22),
          ElevatedButton.icon(
            onPressed: _calling ? null : startCall,
            style: EChowkTheme.emeraldButton(),
            icon: _calling ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.phone_in_talk_rounded),
            label: Text(_calling ? 'Call connect हो रही है…' : 'AI Call शुरू करें'),
          ),
          const SizedBox(height: 10),
          const Text('Voice AI actual telephony provider/backend के through चलेगा.', textAlign: TextAlign.center, style: TextStyle(fontSize: 11, color: EChowkTheme.muted)),
        ]),
      ),
    );
  }
}

class _Step extends StatelessWidget {
  final IconData icon;
  final String text;
  const _Step({required this.icon, required this.text});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 13),
    child: Row(children: [
      Icon(icon, color: EChowkTheme.emerald, size: 21),
      const SizedBox(width: 12),
      Expanded(child: Text(text, style: const TextStyle(fontWeight: FontWeight.w600))),
    ]),
  );
}
