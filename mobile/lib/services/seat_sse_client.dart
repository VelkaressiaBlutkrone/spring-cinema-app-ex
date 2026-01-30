import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import '../utils/app_logger.dart';

/// SSE 실시간 좌석 이벤트 구독 (Step 16)
/// GET /api/screenings/{screeningId}/seat-events
/// 이벤트: seat-status-changed, 페이로드: { eventId, screeningId, seatIds }
class SeatEventSubscription {
  SeatEventSubscription._({
    required this.cancel,
  });

  final void Function() cancel;
}

/// 좌석 상태 변경 시 콜백에 변경된 seatIds 전달
Future<SeatEventSubscription?> subscribeSeatEvents({
  required int screeningId,
  required void Function(List<int> seatIds) onSeatIdsChanged,
  String? baseUrl,
}) async {
  final url = (baseUrl ?? apiBaseUrl).replaceAll(RegExp(r'/$'), '');
  final uri = Uri.parse('$url$apiPathSeatEvents/$screeningId/seat-events');

  final client = http.Client();
  String? currentEvent;

  try {
    final request = http.Request('GET', uri);
    request.headers['Accept'] = 'text/event-stream';
    final response = await client.send(request);

    if (response.statusCode != 200) {
      client.close();
      appLogger.w('SeatEventSubscription: status ${response.statusCode}');
      return null;
    }

    final subscription = response.stream
        .transform(utf8.decoder)
        .transform(const LineSplitter())
        .listen(
          (String line) {
            if (line.startsWith('event:')) {
              currentEvent = line.substring(6).trim();
              return;
            }
            if (line.startsWith('data:')) {
              final data = line.substring(5).trim();
              if (data.isEmpty) return;
              try {
                final json = jsonDecode(data) as Map<String, dynamic>;
                if (currentEvent == 'seat-status-changed') {
                  final seatIdsRaw = json['seatIds'];
                  if (seatIdsRaw is List) {
                    final seatIds = seatIdsRaw
                        .map((e) => (e is num) ? e.toInt() : null)
                        .whereType<int>()
                        .toList();
                    if (seatIds.isNotEmpty) {
                      onSeatIdsChanged(seatIds);
                    }
                  }
                }
              } catch (e) {
                appLogger.w('SeatEventSubscription: parse error $e');
              }
              currentEvent = null;
              return;
            }
            if (line.isEmpty) {
              currentEvent = null;
            }
          },
          onError: (Object e, StackTrace _) {
            appLogger.w('SeatEventSubscription: stream error $e');
          },
          onDone: () {
            client.close();
          },
          cancelOnError: false,
        );

    return SeatEventSubscription._(
      cancel: () {
        subscription.cancel();
        client.close();
      },
    );
  } catch (e, _) {
    client.close();
    appLogger.w('SeatEventSubscription: connect error $e');
    return null;
  }
}
