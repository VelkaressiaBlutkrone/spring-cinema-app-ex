import 'dart:convert';

import '../config/api_config.dart';
import '../models/api_response.dart';
import '../models/screening.dart';
import '../models/seat.dart';
import 'api_client.dart';

/// 상영·좌석·HOLD API
class ScreeningApiService {
  ScreeningApiService(this._client);

  final ApiClient _client;

  /// GET /api/screenings/by-movie?movieId=
  Future<List<ScreeningModel>> getScreeningsByMovie(int movieId) async {
    final path = '$apiPathScreeningsByMovie?movieId=$movieId';
    final response = await _client.get(path, useAuth: false);
    _client.throwIfNotOk('getScreeningsByMovie', response);
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final api = ApiResponse.fromJson(json, (d) {
      final list = d as List<dynamic>;
      return list.map((e) => ScreeningModel.fromJson(e as Map<String, dynamic>)).toList();
    });
    if (!api.success || api.data == null) throw Exception(api.message ?? '상영 시간표 조회 실패');
    return api.data!;
  }

  /// GET /api/screenings/{screeningId}/seats
  Future<SeatLayoutModel> getSeatLayout(int screeningId) async {
    final path = '$apiPathScreeningSeats/$screeningId/seats';
    final response = await _client.get(path, useAuth: false);
    _client.throwIfNotOk('getSeatLayout', response);
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final api = ApiResponse.fromJson(json, (d) => SeatLayoutModel.fromJson(d as Map<String, dynamic>));
    if (!api.success || api.data == null) throw Exception(api.message ?? '좌석 배치 조회 실패');
    return api.data!;
  }

  /// POST /api/screenings/{screeningId}/seats/{seatId}/hold (인증 필요)
  Future<SeatHoldModel> hold(int screeningId, int seatId) async {
    final path = '$apiPathHold/$screeningId/seats/$seatId/hold';
    final response = await _client.post(path, body: null, useAuth: true);
    _client.throwIfNotOk('hold', response);
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final api = ApiResponse.fromJson(json, (d) => SeatHoldModel.fromJson(d as Map<String, dynamic>));
    if (!api.success || api.data == null) throw Exception(api.message ?? '좌석 선점 실패');
    return api.data!;
  }

  /// POST /api/screenings/holds/release (인증 필요)
  Future<void> releaseHold(int screeningId, int seatId, String holdToken) async {
    final path = apiPathHoldRelease;
    final body = {'screeningId': screeningId, 'seatId': seatId, 'holdToken': holdToken};
    final response = await _client.post(path, body: body, useAuth: true);
    _client.throwIfNotOk('releaseHold', response);
  }
}
