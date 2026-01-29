import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/cinema_theme.dart';

/// Bold CTA button with soft inner glow and hover-like shine
class NeonButton extends StatelessWidget {
  const NeonButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isPrimary = true,
  });

  final String label;
  final VoidCallback onPressed;
  final bool isPrimary;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isPrimary
                ? [
                    CinemaColors.neonBlue.withValues(alpha: 0.9),
                    CinemaColors.neonBlue.withValues(alpha: 0.6),
                  ]
                : [
                    CinemaColors.glassWhite,
                    CinemaColors.glassWhite.withValues(alpha: 0.5),
                  ],
          ),
          boxShadow: [
            BoxShadow(
              color: (isPrimary ? CinemaColors.neonBlue : CinemaColors.neonAmber)
                  .withValues(alpha: 0.4),
              blurRadius: 16,
              spreadRadius: 0,
            ),
            BoxShadow(
              color: (isPrimary ? CinemaColors.neonBlue : Colors.white)
                  .withValues(alpha: 0.2),
              blurRadius: 8,
              spreadRadius: -2,
            ),
          ],
        ),
        child: Center(
          child: Text(
            label,
            style: GoogleFonts.bebasNeue(
              fontSize: 18,
              color: isPrimary ? Colors.black : CinemaColors.textPrimary,
              letterSpacing: 2,
            ),
          ),
        ),
      ),
    );
  }
}
