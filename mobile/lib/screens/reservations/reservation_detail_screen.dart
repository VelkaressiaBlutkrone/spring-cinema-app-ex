import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../exception/app_exception.dart';
import '../../models/reservation.dart' show ReservationDetailModel, reservationStatusLabel;
import '../../provider/api_providers.dart';
import '../../theme/cinema_theme.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/dialog/confirm_dialog.dart';
import '../../widgets/dialog/error_dialog.dart';
import '../../widgets/glass_card.dart';

/// 예매 상세 화면 (상세 정보 + 취소)
class ReservationDetailScreen extends ConsumerStatefulWidget {
  const ReservationDetailScreen({super.key, required this.reservationId});

  final int reservationId;

  @override
  ConsumerState<ReservationDetailScreen> createState() => _ReservationDetailScreenState();
}

class _ReservationDetailScreenState extends ConsumerState<ReservationDetailScreen> {
  AsyncValue<ReservationDetailModel> _detail = const AsyncValue.loading();
  bool _isCancelling = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _detail = const AsyncValue.loading());
    try {
      final d = await ref.read(reservationApiServiceProvider).getReservationDetail(widget.reservationId);
      if (mounted) setState(() => _detail = AsyncValue.data(d));
    } catch (e, st) {
      if (mounted) setState(() => _detail = AsyncValue.error(e, st));
    }
  }

  Future<void> _cancel() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => ConfirmDialog(
        title: '예매 취소',
        message: '정말 이 예매를 취소하시겠습니까?',
        confirmText: '취소하기',
        onConfirm: () => Navigator.of(ctx).pop(true),
        onCancel: () => Navigator.of(ctx).pop(false),
      ),
    );
    if (confirmed != true || !mounted) return;
    setState(() => _isCancelling = true);
    try {
      await ref.read(reservationApiServiceProvider).cancelReservation(widget.reservationId);
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } on AppException catch (e) {
      if (mounted) {
        setState(() => _isCancelling = false);
        showDialog(
          context: context,
          builder: (ctx) => ErrorDialog(exception: e, title: '취소 실패'),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isCancelling = false);
        showDialog(
          context: context,
          builder: (ctx) => ErrorDialog(
            exception: AuthException('취소 중 오류가 발생했습니다.'),
            title: '오류',
          ),
        );
      }
    }
  }

  static String _formatTime(String? iso) {
    if (iso == null || iso.isEmpty) return '-';
    try {
      return DateFormat('yyyy-MM-dd HH:mm').format(DateTime.parse(iso));
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
          '예매 상세',
          style: GoogleFonts.bebasNeue(
            fontSize: 20,
            color: CinemaColors.textPrimary,
            letterSpacing: 1,
          ),
        ),
      ),
      body: _detail.when(
        data: (r) {
          final canCancel = r.status == 'CONFIRMED';
          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 16),
                GlassCard(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        r.reservationNo,
                        style: GoogleFonts.roboto(
                          fontWeight: FontWeight.w600,
                          color: CinemaColors.neonBlue,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        r.movieTitle,
                        style: GoogleFonts.bebasNeue(
                          fontSize: 20,
                          color: CinemaColors.textPrimary,
                          letterSpacing: 1,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${r.screenName} · ${_formatTime(r.startTime)}',
                        style: GoogleFonts.roboto(
                          fontSize: 14,
                          color: CinemaColors.textMuted,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        '좌석: ${r.seats.map((s) => s.displayName).join(", ")}',
                        style: GoogleFonts.roboto(
                          fontSize: 14,
                          color: CinemaColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '총 ${r.totalSeats}석 · ${r.totalAmount}원',
                        style: GoogleFonts.roboto(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: CinemaColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '예매 상태: ${reservationStatusLabel[r.status] ?? r.status}',
                        style: GoogleFonts.roboto(
                          fontSize: 13,
                          color: CinemaColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                if (canCancel) ...[
                  const SizedBox(height: 24),
                  CustomButton(
                    text: '예매 취소',
                    onPressed: _isCancelling ? null : _cancel,
                    isLoading: _isCancelling,
                    style: CustomButtonStyle.danger,
                    isFullWidth: true,
                  ),
                ],
                const SizedBox(height: 40),
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
              const SizedBox(height: 16),
              CustomButton(text: '다시 시도', onPressed: _load, size: ButtonSize.small),
            ],
          ),
        ),
      ),
    );
  }
}
