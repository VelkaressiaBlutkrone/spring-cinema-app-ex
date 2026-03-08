import 'package:intl/intl.dart';

/// 날짜/시간 포맷팅 유틸리티 (5곳+ 중복 제거)
class DateTimeFormatter {
  /// yyyy-MM-dd HH:mm
  static String formatDateTime(String? iso) {
    if (iso == null || iso.isEmpty) return '-';
    try {
      return DateFormat('yyyy-MM-dd HH:mm').format(DateTime.parse(iso));
    } catch (_) {
      return iso;
    }
  }

  /// HH:mm
  static String formatTime(String? iso) {
    if (iso == null || iso.isEmpty) return '-';
    try {
      return DateFormat('HH:mm').format(DateTime.parse(iso));
    } catch (_) {
      return iso;
    }
  }

  /// MM/dd HH:mm
  static String formatShortDateTime(String? iso) {
    if (iso == null || iso.isEmpty) return '-';
    try {
      return DateFormat('MM/dd HH:mm').format(DateTime.parse(iso));
    } catch (_) {
      return iso;
    }
  }

  /// #,###원
  static String formatPrice(int amount) => NumberFormat('#,###원').format(amount);
}
