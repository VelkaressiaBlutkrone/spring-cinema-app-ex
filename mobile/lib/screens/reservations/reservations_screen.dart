import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../models/reservation.dart';
import '../../provider/api_providers.dart';
import '../../theme/cinema_theme.dart';
import '../../widgets/glass_card.dart';
import 'reservation_detail_screen.dart';

/// 예매 내역 화면 (예매내역 탭)
class ReservationsScreen extends ConsumerStatefulWidget {
  const ReservationsScreen({super.key});

  @override
  ConsumerState<ReservationsScreen> createState() => _ReservationsScreenState();
}

class _ReservationsScreenState extends ConsumerState<ReservationsScreen> {
  AsyncValue<List<ReservationDetailModel>> _list = const AsyncValue.loading();

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _list = const AsyncValue.loading());
    try {
      final list = await ref.read(reservationApiServiceProvider).getMyReservations();
      if (mounted) setState(() => _list = AsyncValue.data(list));
    } catch (e, st) {
      if (mounted) setState(() => _list = AsyncValue.error(e, st));
    }
  }

  static String _formatTime(String? iso) {
    if (iso == null || iso.isEmpty) return '-';
    try {
      return DateFormat('MM/dd HH:mm').format(DateTime.parse(iso));
    } catch (_) {
      return iso;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CinemaColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          '예매내역',
          style: GoogleFonts.bebasNeue(
            fontSize: 24,
            color: CinemaColors.textPrimary,
            letterSpacing: 2,
          ),
        ),
      ),
      body: _list.when(
        data: (list) {
          if (list.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.confirmation_number_outlined,
                    size: 64,
                    color: CinemaColors.textMuted.withValues(alpha: 0.6),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '예매 내역이 없습니다.',
                    style: GoogleFonts.roboto(color: CinemaColors.textMuted),
                  ),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: _load,
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: list.length,
              itemBuilder: (context, index) {
                final r = list[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: GlassCard(
                    padding: const EdgeInsets.all(16),
                    borderRadius: 12,
                    blur: 16,
                    child: InkWell(
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => ReservationDetailScreen(reservationId: r.reservationId),
                        ),
                      ),
                      borderRadius: BorderRadius.circular(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                r.reservationNo,
                                style: GoogleFonts.roboto(
                                  fontWeight: FontWeight.w600,
                                  color: CinemaColors.neonBlue,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: r.status == 'CONFIRMED'
                                      ? CinemaColors.neonBlue.withValues(alpha: 0.2)
                                      : CinemaColors.textMuted.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  reservationStatusLabel[r.status] ?? r.status,
                                  style: GoogleFonts.roboto(
                                    fontSize: 12,
                                    color: CinemaColors.textPrimary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            r.movieTitle,
                            style: GoogleFonts.bebasNeue(
                              fontSize: 16,
                              color: CinemaColors.textPrimary,
                              letterSpacing: 1,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${r.screenName} · ${_formatTime(r.startTime)} · ${r.totalSeats}석 ${r.totalAmount}원',
                            style: GoogleFonts.roboto(
                              fontSize: 12,
                              color: CinemaColors.textMuted,
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
        loading: () => const Center(child: CircularProgressIndicator()),
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
              TextButton(onPressed: _load, child: const Text('다시 시도')),
            ],
          ),
        ),
      ),
    );
  }
}
