import '../config/api_config.dart';
import '../models/api_response.dart';
import '../models/movie.dart';
import 'api_service_base.dart';

/// 영화 목록·상세 API (GET만, 인증 불필요)
class MovieApiService extends ApiServiceBase {
  MovieApiService(super.client);

  /// GET /api/movies?page=0&size=20
  Future<PageResponse<MovieModel>> getMovies({int page = 0, int size = 20}) async {
    final path = '$apiPathMovies?page=$page&size=$size';
    final response = await client.get(path, useAuth: false);
    return parseResponse(
      response,
      'getMovies',
      (d) => PageResponse.fromJson(
        d as Map<String, dynamic>,
        (e) => MovieModel.fromJson(e as Map<String, dynamic>),
      ),
      '영화 목록 조회 실패',
    );
  }

  /// GET /api/movies/{movieId}
  Future<MovieModel> getMovie(int movieId) async {
    final path = '$apiPathMovieDetail/$movieId';
    final response = await client.get(path, useAuth: false);
    return parseResponse(
      response,
      'getMovie',
      (d) => MovieModel.fromJson(d as Map<String, dynamic>),
      '영화 상세 조회 실패',
    );
  }
}
