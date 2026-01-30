import 'dart:convert';

import '../config/api_config.dart';
import '../models/api_response.dart';
import '../models/home.dart';
import 'api_client.dart';

/// 홈 API (stats, upcoming-movies, 인증 불필요)
class HomeApiService {
  HomeApiService(this._client);

  final ApiClient _client;

  /// GET /api/home/stats
  Future<HomeStatsModel> getStats() async {
    final response = await _client.get(apiPathHomeStats, useAuth: false);
    _client.throwIfNotOk('getStats', response);
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final api = ApiResponse.fromJson(
      json,
      (d) => HomeStatsModel.fromJson(d as Map<String, dynamic>),
    );
    if (!api.success || api.data == null) throw Exception(api.message ?? '영화관 현황 조회 실패');
    return api.data!;
  }

  /// GET /api/home/upcoming-movies?days=3
  Future<List<UpcomingMovieModel>> getUpcomingMovies({int days = 3}) async {
    final path = '$apiPathHomeUpcomingMovies?days=$days';
    final response = await _client.get(path, useAuth: false);
    _client.throwIfNotOk('getUpcomingMovies', response);
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final api = ApiResponse.fromJson(json, (d) {
      final list = d as List<dynamic>;
      return list.map((e) => UpcomingMovieModel.fromJson(e as Map<String, dynamic>)).toList();
    });
    if (!api.success || api.data == null) throw Exception(api.message ?? '상영 예정 영화 조회 실패');
    return api.data!;
  }
}
