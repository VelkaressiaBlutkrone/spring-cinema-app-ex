import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../exception/app_exception.dart';
import '../../utils/app_logger.dart';
import '../../models/payment.dart';
import '../../models/seat.dart';
import '../../provider/api_providers.dart';
import '../../services/seat_sse_client.dart';
import '../../theme/cinema_theme.dart';
import '../../theme/cinema_animations.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/dialog/error_dialog.dart';
import '../../widgets/glass_card.dart';
import '../payment/payment_screen.dart';
import 'widgets/seat_grid.dart';
import 'widgets/held_seats_bar.dart';

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
  final Map<int, SeatHoldModel> _heldSeats = {};
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
      if (mounted) {
        setState(() {
          _layout = AsyncValue.data(layout);
          _heldSeats.clear();
          for (final s in layout.seats) {
            if (s.isHold && s.isHeldByCurrentUser == true && s.holdToken != null) {
              _heldSeats[s.seatId] = SeatHoldModel(
                holdToken: s.holdToken!,
                screeningId: layout.screeningId,
                seatId: s.seatId,
                holdExpireAt: s.holdExpireAt,
                ttlSeconds: null,
              );
            }
          }
        });
      }
    } catch (e, st) {
      if (mounted) setState(() => _layout = AsyncValue.error(e, st));
    }
  }

  Future<void> _onSeatTap(SeatStatusItemModel seat) async {
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
        logSeatHold(widget.screeningId, 1);
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
      if (mounted) {
        setState(() => _heldSeats.remove(seatId));
        logSeatRelease(widget.screeningId, 1);
      }
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
                    style: GoogleFonts.roboto(fontSize: 12, color: CinemaColors.textMuted),
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: _layout.when(
              data: (layout) {
                return SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    children: [
                      SeatGrid(
                        layout: layout,
                        heldSeatIds: _heldSeats.keys.toSet(),
                        isLoading: _isLoading,
                        onSeatTap: _onSeatTap,
                      ),
                      HeldSeatsBar(
                        heldSeats: _heldSeats,
                        allSeats: layout.seats,
                        isLoading: _isLoading,
                        onRelease: _releaseSeat,
                      ),
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
            child: AnimatedSwitcher(
              duration: CinemaAnimations.normal,
              switchInCurve: CinemaAnimations.defaultCurve,
              transitionBuilder: (child, animation) => FadeTransition(
                opacity: animation,
                child: SlideTransition(
                  position: Tween<Offset>(
                    begin: const Offset(0, 0.2),
                    end: Offset.zero,
                  ).animate(animation),
                  child: child,
                ),
              ),
              child: CustomButton(
                key: ValueKey(_heldSeats.length),
                text: _heldSeats.isEmpty
                    ? '좌석을 선택하세요'
                    : '결제하기 (${_heldSeats.length}석)',
                onPressed: _heldSeats.isEmpty ? null : _goToPayment,
                isFullWidth: true,
                size: ButtonSize.large,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
