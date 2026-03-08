import '../config/api_config.dart';
import '../models/screening.dart';
import '../models/seat.dart';
import 'api_service_base.dart';

/// 상영·좌석·HOLD API
class ScreeningApiService extends ApiServiceBase {
  ScreeningApiService(super.client);

  /// GET /api/screenings/by-movie?movieId=
  Future<List<ScreeningModel>> getScreeningsByMovie(int movieId) async {
    final path = '$apiPathScreeningsByMovie?movieId=$movieId';
    final response = await client.get(path, useAuth: false);
    return parseListResponse(
      response,
      'getScreeningsByMovie',
      ScreeningModel.fromJson,
      '상영 시간표 조회 실패',
    );
  }

  /// GET /api/screenings/{screeningId}/seats
  Future<SeatLayoutModel> getSeatLayout(int screeningId) async {
    final path = '$apiPathScreeningSeats/$screeningId/seats';
    final response = await client.get(path, useAuth: true);
    return parseResponse(
      response,
      'getSeatLayout',
      (d) => SeatLayoutModel.fromJson(d as Map<String, dynamic>),
      '좌석 배치 조회 실패',
    );
  }

  /// POST /api/screenings/{screeningId}/seats/{seatId}/hold
  Future<SeatHoldModel> hold(int screeningId, int seatId) async {
    final path = '$apiPathHold/$screeningId/seats/$seatId/hold';
    final response = await client.post(path, body: null, useAuth: true);
    return parseResponse(
      response,
      'hold',
      (d) => SeatHoldModel.fromJson(d as Map<String, dynamic>),
      '좌석 선점 실패',
    );
  }

  /// POST /api/screenings/holds/release
  Future<void> releaseHold(int screeningId, int seatId, String holdToken) async {
    final path = apiPathHoldRelease;
    final body = {'screeningId': screeningId, 'seatId': seatId, 'holdToken': holdToken};
    final response = await client.post(path, body: body, useAuth: true);
    parseVoidResponse(response, 'releaseHold');
  }
}
