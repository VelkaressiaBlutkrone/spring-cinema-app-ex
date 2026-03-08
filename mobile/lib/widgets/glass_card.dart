import 'dart:ui';
import 'package:flutter/material.dart';
import '../theme/cinema_theme.dart';

/// Glassmorphism 2.0 card with blur backdrop, border glow, liquid glass feeling
/// [onTap] 제공 시 press 피드백(border 밝아짐) 적용
class GlassCard extends StatefulWidget {
  const GlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.borderRadius = 20,
    this.blur = 20,
    this.borderWidth = 1,
    this.onTap,
  });

  final Widget child;
  final EdgeInsets padding;
  final double borderRadius;
  final double blur;
  final double borderWidth;
  final VoidCallback? onTap;

  @override
  State<GlassCard> createState() => _GlassCardState();
}

class _GlassCardState extends State<GlassCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final borderColor = _isPressed
        ? CinemaColors.neonBlue.withValues(alpha: 0.4)
        : CinemaColors.glassBorder;
    final shadowColor = _isPressed
        ? CinemaColors.neonBlue.withValues(alpha: 0.15)
        : CinemaColors.glassHighlight;

    Widget card = ClipRRect(
      borderRadius: BorderRadius.circular(widget.borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: widget.blur, sigmaY: widget.blur),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
          padding: widget.padding,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(widget.borderRadius),
            color: CinemaColors.glassWhite,
            border: Border.all(
              color: borderColor,
              width: widget.borderWidth,
            ),
            boxShadow: [
              BoxShadow(
                color: shadowColor,
                blurRadius: _isPressed ? 16 : 8,
                spreadRadius: 0,
              ),
            ],
          ),
          child: widget.child,
        ),
      ),
    );

    if (widget.onTap != null) {
      return GestureDetector(
        onTap: widget.onTap,
        onTapDown: (_) => setState(() => _isPressed = true),
        onTapUp: (_) => setState(() => _isPressed = false),
        onTapCancel: () => setState(() => _isPressed = false),
        child: card,
      );
    }

    return card;
  }
}
