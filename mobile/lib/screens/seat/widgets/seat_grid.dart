import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../models/seat.dart';
import '../../../theme/cinema_theme.dart';

class SeatGrid extends StatelessWidget {
  const SeatGrid({
    super.key,
    required this.layout,
    required this.heldSeatIds,
    required this.isLoading,
    required this.onSeatTap,
  });

  final SeatLayoutModel layout;
  final Set<int> heldSeatIds;
  final bool isLoading;
  final void Function(SeatStatusItemModel seat) onSeatTap;

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

  @override
  Widget build(BuildContext context) {
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

    return Column(
      children: [
        const SizedBox(height: 16),
        Text(
          '스크린',
          style: GoogleFonts.roboto(fontSize: 12, color: CinemaColors.textMuted),
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
                              fontSize: 13, color: CinemaColors.textSecondary),
                        ),
                      ),
                      const SizedBox(width: 4),
                      ...seatList.map((s) {
                        final isHeldByMe = heldSeatIds.contains(s.seatId);
                        final seatColor = _seatColor(s, isHeldByMe);
                        final clickable = _isSeatClickable(s, isHeldByMe);
                        return Padding(
                          padding: EdgeInsets.only(
                            right: seatList.indexOf(s) < seatList.length - 1
                                ? seatSpacing
                                : 0,
                          ),
                          child: GestureDetector(
                            onTap: isLoading ? null : () => onSeatTap(s),
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
                                      fontSize: 13, color: Colors.white),
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
      ],
    );
  }

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
                style: GoogleFonts.roboto(fontSize: 11, color: CinemaColors.textMuted),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }
}
