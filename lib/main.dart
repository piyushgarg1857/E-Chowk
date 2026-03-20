import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'worker_screen.dart';
import 'employer_screen.dart';

void main() {
  runApp(const LabourChowkApp());
}

class LabourChowkApp extends StatelessWidget {
  const LabourChowkApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'E-Chowk',
      theme: ThemeData(
        fontFamily: 'Inter',
        primaryColor: const Color(0xFF3F51B5), // Indigo blue from the reference
        scaffoldBackgroundColor: const Color(0xFFF5F7FA), // Light cool background
        colorScheme: ColorScheme.fromSwatch().copyWith(
          primary: const Color(0xFF3F51B5),
          secondary: const Color(0xFF4CAF50), // Green for available
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF3F51B5),
          elevation: 0,
          centerTitle: true,
          titleTextStyle: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      home: const RoleSelectionScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class RoleSelectionScreen extends StatelessWidget {
  const RoleSelectionScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // For Keypad phones on web, we use raw keyboard listener to select roles.
    return Scaffold(
      appBar: AppBar(title: const Text('E-Chowk')),
      body: Focus(
        autofocus: true,
        onKeyEvent: (node, event) {
          if (event is KeyDownEvent) {
            if (event.logicalKey == LogicalKeyboardKey.digit1) {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const WorkerScreen()));
              return KeyEventResult.handled;
            } else if (event.logicalKey == LogicalKeyboardKey.digit2) {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const EmployerScreen()));
              return KeyEventResult.handled;
            }
          }
          return KeyEventResult.ignored;
        },
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'आप कौन हैं?\n(Who are you?)',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF3F51B5)),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              _buildRoleCard(
                context,
                title: 'काम चाहिए (Worker)',
                subtitle: 'Press 1 on Keypad',
                icon: Icons.handyman,
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WorkerScreen())),
              ),
              const SizedBox(height: 20),
              _buildRoleCard(
                context,
                title: 'काम देना है (Employer)',
                subtitle: 'Press 2 on Keypad',
                icon: Icons.business_center,
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const EmployerScreen())),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRoleCard(BuildContext context, {required String title, required String subtitle, required IconData icon, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
          ],
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 30,
              backgroundColor: const Color(0xFFE8EAF6),
              child: Icon(icon, size: 30, color: const Color(0xFF3F51B5)),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(subtitle, style: const TextStyle(fontSize: 14, color: Colors.grey)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}
