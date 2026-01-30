// 2026 Modern Premium Cinematic Theme
// Deep black charcoal, neon accents, glassmorphism 2.0
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class CinemaColors {
  static const Color background = Color(0xFF0A0A0A);
  static const Color surface = Color(0xFF121212);
  static const Color surfaceElevated = Color(0xFF1A1A1A);

  static const Color neonRed = Color(0xFFE63946);
  static const Color neonBlue = Color(0xFF00D4FF);
  static const Color neonAmber = Color(0xFFFFC857);
  static const Color neonPurple = Color(0xFF9D4EDD);

  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFB0B0B0);
  static const Color textMuted = Color(0xFF707070);

  static const Color glassWhite = Color(0x18FFFFFF);
  static const Color glassBorder = Color(0x30FFFFFF);
  static const Color glassHighlight = Color(0x08FFFFFF);

  /// 좌석 상태 색상 (웹 SeatMap과 동일)
  static const Color seatAvailable = Color(0xFF22c55e);   // 예매 가능
  static const Color seatMyHold = Color(0xFF3b82f6);     // 내 선택
  static const Color seatOtherHold = Color(0xFFf59e0b);  // 다른 고객 선택
  static const Color seatReserved = Color(0xFFef4444);   // 예매 완료
  static const Color seatBlocked = Color(0xFF4b5563);    // 운영 차단
}

class CinemaTheme {
  static ThemeData get dark {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: CinemaColors.background,
      colorScheme: const ColorScheme.dark(
        primary: CinemaColors.neonBlue,
        secondary: CinemaColors.neonRed,
        surface: CinemaColors.surface,
        error: CinemaColors.neonRed,
        onPrimary: Colors.black,
        onSecondary: Colors.white,
        onSurface: CinemaColors.textPrimary,
        onError: Colors.white,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.bebasNeue(
          fontSize: 32,
          color: CinemaColors.textPrimary,
          letterSpacing: 2,
        ),
        displayMedium: GoogleFonts.bebasNeue(
          fontSize: 24,
          color: CinemaColors.textPrimary,
          letterSpacing: 1.5,
        ),
        headlineMedium: GoogleFonts.bebasNeue(
          fontSize: 20,
          color: CinemaColors.textPrimary,
          letterSpacing: 1,
        ),
        titleLarge: GoogleFonts.bebasNeue(
          fontSize: 18,
          color: CinemaColors.textPrimary,
        ),
        bodyLarge: GoogleFonts.roboto(
          fontSize: 16,
          color: CinemaColors.textPrimary,
        ),
        bodyMedium: GoogleFonts.roboto(
          fontSize: 14,
          color: CinemaColors.textSecondary,
        ),
        bodySmall: GoogleFonts.roboto(
          fontSize: 12,
          color: CinemaColors.textMuted,
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.bebasNeue(
          fontSize: 24,
          color: CinemaColors.textPrimary,
          letterSpacing: 2,
        ),
      ),
    );
  }
}
