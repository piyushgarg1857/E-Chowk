import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class WorkerScreen extends StatefulWidget {
  const WorkerScreen({Key? key}) : super(key: key);

  @override
  State<WorkerScreen> createState() => _WorkerScreenState();
}

class _WorkerScreenState extends State<WorkerScreen> {
  bool isAvailable = true;

  void toggleAvailability() {
    setState(() {
      isAvailable = !isAvailable;
    });
  }

  void startVoiceAgent() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Starting Voice Agent (Vapi.ai)...')),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Top User Profile Card
    final profileCard = Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Color(0xFF3F51B5),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
      ),
      padding: const EdgeInsets.only(top: 20, bottom: 40, left: 24, right: 24),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          CircleAvatar(
            radius: 35,
            backgroundColor: Colors.white,
            child: Image.network(
              'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // Worker Avatar Avatar Placeholder
              width: 50,
            ),
          ),
          const SizedBox(width: 20),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Name:\nRAHUL - MAZDOOR', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                SizedBox(height: 8),
                Text('Location:\nLocal Chowk, Delhi', style: TextStyle(color: Colors.white70, fontSize: 14)),
              ],
            ),
          ),
        ],
      ),
    );

    // Availability Toggle
    final availabilityToggle = Column(
      children: [
        const Text('Daily Availability\nToggle', textAlign: TextAlign.center, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        GestureDetector(
          onTap: toggleAvailability,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
            decoration: BoxDecoration(
              color: isAvailable ? const Color(0xFFE8F5E9) : const Color(0xFFEEEEEE),
              borderRadius: BorderRadius.circular(50),
              border: Border.all(color: isAvailable ? Colors.green : Colors.grey, width: 2),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  isAvailable ? Icons.sentiment_satisfied_alt : Icons.sentiment_very_dissatisfied,
                  color: isAvailable ? Colors.green : Colors.grey,
                  size: 30,
                ),
                const SizedBox(width: 10),
                Text(
                  isAvailable ? 'AVAILABLE (1)' : 'NOT AVAILABLE (1)',
                  style: TextStyle(
                    color: isAvailable ? Colors.green : Colors.grey,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(width: 10),
                Icon(isAvailable ? Icons.check_circle : Icons.cancel, color: isAvailable ? Colors.green : Colors.grey, size: 30),
              ],
            ),
          ),
        ),
      ],
    );

    // Voice Note Area
    final voiceNoteArea = Column(
      children: [
        Container(
          padding: const EdgeInsets.all(30),
          decoration: BoxDecoration(
            color: const Color(0xFFE8EAF6),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 5)),
            ],
          ),
          child: const Icon(Icons.mic, size: 80, color: Color(0xFF3F51B5)),
        ),
        const SizedBox(height: 20),
        const Text(
          'VOICE NOTE:\nSend your work request\nor availability',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Colors.black87),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: startVoiceAgent,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF3F51B5),
            padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 15),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
          ),
          child: const Text('SEND VOICE (Press 2)', style: TextStyle(fontSize: 18, color: Colors.white, fontWeight: FontWeight.bold)),
        ),
      ],
    );

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Worker Interface'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Focus(
        autofocus: true,
        // Listen to Keypad inputs for feature phone web app compatibility
        onKeyEvent: (node, event) {
          if (event is KeyDownEvent) {
            if (event.logicalKey == LogicalKeyboardKey.digit1) {
              toggleAvailability();
              return KeyEventResult.handled;
            } else if (event.logicalKey == LogicalKeyboardKey.digit2) {
              startVoiceAgent();
              return KeyEventResult.handled;
            }
          }
          return KeyEventResult.ignored;
        },
        child: SingleChildScrollView(
          child: Column(
            children: [
              profileCard,
              const SizedBox(height: 30),
              availabilityToggle,
              const SizedBox(height: 50),
              voiceNoteArea,
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
