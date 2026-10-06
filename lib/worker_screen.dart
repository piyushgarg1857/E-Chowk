import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'config.dart';
import 'services/session.dart';

class WorkerScreen extends StatefulWidget {
  const WorkerScreen({Key? key}) : super(key: key);

  @override
  State<WorkerScreen> createState() => _WorkerScreenState();
}

class _WorkerScreenState extends State<WorkerScreen> with SingleTickerProviderStateMixin {
  bool isAvailable = true;
  bool _isCallingAI = false;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  final String apiUrl = apiBaseUrl;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))
      ..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.12).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void toggleAvailability() {
    setState(() { isAvailable = !isAvailable; });
  }

  // 🔥 REAL API CALL - registers worker via AI Voice Call
  Future<void> startAIRegistration() async {
    // Ask the user for their phone number
    final TextEditingController phoneCtrl = TextEditingController();
    final phone = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.phone_in_talk, color: Color(0xFF3F51B5), size: 28),
            SizedBox(width: 10),
            Text('AI Registration Call', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'हम आपको AI Voice Call करेंगे।\nकॉल उठाके Hindi में बात करें!',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 15, color: Colors.black87),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: phoneCtrl,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                labelText: 'आपका मोबाइल नंबर',
                prefixText: '+91 ',
                prefixIcon: const Icon(Icons.phone, color: Color(0xFF3F51B5)),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              style: const TextStyle(fontSize: 16, letterSpacing: 2),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, '+91${phoneCtrl.text.trim()}'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF3F51B5),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Call करें!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (phone == null || phone.length < 10) return;

    setState(() { _isCallingAI = true; });

    try {
      final response = await http.post(
        Uri.parse('$apiUrl/voice/call-worker'),
        headers: AppSession.authHeaders,
        body: jsonEncode({'phone': phone}),
      );

      final data = jsonDecode(response.body);

      if (data['success'] == true) {
        if (mounted) {
          showDialog(
            context: context,
            builder: (ctx) => AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: const Row(
                children: [
                  Icon(Icons.check_circle, color: Colors.green, size: 30),
                  SizedBox(width: 8),
                  Text('Call हो गई!', style: TextStyle(color: Colors.green)),
                ],
              ),
              content: const Text(
                'आपके फोन पर AI Call आ रही है!\nउठाइए और Hindi में बात कीजिए।\n\nनाम, Skill और शहर बताने पर\nE-Chowk पर register हो जाएंगे! 🎉',
                style: TextStyle(fontSize: 15),
              ),
              actions: [
                ElevatedButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                  child: const Text('OK 👍', style: TextStyle(color: Colors.white)),
                ),
              ],
            ),
          );
        }
      } else {
        throw Exception(data['message'] ?? 'Unknown error');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() { _isCallingAI = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: Focus(
        autofocus: true,
        onKeyEvent: (node, event) {
          if (event is KeyDownEvent) {
            if (event.logicalKey == LogicalKeyboardKey.digit1) {
              toggleAvailability();
              return KeyEventResult.handled;
            } else if (event.logicalKey == LogicalKeyboardKey.digit2) {
              startAIRegistration();
              return KeyEventResult.handled;
            }
          }
          return KeyEventResult.ignored;
        },
        child: CustomScrollView(
          slivers: [
            // ─── Gradient App Bar ──────────────────────────────────────────
            SliverAppBar(
              expandedHeight: 200,
              pinned: true,
              backgroundColor: const Color(0xFF3F51B5),
              leading: IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFF3F51B5), Color(0xFF5C6BC0), Color(0xFF7986CB)],
                    ),
                  ),
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Row(
                        children: [
                          Container(
                            width: 70, height: 70,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                            ),
                            child: const Icon(Icons.person, size: 40, color: Colors.white),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Text(
                                  'Worker Dashboard',
                                  style: TextStyle(color: Colors.white70, fontSize: 13, letterSpacing: 1),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'ई-चौक',
                                  style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: const Text(
                                    '📍 Nearby Workers Active',
                                    style: TextStyle(color: Colors.white, fontSize: 12),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    // ─── Availability Toggle ─────────────────────────────
                    _buildCard(
                      child: Column(
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.toggle_on_outlined, color: Color(0xFF3F51B5)),
                              const SizedBox(width: 8),
                              const Text(
                                'उपलब्धता (Availability)',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                              const Spacer(),
                              Switch(
                                value: isAvailable,
                                onChanged: (v) => setState(() => isAvailable = v),
                                activeColor: Colors.green,
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: isAvailable ? const Color(0xFFE8F5E9) : const Color(0xFFEEEEEE),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isAvailable ? Colors.green : Colors.grey,
                                width: 1.5,
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  isAvailable ? Icons.check_circle : Icons.cancel,
                                  color: isAvailable ? Colors.green : Colors.grey,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  isAvailable ? 'आज काम के लिए उपलब्ध हूँ ✅' : 'आज उपलब्ध नहीं हूँ ❌',
                                  style: TextStyle(
                                    color: isAvailable ? Colors.green.shade700 : Colors.grey.shade600,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // ─── AI Voice Registration Card ──────────────────────
                    _buildCard(
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(colors: [Color(0xFF3F51B5), Color(0xFF7986CB)]),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(Icons.smart_toy, color: Colors.white, size: 24),
                              ),
                              const SizedBox(width: 12),
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'AI Voice Registration',
                                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                    ),
                                    Text(
                                      'Hindi में बात करके register करें',
                                      style: TextStyle(fontSize: 12, color: Colors.grey),
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.green.shade50,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: Colors.green),
                                ),
                                child: const Text('FREE', style: TextStyle(color: Colors.green, fontSize: 11, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),

                          // Animated Mic Button
                          GestureDetector(
                            onTap: _isCallingAI ? null : startAIRegistration,
                            child: AnimatedBuilder(
                              animation: _pulseAnimation,
                              builder: (context, child) {
                                return Transform.scale(
                                  scale: _isCallingAI ? _pulseAnimation.value : 1.0,
                                  child: Container(
                                    width: 120, height: 120,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      gradient: LinearGradient(
                                        colors: _isCallingAI
                                            ? [Colors.red.shade400, Colors.red.shade700]
                                            : [const Color(0xFF3F51B5), const Color(0xFF7986CB)],
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: (_isCallingAI ? Colors.red : const Color(0xFF3F51B5)).withOpacity(0.4),
                                          blurRadius: 20,
                                          spreadRadius: 4,
                                        ),
                                      ],
                                    ),
                                    child: Icon(
                                      _isCallingAI ? Icons.phone_in_talk : Icons.mic,
                                      size: 55,
                                      color: Colors.white,
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _isCallingAI ? 'Calling... फ़ोन उठाइए! 📱' : 'PRESS 2 या यहाँ tap करें',
                            style: TextStyle(
                              color: _isCallingAI ? Colors.red : const Color(0xFF3F51B5),
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'AI आपसे Hindi में पूछेगी:\n नाम → Skill → शहर → Done! ✨',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.black54, fontSize: 13),
                          ),
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: _isCallingAI ? null : startAIRegistration,
                              icon: Icon(_isCallingAI ? Icons.hourglass_top : Icons.phone_in_talk),
                              label: Text(
                                _isCallingAI ? 'Call Coming...' : 'AI से Register करें (Press 2)',
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF3F51B5),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                disabledBackgroundColor: Colors.grey.shade300,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // ─── Info Steps ──────────────────────────────────────
                    _buildCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '📋 Registration कैसे होती है?',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          const SizedBox(height: 12),
                          _buildStep('1', 'Button दबाएं और अपना नंबर डालें'),
                          _buildStep('2', 'AI का फोन आएगा - उठाएं!'),
                          _buildStep('3', 'Hindi में:\n   नाम → Skill → शहर बताएं'),
                          _buildStep('4', 'E-Chowk पर काम मिलने लगेगा! 🎉'),
                        ],
                      ),
                    ),

                    const SizedBox(height: 30),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 15, offset: const Offset(0, 5)),
        ],
      ),
      child: child,
    );
  }

  Widget _buildStep(String number, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 26, height: 26,
            decoration: const BoxDecoration(color: Color(0xFF3F51B5), shape: BoxShape.circle),
            child: Center(child: Text(number, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold))),
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 14, color: Colors.black87, height: 1.4))),
        ],
      ),
    );
  }
}
