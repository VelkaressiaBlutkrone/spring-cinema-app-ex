import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../exception/app_exception.dart';
import '../../../models/member.dart';
import '../../../provider/api_providers.dart';
import '../../../provider/main_tab_provider.dart';
import '../../../theme/cinema_theme.dart';
import '../../../utils/date_time_formatter.dart';
import '../../../widgets/dialog/error_dialog.dart';
import '../../../widgets/glass_card.dart';
import '../../../widgets/neon_button.dart';
import '../../seat/seat_select_screen.dart';

class HoldsTab extends ConsumerStatefulWidget {
  const HoldsTab({super.key});

  @override
  ConsumerState<HoldsTab> createState() => _HoldsTabState();
}

class _HoldsTabState extends ConsumerState<HoldsTab> {
  AsyncValue<List<MemberHoldSummaryModel>> _holds = const AsyncValue.loading();
  String? _releasingKey;

  @override
  void initState() {
    super.initState();
    _loadHolds();
  }

  Future<void> _loadHolds() async {
    setState(() => _holds = const AsyncValue.loading());
    try {
      final list = await ref.read(memberApiServiceProvider).getMyHolds();
      if (mounted) setState(() => _holds = AsyncValue.data(list));
    } catch (e, st) {
      if (mounted) setState(() => _holds = AsyncValue.error(e, st));
    }
  }

  Future<void> _releaseHold(int screeningId, int seatId, String holdToken) async {
    final key = '$screeningId-$seatId';
    setState(() => _releasingKey = key);
    try {
      await ref.read(screeningApiServiceProvider).releaseHold(screeningId, seatId, holdToken);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('좌석이 해제되었습니다.'), backgroundColor: CinemaColors.neonBlue),
        );
        _loadHolds();
      }
    } on AppException catch (e) {
      if (mounted) {
        await showDialog(
          context: context,
          builder: (ctx) => ErrorDialog(exception: e, title: '해제 실패'),
        );
      }
    } catch (_) {
      if (mounted) {
        await showDialog(
          context: context,
          builder: (ctx) => ErrorDialog(exception: AuthException('해제에 실패했습니다.'), title: '해제 실패'),
        );
      }
    } finally {
      if (mounted) setState(() => _releasingKey = null);
    }
  }

  static String _formatDateTime(String? iso) => DateTimeFormatter.formatDateTime(iso);

  static String _formatTime(String? iso) => DateTimeFormatter.formatTime(iso);

  @override
  Widget build(BuildContext context) {
    return _holds.when(
      data: (list) {
        if (list.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.event_seat_outlined,
                      size: 56, color: CinemaColors.textMuted.withValues(alpha: 0.6)),
                  const SizedBox(height: 16),
                  Text(
                    '장바구니가 비어 있습니다',
                    style: GoogleFonts.roboto(
                        fontSize: 16, fontWeight: FontWeight.w500, color: CinemaColors.textMuted),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '영화 목록에서 좌석을 선택하면 여기에 표시됩니다.',
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
          onRefresh: _loadHolds,
          color: CinemaColors.neonBlue,
          child: ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: list.length,
            itemBuilder: (context, i) {
              final h = list[i];
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: GlassCard(
                  padding: const EdgeInsets.all(16),
                  borderRadius: 16,
                  blur: 20,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  h.movieTitle,
                                  style: GoogleFonts.roboto(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      color: CinemaColors.textPrimary),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${h.screenName} · ${_formatDateTime(h.startTime)}',
                                  style: GoogleFonts.roboto(
                                      fontSize: 12, color: CinemaColors.textMuted),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  '${h.seats.length}석 · ${h.seats.map((s) => s.displayName).join(', ')}',
                                  style: GoogleFonts.roboto(
                                      fontSize: 12, color: CinemaColors.neonAmber),
                                ),
                              ],
                            ),
                          ),
                          NeonButton(
                            label: '결제하기',
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => SeatSelectScreen(
                                    screeningId: h.screeningId,
                                    movieTitle: h.movieTitle,
                                    screenName: h.screenName,
                                    theaterName: '',
                                    startTime: h.startTime,
                                  ),
                                ),
                              );
                            },
                            isPrimary: true,
                          ),
                        ],
                      ),
                      const Divider(color: CinemaColors.glassBorder, height: 24),
                      ...h.seats.map(
                        (s) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${s.displayName} (만료: ${_formatTime(s.holdExpireAt)})',
                                style: GoogleFonts.roboto(
                                    fontSize: 12, color: CinemaColors.textMuted),
                              ),
                              TextButton(
                                onPressed: _releasingKey == '${h.screeningId}-${s.seatId}'
                                    ? null
                                    : () => _releaseHold(h.screeningId, s.seatId, s.holdToken),
                                child: Text(
                                  _releasingKey == '${h.screeningId}-${s.seatId}'
                                      ? '해제 중...'
                                      : '해제',
                                  style: GoogleFonts.roboto(
                                      fontSize: 12, color: CinemaColors.neonBlue),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
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
            TextButton(onPressed: _loadHolds, child: const Text('다시 시도')),
          ],
        ),
      ),
    );
  }
}
