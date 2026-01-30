import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../theme/cinema_theme.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/glass_card.dart';
import '../main_tab_screen.dart';

/// 결제 완료 화면
class PaymentCompleteScreen extends StatelessWidget {
  const PaymentCompleteScreen({
    super.key,
    required this.reservationId,
    required this.reservationNo,
    required this.totalAmount,
  });

  final int reservationId;
  final String reservationNo;
  final int totalAmount;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CinemaColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.check_circle_outline,
                size: 80,
                color: CinemaColors.neonBlue,
              ),
              const SizedBox(height: 24),
              Text(
                '결제 완료',
                style: GoogleFonts.bebasNeue(
                  fontSize: 28,
                  color: CinemaColors.textPrimary,
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 24),
              GlassCard(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    _row('예매번호', reservationNo),
                    const SizedBox(height: 12),
                    _row('결제 금액', '$totalAmount원'),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              CustomButton(
                text: '홈으로',
                onPressed: () => Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const MainTabScreen()),
                  (route) => false,
                ),
                isFullWidth: true,
                size: ButtonSize.large,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _row(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.roboto(
            fontSize: 14,
            color: CinemaColors.textMuted,
          ),
        ),
        Text(
          value,
          style: GoogleFonts.roboto(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: CinemaColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
