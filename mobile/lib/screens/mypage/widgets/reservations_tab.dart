import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../models/reservation.dart';
import '../../../provider/api_providers.dart';
import '../../../provider/main_tab_provider.dart';
import '../../../theme/cinema_theme.dart';
import '../../../utils/date_time_formatter.dart';
import '../../../widgets/glass_card.dart';
import '../../../widgets/neon_button.dart';
import '../../reservations/reservation_detail_screen.dart';

class ReservationsTab extends ConsumerStatefulWidget {
  const ReservationsTab({super.key});

  @override
  ConsumerState<ReservationsTab> createState() => _ReservationsTabState();
}

class _ReservationsTabState extends ConsumerState<ReservationsTab> {
  AsyncValue<List<ReservationDetailModel>> _reservations = const AsyncValue.loading();

  @override
  void initState() {
    super.initState();
    _loadReservations();
  }

  Future<void> _loadReservations() async {
    setState(() => _reservations = const AsyncValue.loading());
    try {
      final list = await ref.read(reservationApiServiceProvider).getMyReservations();
      if (mounted) setState(() => _reservations = AsyncValue.data(list));
    } catch (e, st) {
      if (mounted) setState(() => _reservations = AsyncValue.error(e, st));
    }
  }

  static String _formatDateTime(String? iso) => DateTimeFormatter.formatDateTime(iso);

  static String _formatPrice(int amount) => DateTimeFormatter.formatPrice(amount);

  @override
  Widget build(BuildContext context) {
    return _reservations.when(
      data: (list) {
        if (list.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.confirmation_number_outlined,
                      size: 56, color: CinemaColors.textMuted.withValues(alpha: 0.6)),
                  const SizedBox(height: 16),
                  Text(
                    '예매 내역이 없습니다',
                    style: GoogleFonts.roboto(
                        fontSize: 16, fontWeight: FontWeight.w500, color: CinemaColors.textMuted),
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
                    label: '영화 목록',
                    onPressed: () => ref.read(mainTabIndexProvider.notifier).setIndex(1),
                    isPrimary: true,
                  ),
                ],
              ),
            ),
          );
        }
        return RefreshIndicator(
          onRefresh: _loadReservations,
          color: CinemaColors.neonBlue,
          child: ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: list.length,
            itemBuilder: (context, i) {
              final r = list[i];
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: GlassCard(
                  padding: const EdgeInsets.all(16),
                  borderRadius: 16,
                  blur: 20,
                  child: InkWell(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) =>
                              ReservationDetailScreen(reservationId: r.reservationId),
                        ),
                      );
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          r.movieTitle,
                          style: GoogleFonts.roboto(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: CinemaColors.textPrimary),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${r.screenName} · ${_formatDateTime(r.startTime)}',
                          style:
                              GoogleFonts.roboto(fontSize: 12, color: CinemaColors.textMuted),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          r.reservationNo,
                          style:
                              GoogleFonts.roboto(fontSize: 12, color: CinemaColors.neonBlue),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${r.totalSeats}석 · ${_formatPrice(r.totalAmount)}',
                          style:
                              GoogleFonts.roboto(fontSize: 12, color: CinemaColors.neonAmber),
                        ),
                        if (r.payment != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            '결제 ${r.payment!.payStatus} · ${_formatPrice(r.payment!.payAmount)}${r.payment!.paidAt != null ? ' · ${_formatDateTime(r.payment!.paidAt)}' : ''}',
                            style: GoogleFonts.roboto(
                                fontSize: 11, color: CinemaColors.textMuted),
                          ),
                        ],
                        const SizedBox(height: 8),
                        Align(
                          alignment: Alignment.centerRight,
                          child: Text(
                            '상세 →',
                            style: GoogleFonts.roboto(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: CinemaColors.neonBlue),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator(color: CinemaColors.neonBlue)),
      error: (e, _) => Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              e.toString(),
              style: GoogleFonts.roboto(color: CinemaColors.neonRed, fontSize: 12),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            TextButton(onPressed: _loadReservations, child: const Text('다시 시도')),
          ],
        ),
      ),
    );
  }
}
