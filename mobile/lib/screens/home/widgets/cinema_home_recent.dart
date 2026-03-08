import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../models/reservation.dart';
import '../../../utils/date_time_formatter.dart';
import '../../../provider/main_tab_provider.dart';
import '../../../theme/cinema_theme.dart';
import '../../../widgets/glass_card.dart';
import '../../../widgets/neon_button.dart';

class CinemaHomeRecent extends ConsumerWidget {
  const CinemaHomeRecent({
    super.key,
    required this.isLoggedIn,
    required this.reservations,
  });

  final bool isLoggedIn;
  final List<ReservationDetailModel> reservations;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final hasRecent = isLoggedIn && reservations.isNotEmpty;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GlassCard(
        padding: const EdgeInsets.all(20),
        borderRadius: 20,
        blur: 20,
        child: hasRecent
            ? _buildRecentList(ref)
            : _buildQuickBookingEmpty(ref),
      ),
    );
  }

  Widget _buildRecentList(WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ...reservations.map((r) => _RecentReservationTile(reservation: r)),
        const SizedBox(height: 16),
        GestureDetector(
          onTap: () => ref.read(mainTabIndexProvider.notifier).setIndex(2),
          child: Text(
            '예매 내역 전체 보기 →',
            style: GoogleFonts.roboto(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: CinemaColors.neonBlue,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildQuickBookingEmpty(WidgetRef ref) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const SizedBox(height: 24),
        Icon(
          Icons.movie_filter_outlined,
          size: 56,
          color: CinemaColors.textMuted.withValues(alpha: 0.6),
        ),
        const SizedBox(height: 16),
        Text(
          isLoggedIn ? '첫 예매를 시작해보세요' : '지금 바로 예매를 시작해보세요',
          style: GoogleFonts.roboto(fontSize: 16, color: CinemaColors.textMuted),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          '영화 목록에서 상영을 선택해 예매해 보세요.',
          style: GoogleFonts.roboto(fontSize: 13, color: CinemaColors.textMuted),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),
        NeonButton(
          label: '지금 바로 예매하기',
          onPressed: () => ref.read(mainTabIndexProvider.notifier).setIndex(1),
          isPrimary: true,
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}

class _RecentReservationTile extends StatelessWidget {
  const _RecentReservationTile({required this.reservation});

  final ReservationDetailModel reservation;

  static String _formatDateTime(String? iso) => DateTimeFormatter.formatDateTime(iso);

  static String _formatPrice(int amount) => DateTimeFormatter.formatPrice(amount);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: CinemaColors.glassBorder),
          color: CinemaColors.surface,
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    reservation.movieTitle,
                    style: GoogleFonts.roboto(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: CinemaColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${_formatDateTime(reservation.startTime)} · ${reservation.screenName}',
                    style: GoogleFonts.roboto(fontSize: 12, color: CinemaColors.textMuted),
                  ),
                ],
              ),
            ),
            Text(
              _formatPrice(reservation.totalAmount),
              style: GoogleFonts.roboto(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: CinemaColors.neonAmber,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
