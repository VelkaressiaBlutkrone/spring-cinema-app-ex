import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../theme/cinema_theme.dart';
import '../../../theme/cinema_animations.dart';

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
            ShaderMask(
              shaderCallback: (bounds) => LinearGradient(
                colors: [
                  CinemaColors.textPrimary,
                  CinemaColors.neonBlue.withValues(alpha: 0.9),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ).createShader(bounds),
              child: Text(
                '영화관 예매',
                style: GoogleFonts.bebasNeue(
                  fontSize: 36,
                  color: Colors.white,
                  letterSpacing: 4,
                  shadows: [
                    Shadow(
                      color: CinemaColors.neonBlue.withValues(alpha: 0.5),
                      blurRadius: 24,
                    ),
                    Shadow(
                      color: CinemaColors.neonBlue.withValues(alpha: 0.2),
                      blurRadius: 60,
                    ),
                  ],
                ),
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
    )
        .animate()
        .fadeIn(duration: CinemaAnimations.normal, curve: CinemaAnimations.defaultCurve)
        .slideY(
          begin: 0.05,
          end: 0,
          duration: CinemaAnimations.slow,
          curve: CinemaAnimations.defaultCurve,
        );
  }
}
