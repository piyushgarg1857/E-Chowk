import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'config.dart';
import 'services/session.dart';
import 'e_chowk_theme.dart';

class AssistantScreen extends StatefulWidget {
  const AssistantScreen({super.key});

  @override
  State<AssistantScreen> createState() => _AssistantScreenState();
}

class _AssistantScreenState extends State<AssistantScreen> {
  final _controller = TextEditingController();
  final List<_Message> _messages = [];
  bool _sending = false;

  Future<void> send() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _sending) return;
    _controller.clear();
    setState(() {
      _messages.add(_Message(text, true));
      _sending = true;
    });
    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/agent/message'),
        headers: AppSession.authHeaders,
        body: jsonEncode({'message': text}),
      );
      final data = jsonDecode(response.body);
      final reply = data['reply'] ?? data['message'] ?? 'मैं अभी आपकी मदद नहीं कर पाया।';
      if (mounted) setState(() => _messages.add(_Message(reply.toString(), false)));
    } catch (_) {
      if (mounted) setState(() => _messages.add(const _Message('Server से connection नहीं हो पाया। बाद में फिर कोशिश करें।', false)));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI Assistant')),
      body: Column(children: [
        Expanded(
          child: _messages.isEmpty
              ? const _EmptyAssistant()
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _messages.length,
                  itemBuilder: (_, i) {
                    final m = _messages[i];
                    return Align(
                      alignment: m.mine ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        constraints: const BoxConstraints(maxWidth: 340),
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(13),
                        decoration: BoxDecoration(
                          color: m.mine ? EChowkTheme.navy : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(m.text, style: TextStyle(color: m.mine ? Colors.white : EChowkTheme.text, height: 1.35)),
                      ),
                    );
                  },
                ),
        ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
            child: Row(children: [
              Expanded(child: TextField(
                controller: _controller,
                minLines: 1,
                maxLines: 4,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => send(),
                decoration: const InputDecoration(hintText: 'जैसे: मेरे लिए electrician का काम खोजो'),
              )),
              const SizedBox(width: 8),
              IconButton.filled(
                onPressed: _sending ? null : send,
                icon: _sending ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.arrow_upward_rounded),
              ),
            ]),
          ),
        ),
      ]),
    );
  }
}

class _EmptyAssistant extends StatelessWidget {
  const _EmptyAssistant();
  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(28),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: const [
        Icon(Icons.auto_awesome_rounded, size: 50, color: EChowkTheme.saffron),
        SizedBox(height: 16),
        Text('मैं ई-चौक में आपकी मदद कर सकता हूँ', textAlign: TextAlign.center, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: EChowkTheme.text)),
        SizedBox(height: 8),
        Text('काम खोजें, job समझें या अगला step पूछें।', textAlign: TextAlign.center, style: TextStyle(color: EChowkTheme.muted)),
      ]),
    ),
  );
}

class _Message {
  final String text;
  final bool mine;
  const _Message(this.text, this.mine);
}
