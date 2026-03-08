import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../models/seat.dart';
import '../../../theme/cinema_theme.dart';

class HeldSeatsBar extends StatelessWidget {
  const HeldSeatsBar({
    super.key,
    required this.heldSeats,
    required this.allSeats,
    required this.isLoading,
    required this.onRelease,
  });

  final Map<int, SeatHoldModel> heldSeats;
  final List<SeatStatusItemModel> allSeats;
  final bool isLoading;
  final void Function(int seatId) onRelease;

  @override
  Widget build(BuildContext context) {
    if (heldSeats.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 16),
        Text(
          '선택한 좌석 (${heldSeats.length}석)',
          style: GoogleFonts.roboto(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: CinemaColors.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: heldSeats.entries.map((e) {
            final seatId = e.key;
            SeatStatusItemModel? info;
            for (final s in allSeats) {
              if (s.seatId == seatId) {
                info = s;
                break;
              }
            }
            final label = info != null ? '${info.rowLabel}-${info.seatNo}' : '좌석 $seatId';
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: CinemaColors.seatMyHold.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: CinemaColors.seatMyHold.withValues(alpha: 0.5),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    label,
                    style: GoogleFonts.roboto(
                        fontSize: 13, color: CinemaColors.textPrimary),
                  ),
                  const SizedBox(width: 8),
                  TextButton(
                    onPressed: isLoading ? null : () => onRelease(seatId),
                    style: TextButton.styleFrom(
                      minimumSize: Size.zero,
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: Text(
                      '취소',
                      style: GoogleFonts.roboto(
                          fontSize: 12, color: CinemaColors.textMuted),
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}
