import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../theme/cinema_theme.dart';

class CinemaHomeHero extends StatelessWidget {
  const CinemaHomeHero({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.fromLTRB(24, 32, 24, 32),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              CinemaColors.neonRed.withValues(alpha: 0.2),
              CinemaColors.neonBlue.withValues(alpha: 0.1),
              CinemaColors.surface,
            ],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '영화관 예매',
              style: GoogleFonts.bebasNeue(
                fontSize: 36,
                color: CinemaColors.textPrimary,
                letterSpacing: 4,
                shadows: [
                  Shadow(
                    color: CinemaColors.neonBlue.withValues(alpha: 0.3),
                    blurRadius: 20,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '상영 중인 영화를 확인하고 편리하게 예매하세요.',
              style: GoogleFonts.roboto(
                fontSize: 14,
                color: CinemaColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
