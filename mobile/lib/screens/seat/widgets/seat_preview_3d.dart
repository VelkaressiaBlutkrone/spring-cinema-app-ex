import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../models/seat.dart';
import '../../../theme/cinema_theme.dart';

/// 2.5D 극장 시트 프리뷰 — Transform 위젯 기반
/// 선택한 좌석에서의 스크린 시야각을 시각화
class SeatPreview3D extends StatelessWidget {
  const SeatPreview3D({
    super.key,
    required this.layout,
    required this.heldSeatIds,
  });

  final SeatLayoutModel layout;
  final Set<int> heldSeatIds;

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
    final totalRows = sortedRows.length;
    final totalCols = rows.values.fold<int>(0, (m, v) => math.max(m, v.length));

    // 선택된 좌석 찾기
    int? selectedRowIndex;
    int? selectedColIndex;
    String? selectedLabel;
    for (int ri = 0; ri < sortedRows.length; ri++) {
      final rowSeats = rows[sortedRows[ri]]!;
      for (int ci = 0; ci < rowSeats.length; ci++) {
        if (heldSeatIds.contains(rowSeats[ci].seatId)) {
          selectedRowIndex = ri;
          selectedColIndex = ci;
          selectedLabel = '${rowSeats[ci].rowLabel}-${rowSeats[ci].seatNo}';
          break;
        }
      }
      if (selectedLabel != null) break;
    }

    // 시야각 계산
    final double rowRatio = totalRows > 1 && selectedRowIndex != null
        ? selectedRowIndex / (totalRows - 1)
        : 0.5;
    final double colRatio = totalCols > 1 && selectedColIndex != null
        ? selectedColIndex / (totalCols - 1)
        : 0.5;
    final double rotateX = (35 - rowRatio * 30) * math.pi / 180;
    final double rotateY = (colRatio - 0.5) * -20 * math.pi / 180;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: CinemaColors.glassBorder),
        color: CinemaColors.surface,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (selectedLabel != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(
                '$selectedLabel 좌석에서 바라본 시야',
                style: GoogleFonts.roboto(
                  fontSize: 13,
                  color: CinemaColors.neonBlue,
                ),
              ),
            ),
          AnimatedContainer(
            duration: const Duration(milliseconds: 600),
            curve: Curves.easeOutCubic,
            child: Transform(
              alignment: Alignment.center,
              transform: Matrix4.identity()
                ..setEntry(3, 2, 0.001)
                ..rotateX(rotateX)
                ..rotateY(rotateY),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // 스크린
                  Container(
                    height: 12,
                    width: double.infinity,
                    margin: const EdgeInsets.symmetric(horizontal: 24),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(2),
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.white.withValues(alpha: 0.6),
                          Colors.white.withValues(alpha: 0.2),
                        ],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.white.withValues(alpha: 0.3),
                          blurRadius: 24,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  // 좌석 그리드
                  ...sortedRows.asMap().entries.map((entry) {
                    final ri = entry.key;
                    final rowLabel = entry.value;
                    final rowSeats = rows[rowLabel]!;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 2),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          SizedBox(
                            width: 14,
                            child: Text(
                              rowLabel,
                              style: GoogleFonts.roboto(
                                fontSize: 8,
                                color: CinemaColors.textMuted,
                              ),
                              textAlign: TextAlign.right,
                            ),
                          ),
                          const SizedBox(width: 2),
                          ...rowSeats.asMap().entries.map((seatEntry) {
                            final ci = seatEntry.key;
                            final seat = seatEntry.value;
                            final isMyHold = heldSeatIds.contains(seat.seatId);
                            final isSelected =
                                ri == selectedRowIndex && ci == selectedColIndex;
                            return AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              width: isSelected ? 10 : 7,
                              height: isSelected ? 10 : 7,
                              margin: const EdgeInsets.all(0.5),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(1.5),
                                color: isSelected
                                    ? CinemaColors.neonBlue
                                    : isMyHold
                                        ? CinemaColors.neonBlue.withValues(alpha: 0.7)
                                        : seat.isAvailable
                                            ? Colors.green.withValues(alpha: 0.4)
                                            : seat.isReserved
                                                ? Colors.red.withValues(alpha: 0.4)
                                                : CinemaColors.textMuted.withValues(alpha: 0.2),
                                boxShadow: isSelected
                                    ? [
                                        BoxShadow(
                                          color: CinemaColors.neonBlue.withValues(alpha: 0.8),
                                          blurRadius: 8,
                                        ),
                                      ]
                                    : [],
                              ),
                            );
                          }),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
          ),
          if (selectedLabel == null)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(
                '좌석을 선택하면 해당 위치에서의 시야를 확인할 수 있습니다.',
                style: GoogleFonts.roboto(
                  fontSize: 11,
                  color: CinemaColors.textMuted,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
