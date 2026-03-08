import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
                          child: _SeatTile(
                            seat: s,
                            color: seatColor,
                            clickable: clickable,
                            size: seatSize,
                            isLoading: isLoading,
                            onTap: onSeatTap,
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

class _SeatTile extends StatefulWidget {
  const _SeatTile({
    required this.seat,
    required this.color,
    required this.clickable,
    required this.size,
    required this.isLoading,
    required this.onTap,
  });

  final SeatStatusItemModel seat;
  final Color color;
  final bool clickable;
  final double size;
  final bool isLoading;
  final void Function(SeatStatusItemModel seat) onTap;

  @override
  State<_SeatTile> createState() => _SeatTileState();
}

class _SeatTileState extends State<_SeatTile> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final canTap = widget.clickable && !widget.isLoading;

    return GestureDetector(
      onTap: canTap
          ? () {
              HapticFeedback.selectionClick();
              widget.onTap(widget.seat);
            }
          : null,
      onTapDown: canTap ? (_) => setState(() => _isPressed = true) : null,
      onTapUp: canTap ? (_) => setState(() => _isPressed = false) : null,
      onTapCancel: canTap ? () => setState(() => _isPressed = false) : null,
      child: AnimatedScale(
        scale: _isPressed ? 1.15 : 1.0,
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeOut,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          width: widget.size,
          height: widget.size,
          decoration: BoxDecoration(
            color: widget.color,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: widget.clickable
                  ? CinemaColors.seatMyHold
                  : CinemaColors.glassBorder,
              width: widget.clickable ? 2 : 1,
            ),
            boxShadow: _isPressed
                ? [
                    BoxShadow(
                      color: CinemaColors.neonBlue.withValues(alpha: 0.5),
                      blurRadius: 8,
                      spreadRadius: 0,
                    ),
                  ]
                : [],
          ),
          child: Center(
            child: Text(
              '${widget.seat.seatNo}',
              style: GoogleFonts.roboto(fontSize: 13, color: Colors.white),
            ),
          ),
        ),
      ),
    );
  }
}
