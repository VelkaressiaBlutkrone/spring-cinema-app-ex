import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/config/api_config.dart';
import 'package:mobile/provider/auth_provider.dart';
import 'package:mobile/services/api_client.dart';
import 'package:mobile/services/movie_api_service.dart';
import 'package:mobile/services/reservation_api_service.dart';
import 'package:mobile/services/screening_api_service.dart';

/// API 클라이언트 (Bearer 토큰 주입)
final apiClientProvider = Provider<ApiClient>((ref) {
  final auth = ref.watch(authApiServiceProvider);
  return ApiClient(
    baseUrl: apiBaseUrl,
    getAccessToken: auth.getAccessToken,
  );
});

/// 영화 API 서비스
final movieApiServiceProvider = Provider<MovieApiService>((ref) {
  return MovieApiService(ref.watch(apiClientProvider));
});

/// 상영·좌석 API 서비스
final screeningApiServiceProvider = Provider<ScreeningApiService>((ref) {
  return ScreeningApiService(ref.watch(apiClientProvider));
});

/// 예매·결제 API 서비스
final reservationApiServiceProvider = Provider<ReservationApiService>((ref) {
  return ReservationApiService(ref.watch(apiClientProvider));
});
