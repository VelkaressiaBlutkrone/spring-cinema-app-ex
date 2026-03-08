import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/cinema_theme.dart';

/// Bold CTA button with soft inner glow, press scale, and haptic feedback
class NeonButton extends StatefulWidget {
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
  State<NeonButton> createState() => _NeonButtonState();
}

class _NeonButtonState extends State<NeonButton> {
  bool _isPressed = false;

  void _handleTapDown(TapDownDetails _) {
    setState(() => _isPressed = true);
  }

  void _handleTapUp(TapUpDetails _) {
    setState(() => _isPressed = false);
  }

  void _handleTapCancel() {
    setState(() => _isPressed = false);
  }

  void _handleTap() {
    if (widget.isLoading) return;
    HapticFeedback.lightImpact();
    widget.onPressed();
  }

  @override
  Widget build(BuildContext context) {
    final bool isDisabled = widget.isLoading;
    final double scale = _isPressed && !isDisabled ? 0.96 : 1.0;
    final double glowAlpha = _isPressed && !isDisabled ? 0.6 : 0.4;

    return GestureDetector(
      onTap: isDisabled ? null : _handleTap,
      onTapDown: isDisabled ? null : _handleTapDown,
      onTapUp: isDisabled ? null : _handleTapUp,
      onTapCancel: isDisabled ? null : _handleTapCancel,
      child: AnimatedScale(
        scale: scale,
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeOut,
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
                colors: widget.isPrimary
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
                        color: (widget.isPrimary ? CinemaColors.neonBlue : CinemaColors.neonAmber)
                            .withValues(alpha: glowAlpha),
                        blurRadius: _isPressed ? 24 : 16,
                        spreadRadius: 0,
                      ),
                      BoxShadow(
                        color: (widget.isPrimary ? CinemaColors.neonBlue : Colors.white)
                            .withValues(alpha: 0.2),
                        blurRadius: 8,
                        spreadRadius: -2,
                      ),
                    ],
            ),
            child: Center(
              child: widget.isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.black,
                      ),
                    )
                  : Text(
                      widget.label,
                      style: GoogleFonts.bebasNeue(
                        fontSize: 18,
                        color: widget.isPrimary ? Colors.black : CinemaColors.textPrimary,
                        letterSpacing: 2,
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }
}
