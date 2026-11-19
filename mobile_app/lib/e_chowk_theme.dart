import 'package:flutter/material.dart';

class EChowkTheme {
  static const navy = Color(0xFF102A43);
  static const navyDark = Color(0xFF0B1F33);
  static const emerald = Color(0xFF168A5B);
  static const saffron = Color(0xFFE28A19);
  static const surface = Color(0xFFF8F6F0);
  static const text = Color(0xFF17202A);
  static const muted = Color(0xFF68737D);

  static ThemeData light() {
    final scheme = ColorScheme.fromSeed(
      seedColor: navy,
      brightness: Brightness.light,
    ).copyWith(
      primary: navy,
      secondary: emerald,
      tertiary: saffron,
      surface: surface,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: surface,
      fontFamily: 'Inter',
      appBarTheme: const AppBarTheme(
        backgroundColor: navy,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
      ),
    );
  }

  static ButtonStyle primaryButton() => ElevatedButton.styleFrom(
    backgroundColor: navy,
    foregroundColor: Colors.white,
    minimumSize: const Size.fromHeight(48),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
  );

  static ButtonStyle emeraldButton() => ElevatedButton.styleFrom(
    backgroundColor: emerald,
    foregroundColor: Colors.white,
    minimumSize: const Size.fromHeight(48),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
  );
}

class EChowkBadge extends StatelessWidget {
  final String text;
  final IconData icon;
  final Color color;

  const EChowkBadge({
    super.key,
    required this.text,
    required this.icon,
    this.color = EChowkTheme.emerald,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .10),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 15, color: color),
          const SizedBox(width: 5),
          Text(text, style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 12)),
        ],
      ),
    );
  }
}
