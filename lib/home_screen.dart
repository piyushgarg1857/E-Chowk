import 'package:flutter/material.dart';
import 'e_chowk_theme.dart';
import 'voice_ai_screen.dart';
import 'assistant_screen.dart';

class HomeScreen extends StatelessWidget {
  final VoidCallback? onLogin;
  const HomeScreen({super.key, this.onLogin});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ई-चौक · E-Chowk', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          TextButton(
            onPressed: onLogin,
            child: const Text('Login', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: EChowkTheme.navy,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    EChowkBadge(text: 'भारत के कामगारों के लिए', icon: Icons.verified_outlined, color: Colors.white),
                    SizedBox(height: 18),
                    Text('काम ढूंढना और\nकाम देना आसान.', style: TextStyle(color: Colors.white, fontSize: 32, height: 1.05, fontWeight: FontWeight.w800)),
                    SizedBox(height: 12),
                    Text('एक ही चौक — worker, employer और AI सहायता के साथ.', style: TextStyle(color: Colors.white70, fontSize: 15, height: 1.4)),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              _ActionCard(
                icon: Icons.mic_none_rounded,
                title: 'Voice AI',
                subtitle: 'बोलकर काम — Hindi में AI से बात करें',
                color: EChowkTheme.emerald,
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const VoiceAIScreen())),
              ),
              const SizedBox(height: 12),
              _ActionCard(
                icon: Icons.auto_awesome_outlined,
                title: 'AI Assistant',
                subtitle: 'काम खोजें, profile समझें और next step पाएं',
                color: EChowkTheme.saffron,
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AssistantScreen())),
              ),
              const SizedBox(height: 24),
              const Text('आप ई-चौक पर क्या करना चाहते हैं?', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800, color: EChowkTheme.text)),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _RoleCard(icon: Icons.construction_rounded, title: 'काम चाहिए', subtitle: 'Worker', onTap: onLogin)),
                  const SizedBox(width: 12),
                  Expanded(child: _RoleCard(icon: Icons.business_center_rounded, title: 'काम देना है', subtitle: 'Employer', onTap: onLogin)),
                ],
              ),
              const SizedBox(height: 24),
              const Text('एक साझा marketplace', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: EChowkTheme.text)),
              const SizedBox(height: 10),
              const _FeatureRow(icon: Icons.person_search_outlined, text: 'Verified profiles और skill-based matching'),
              const _FeatureRow(icon: Icons.notifications_none_rounded, text: 'काम, application और booking updates'),
              const _FeatureRow(icon: Icons.security_outlined, text: 'OTP login और role-based access'),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;
  const _ActionCard({required this.icon, required this.title, required this.subtitle, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) => Card(
    child: InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Padding(
        padding: const EdgeInsets.all(17),
        child: Row(children: [
          Container(width: 48, height: 48, decoration: BoxDecoration(color: color.withValues(alpha: .12), borderRadius: BorderRadius.circular(14)), child: Icon(icon, color: color, size: 26)),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: EChowkTheme.text)),
            const SizedBox(height: 3),
            Text(subtitle, style: const TextStyle(color: EChowkTheme.muted, fontSize: 13)),
          ])),
          const Icon(Icons.arrow_forward_ios_rounded, size: 17, color: EChowkTheme.muted),
        ]),
      ),
    ),
  );
}

class _RoleCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  const _RoleCard({required this.icon, required this.title, required this.subtitle, required this.onTap});

  @override
  Widget build(BuildContext context) => Card(
    child: InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(icon, color: EChowkTheme.navy, size: 28),
          const SizedBox(height: 14),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w800, color: EChowkTheme.text)),
          Text(subtitle, style: const TextStyle(color: EChowkTheme.muted, fontSize: 12)),
        ]),
      ),
    ),
  );
}

class _FeatureRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _FeatureRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Row(children: [
      Icon(icon, color: EChowkTheme.emerald, size: 21),
      const SizedBox(width: 10),
      Expanded(child: Text(text, style: const TextStyle(color: EChowkTheme.text))),
    ]),
  );
}
