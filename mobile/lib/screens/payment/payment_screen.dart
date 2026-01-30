import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../exception/app_exception.dart';
import '../../models/payment.dart';
import '../../provider/api_providers.dart';
import '../../theme/cinema_theme.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/dialog/error_dialog.dart';
import '../../widgets/glass_card.dart';
import 'payment_complete_screen.dart';

/// 결제 화면 (예매 정보 표시 + 결제 처리)
class PaymentScreen extends ConsumerStatefulWidget {
  const PaymentScreen({
    super.key,
    required this.screeningId,
    required this.movieTitle,
    required this.screenName,
    required this.theaterName,
    required this.startTime,
    required this.holdItems,
  });

  final int screeningId;
  final String movieTitle;
  final String screenName;
  final String theaterName;
  final String startTime;
  final List<SeatHoldItemModel> holdItems;

  @override
  ConsumerState<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends ConsumerState<PaymentScreen> {
  bool _isLoading = false;
  final String _payMethod = 'CARD';

  Future<void> _pay() async {
    setState(() => _isLoading = true);
    try {
      final request = PaymentRequestModel(
        screeningId: widget.screeningId,
        seatHoldItems: widget.holdItems,
        payMethod: _payMethod,
      );
      final result = await ref.read(reservationApiServiceProvider).pay(request);
      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (_) => PaymentCompleteScreen(
            reservationId: result.reservationId,
            reservationNo: result.reservationNo,
            totalAmount: result.totalAmount,
          ),
        ),
        (route) => route.isFirst,
      );
    } on AppException catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        showDialog(
          context: context,
          builder: (ctx) => ErrorDialog(exception: e, title: '결제 실패'),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        showDialog(
          context: context,
          builder: (ctx) => ErrorDialog(
            exception: AuthException('결제 중 오류가 발생했습니다.'),
            title: '오류',
          ),
        );
      }
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
          '결제',
          style: GoogleFonts.bebasNeue(
            fontSize: 20,
            color: CinemaColors.textPrimary,
            letterSpacing: 1,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 16),
            GlassCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.movieTitle,
                    style: GoogleFonts.bebasNeue(
                      fontSize: 18,
                      color: CinemaColors.textPrimary,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${widget.theaterName} ${widget.screenName}',
                    style: GoogleFonts.roboto(
                      fontSize: 14,
                      color: CinemaColors.textMuted,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '좌석 ${widget.holdItems.length}석',
                    style: GoogleFonts.roboto(
                      fontSize: 14,
                      color: CinemaColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text(
              '결제 수단',
              style: GoogleFonts.bebasNeue(
                fontSize: 16,
                color: CinemaColors.textPrimary,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 8),
            GlassCard(
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
              child: Row(
                children: [
                  Icon(Icons.credit_card, color: CinemaColors.neonBlue, size: 24),
                  const SizedBox(width: 12),
                  Text(
                    '카드',
                    style: GoogleFonts.roboto(
                      fontSize: 16,
                      color: CinemaColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
            CustomButton(
              text: '결제하기',
              onPressed: _isLoading ? null : _pay,
              isLoading: _isLoading,
              isFullWidth: true,
              size: ButtonSize.large,
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
