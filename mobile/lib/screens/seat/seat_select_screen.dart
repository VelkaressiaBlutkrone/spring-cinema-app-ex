import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../exception/app_exception.dart';
import '../../models/payment.dart';
import '../../models/seat.dart';
import '../../provider/api_providers.dart';
import '../../services/seat_sse_client.dart';
import '../../theme/cinema_theme.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/dialog/error_dialog.dart';
import '../../widgets/glass_card.dart';
import '../payment/payment_screen.dart';

/// 좌석 선택 화면 (HOLD 후 결제하기)
class SeatSelectScreen extends ConsumerStatefulWidget {
  const SeatSelectScreen({
    super.key,
    required this.screeningId,
    required this.movieTitle,
    required this.screenName,
    required this.theaterName,
    required this.startTime,
  });

  final int screeningId;
  final String movieTitle;
  final String screenName;
  final String theaterName;
  final String startTime;

  @override
  ConsumerState<SeatSelectScreen> createState() => _SeatSelectScreenState();
}

class _SeatSelectScreenState extends ConsumerState<SeatSelectScreen> {
  AsyncValue<SeatLayoutModel> _layout = const AsyncValue.loading();
  final Map<int, SeatHoldModel> _heldSeats = {}; // seatId -> holdResponse
  bool _isLoading = false;
  SeatEventSubscription? _seatEventSubscription;

  @override
  void initState() {
    super.initState();
    _loadLayout();
    _startSeatEventSubscription();
  }

  @override
  void dispose() {
    _seatEventSubscription?.cancel();
    super.dispose();
  }

  Future<void> _startSeatEventSubscription() async {
    final sub = await subscribeSeatEvents(
      screeningId: widget.screeningId,
      onSeatIdsChanged: (_) {
        if (mounted) _loadLayout();
      },
    );
    if (mounted) _seatEventSubscription = sub;
  }

  Future<void> _loadLayout() async {
    setState(() => _layout = const AsyncValue.loading());
    try {
      final layout = await ref.read(screeningApiServiceProvider).getSeatLayout(widget.screeningId);
      if (mounted) setState(() => _layout = AsyncValue.data(layout));
    } catch (e, st) {
      if (mounted) setState(() => _layout = AsyncValue.error(e, st));
    }
  }

  Future<void> _onSeatTap(SeatStatusItemModel seat) async {
    // 토글: 이미 내가 선택한 좌석이면 해제
    if (_heldSeats.containsKey(seat.seatId)) {
      await _releaseSeat(seat.seatId);
      return;
    }
    if (!seat.isSelectable) return;
    setState(() => _isLoading = true);
    try {
      final hold = await ref.read(screeningApiServiceProvider).hold(widget.screeningId, seat.seatId);
      if (mounted) {
        setState(() {
          _heldSeats[seat.seatId] = hold;
          _isLoading = false;
        });
      }
      await _loadLayout();
    } on AppException catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        showDialog(
          context: context,
          builder: (ctx) => ErrorDialog(exception: e, title: '좌석 선점 실패'),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        showDialog(
          context: context,
          builder: (ctx) => ErrorDialog(
            exception: AuthException('좌석 선점 중 오류가 발생했습니다.'),
            title: '오류',
          ),
        );
      }
    }
  }

  Future<void> _releaseSeat(int seatId) async {
    final hold = _heldSeats[seatId];
    if (hold == null) return;
    try {
      await ref.read(screeningApiServiceProvider).releaseHold(
            widget.screeningId,
            seatId,
            hold.holdToken,
          );
      if (mounted) setState(() => _heldSeats.remove(seatId));
      await _loadLayout();
    } catch (_) {}
  }

  void _goToPayment() {
    if (_heldSeats.isEmpty) return;
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => PaymentScreen(
          screeningId: widget.screeningId,
          movieTitle: widget.movieTitle,
          screenName: widget.screenName,
          theaterName: widget.theaterName,
          startTime: widget.startTime,
          holdItems: _heldSeats.values
              .map((h) => SeatHoldItemModel(seatId: h.seatId, holdToken: h.holdToken))
              .toList(),
        ),
      ),
    );
  }

  static String _formatTime(String? iso) {
    if (iso == null || iso.isEmpty) return '-';
    try {
      return DateFormat('MM/dd HH:mm').format(DateTime.parse(iso));
    } catch (_) {
      return iso;
    }
  }

  /// 웹 SeatMap과 동일한 좌석 상태 색상
  Color _seatColor(SeatStatusItemModel s, bool isHeldByMe) {
    if (isHeldByMe) return CinemaColors.seatMyHold;
    if (s.isHold) return CinemaColors.seatOtherHold;
    if (s.isAvailable) return CinemaColors.seatAvailable;
    if (s.isReserved) return CinemaColors.seatReserved;
    return CinemaColors.seatBlocked;
  }

  bool _isSeatClickable(SeatStatusItemModel s, bool isHeldByMe) {
    if (s.isAvailable) return true;
    if (s.isHold && isHeldByMe) return true;
    return false;
  }

  /// 좌석 상태 범례 (웹과 동일한 5종)
  Widget _buildSeatStatusLegend() {
    final items = [
      (CinemaColors.seatAvailable, '예매 가능'),
      (CinemaColors.seatMyHold, '내 선택'),
      (CinemaColors.seatOtherHold, '다른 고객 선택'),
      (CinemaColors.seatReserved, '예매 완료'),
      (CinemaColors.seatBlocked, '운영 차단'),
    ];
    return Padding(
      padding: const EdgeInsets.only(top: 16),
      child: Wrap(
        spacing: 12,
        runSpacing: 8,
        children: items.map((e) {
          return Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: e.$1,
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
              const SizedBox(width: 4),
              Text(
                e.$2,
                style: GoogleFonts.roboto(
                  fontSize: 11,
                  color: CinemaColors.textMuted,
                ),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CinemaColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          '좌석 선택',
          style: GoogleFonts.bebasNeue(
            fontSize: 20,
            color: CinemaColors.textPrimary,
            letterSpacing: 1,
          ),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: GlassCard(
              padding: const EdgeInsets.all(12),
              child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.movieTitle,
                  style: GoogleFonts.bebasNeue(
                    fontSize: 16,
                    color: CinemaColors.textPrimary,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${widget.theaterName} ${widget.screenName} · ${_formatTime(widget.startTime)}',
                  style: GoogleFonts.roboto(
                    fontSize: 12,
                    color: CinemaColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
          ),
          Expanded(
            child: _layout.when(
              data: (layout) {
                final rows = <String, List<SeatStatusItemModel>>{};
                for (final s in layout.seats) {
                  rows.putIfAbsent(s.rowLabel, () => []).add(s);
                }
                final sortedRows = rows.keys.toList()..sort();
                for (final k in sortedRows) {
                  rows[k]!.sort((a, b) => a.seatNo.compareTo(b.seatNo));
                }
                const double seatSize = 44;
                const double seatSpacing = 8;
                const double rowLabelWidth = 28;
                int maxCols = 0;
                for (final r in sortedRows) {
                  final len = (rows[r] ?? []).length;
                  if (len > maxCols) maxCols = len;
                }
                final gridWidth = maxCols == 0
                    ? 0.0
                    : rowLabelWidth + 4 + maxCols * (seatSize + seatSpacing) - seatSpacing;

                return SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    children: [
                      const SizedBox(height: 16),
                      Text(
                        '스크린',
                        style: GoogleFonts.roboto(
                          fontSize: 12,
                          color: CinemaColors.textMuted,
                        ),
                      ),
                      const SizedBox(height: 8),
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: SizedBox(
                          width: gridWidth < 1 ? 200.0 : gridWidth,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: sortedRows.map((rowLabel) {
                              final seatList = rows[rowLabel] ?? [];
                              return Padding(
                                padding: const EdgeInsets.only(bottom: seatSpacing),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    SizedBox(
                                      width: rowLabelWidth,
                                      child: Text(
                                        rowLabel,
                                        style: GoogleFonts.roboto(
                                          fontSize: 13,
                                          color: CinemaColors.textSecondary,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    ...seatList.map((s) {
                                      final isHeldByMe = _heldSeats.containsKey(s.seatId);
                                      final seatColor = _seatColor(s, isHeldByMe);
                                      final clickable = _isSeatClickable(s, isHeldByMe);
                                      return Padding(
                                        padding: EdgeInsets.only(
                                          right: seatList.indexOf(s) < seatList.length - 1
                                              ? seatSpacing
                                              : 0,
                                        ),
                                        child: GestureDetector(
                                          onTap: _isLoading ? null : () => _onSeatTap(s),
                                          child: Container(
                                            width: seatSize,
                                            height: seatSize,
                                            decoration: BoxDecoration(
                                              color: seatColor,
                                              borderRadius: BorderRadius.circular(8),
                                              border: Border.all(
                                                color: clickable
                                                    ? CinemaColors.seatMyHold
                                                    : CinemaColors.glassBorder,
                                                width: clickable ? 2 : 1,
                                              ),
                                            ),
                                            child: Center(
                                              child: Text(
                                                '${s.seatNo}',
                                                style: GoogleFonts.roboto(
                                                  fontSize: 13,
                                                  color: Colors.white,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      );
                                    }),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ),
                      _buildSeatStatusLegend(),
                      const SizedBox(height: 24),
                    ],
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
                    const SizedBox(height: 8),
                    CustomButton(text: '다시 시도', onPressed: _loadLayout, size: ButtonSize.small),
                  ],
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: CustomButton(
              text: _heldSeats.isEmpty
                  ? '좌석을 선택하세요'
                  : '결제하기 (${_heldSeats.length}석)',
              onPressed: _heldSeats.isEmpty ? null : _goToPayment,
              isFullWidth: true,
              size: ButtonSize.large,
            ),
          ),
        ],
      ),
    );
  }
}
