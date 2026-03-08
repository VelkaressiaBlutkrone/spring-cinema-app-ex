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
    this.isLoading = false,
  });

  final String label;
  final VoidCallback onPressed;
  final bool isPrimary;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final bool isDisabled = isLoading;
    return GestureDetector(
      onTap: isDisabled ? null : onPressed,
      child: AnimatedOpacity(
        opacity: isDisabled ? 0.6 : 1.0,
        duration: const Duration(milliseconds: 200),
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
            boxShadow: isDisabled
                ? []
                : [
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
            child: isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.black,
                    ),
                  )
                : Text(
                    label,
                    style: GoogleFonts.bebasNeue(
                      fontSize: 18,
                      color: isPrimary ? Colors.black : CinemaColors.textPrimary,
                      letterSpacing: 2,
                    ),
                  ),
          ),
        ),
      ),
    );
  }
}
