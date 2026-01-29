import 'dart:ui';
import 'package:flutter/material.dart';
import '../theme/cinema_theme.dart';

/// Glassmorphism 2.0 card with blur backdrop, border glow, liquid glass feeling
class GlassCard extends StatelessWidget {
  const GlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.borderRadius = 20,
    this.blur = 20,
    this.borderWidth = 1,
  });

  final Widget child;
  final EdgeInsets padding;
  final double borderRadius;
  final double blur;
  final double borderWidth;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(borderRadius),
            color: CinemaColors.glassWhite,
            border: Border.all(
              color: CinemaColors.glassBorder,
              width: borderWidth,
            ),
            boxShadow: [
              BoxShadow(
                color: CinemaColors.glassHighlight,
                blurRadius: 8,
                spreadRadius: 0,
              ),
            ],
          ),
          child: child,
        ),
      ),
    );
  }
}
