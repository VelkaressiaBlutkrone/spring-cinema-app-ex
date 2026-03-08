import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/cinema_theme.dart';
import 'neon_button.dart';

/// 빈 상태 위젯 (3곳+ 중복 제거)
class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.actionLabel,
    this.onAction,
  });

  final IconData icon;
  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 56, color: CinemaColors.textMuted.withValues(alpha: 0.6)),
            const SizedBox(height: 16),
            Text(
              title,
              style: GoogleFonts.roboto(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: CinemaColors.textMuted,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: GoogleFonts.roboto(
                fontSize: 13,
                color: CinemaColors.textMuted,
              ),
              textAlign: TextAlign.center,
            ),
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 24),
              NeonButton(label: actionLabel!, onPressed: onAction!, isPrimary: true),
            ],
          ],
        ),
      ),
    );
  }
}
