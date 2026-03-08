import '../config/api_config.dart';
import '../models/home.dart';
import 'api_service_base.dart';

/// 홈 API (stats, upcoming-movies, 인증 불필요)
class HomeApiService extends ApiServiceBase {
  HomeApiService(super.client);

  /// GET /api/home/stats
  Future<HomeStatsModel> getStats() async {
    final response = await client.get(apiPathHomeStats, useAuth: false);
    return parseResponse(
      response,
      'getStats',
      (d) => HomeStatsModel.fromJson(d as Map<String, dynamic>),
      '영화관 현황 조회 실패',
    );
  }

  /// GET /api/home/upcoming-movies?days=3
  Future<List<UpcomingMovieModel>> getUpcomingMovies({int days = 3}) async {
    final path = '$apiPathHomeUpcomingMovies?days=$days';
    final response = await client.get(path, useAuth: false);
    return parseListResponse(
      response,
      'getUpcomingMovies',
      UpcomingMovieModel.fromJson,
      '상영 예정 영화 조회 실패',
    );
  }
}
