import 'dart:convert';

import '../config/api_config.dart';
import '../models/api_response.dart';
import '../models/movie.dart';
import 'api_client.dart';

/// 영화 목록·상세 API (GET만, 인증 불필요)
class MovieApiService {
  MovieApiService(this._client);

  final ApiClient _client;

  /// GET /api/movies?page=0&size=20
  Future<PageResponse<MovieModel>> getMovies({int page = 0, int size = 20}) async {
    final path = '$apiPathMovies?page=$page&size=$size';
    final response = await _client.get(path, useAuth: false);
    _client.throwIfNotOk('getMovies', response);
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final api = ApiResponse.fromJson(
      json,
      (d) => PageResponse.fromJson(d as Map<String, dynamic>, (e) => MovieModel.fromJson(e as Map<String, dynamic>)),
    );
    if (!api.success || api.data == null) throw Exception(api.message ?? '영화 목록 조회 실패');
    return api.data!;
  }

  /// GET /api/movies/{movieId}
  Future<MovieModel> getMovie(int movieId) async {
    final path = '$apiPathMovieDetail/$movieId';
    final response = await _client.get(path, useAuth: false);
    _client.throwIfNotOk('getMovie', response);
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final api = ApiResponse.fromJson(json, (d) => MovieModel.fromJson(d as Map<String, dynamic>));
    if (!api.success || api.data == null) throw Exception(api.message ?? '영화 상세 조회 실패');
    return api.data!;
  }
}
