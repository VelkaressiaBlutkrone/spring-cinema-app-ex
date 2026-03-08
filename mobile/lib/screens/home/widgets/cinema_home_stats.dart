import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../models/home.dart';
import '../../../theme/cinema_theme.dart';
import '../../../widgets/glass_card.dart';

class CinemaHomeStats extends StatelessWidget {
  const CinemaHomeStats({super.key, required this.stats});

  final HomeStatsModel stats;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GlassCard(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        borderRadius: 20,
        blur: 20,
        child: Wrap(
          spacing: 24,
          runSpacing: 12,
          children: [
            _statChip('영화관', '${stats.theaterCount}개'),
            _statChip('상영관', '${stats.screenCount}개'),
            _statChip('오늘 상영', '${stats.todayScreeningCount}편'),
          ],
        ),
      ),
    );
  }

  Widget _statChip(String label, String value) {
    return Text.rich(
      TextSpan(
        style: GoogleFonts.roboto(fontSize: 14, color: CinemaColors.textMuted),
        children: [
          TextSpan(text: '$label '),
          TextSpan(
            text: value,
            style: GoogleFonts.roboto(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: CinemaColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
