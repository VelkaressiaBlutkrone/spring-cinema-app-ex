import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:logger/logger.dart';

import '../config/api_config.dart';
import 'file_log_service.dart';

/// 앱 전역 단일 Logger
///
/// Spring 서버와 마찬가지로 통합 로깅: 레벨, 타임스탬프, 스택 트레이스.
/// RULE: 개인정보, 결제 상세, JWT 전체 값은 로그에 기록하지 않음.
///
/// 추가: 파일 저장(7일 보관) + 백엔드 전송
final appLogger = Logger(
  printer: PrettyPrinter(
    methodCount: 2,
    errorMethodCount: 6,
    lineLength: 80,
    colors: true,
    printEmojis: false,
    dateTimeFormat: DateTimeFormat.onlyTimeAndSinceStart,
  ),
  level: Level.debug,
);

/// 로그 레벨 래퍼 (필요 시 환경별로 변경)
void setAppLogLevel(Level level) {
  // Logger는 인스턴스별 level이 없으므로, 출력 필터는 printer에서 처리하거나
  // 별도 Logger 인스턴스를 만들 수 있음. 현재는 기본 사용.
}

// ========== 비즈니스 이벤트 로깅 (파일 + 백엔드) ==========

Future<void> _emit(String category, String message, [Map<String, dynamic>? data]) async {
  appLogger.i('[$category] $message ${data ?? {}}');
  if (!kIsWeb) {
    FileLogService.instance.log(category, message, data);
  }
  await _sendToBackend(category, message, data);
}

Future<void> _sendToBackend(String category, String message, [Map<String, dynamic>? data]) async {
  try {
    final base = apiBaseUrl.isEmpty ? '' : apiBaseUrl;
    final url = Uri.parse('$base$apiPathLogs');
    final body = jsonEncode({
      'source': 'mobile',
      'level': 'info',
      'category': category,
      'message': message,
      if (data != null && data.isNotEmpty) 'data': data,
    });
    await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: body,
    );
  } catch (_) {}
}

/// 화면 이동 로그
void logNavigation(String from, String to) {
  _emit('NAVIGATION', '화면 이동: $from → $to', {'from': from, 'to': to});
}

/// 좌석 HOLD (장바구니 등록) 로그
void logSeatHold(int screeningId, int seatCount) {
  _emit('RESERVATION', '좌석 HOLD (장바구니 등록)', {'screeningId': screeningId, 'seatCount': seatCount});
}

/// 좌석 HOLD 해제 로그
void logSeatRelease(int screeningId, int seatCount) {
  _emit('RESERVATION', '좌석 HOLD 해제', {'screeningId': screeningId, 'seatCount': seatCount});
}

/// 예매 완료(결제) 로그
void logReservationComplete(int screeningId, String reservationNo, int seatCount) {
  _emit('RESERVATION', '예매 완료', {
    'screeningId': screeningId,
    'reservationNo': reservationNo,
    'seatCount': seatCount,
  });
}
