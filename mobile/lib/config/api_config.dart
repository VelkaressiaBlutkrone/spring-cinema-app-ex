import 'package:flutter/foundation.dart';

/// API 기본 URL (개발/운영에서 오버라이드 가능)
/// - Web(Chrome 등): http://localhost:8080 (브라우저와 동일 호스트)
/// - Android 에뮬레이터: http://10.0.2.2:8080
/// - iOS 시뮬레이터: http://localhost:8080
/// - 실제 기기: 실제 서버 URL (HTTPS 권장)
const String _apiBaseUrlEnv = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:8080',
);

/// Docker/nginx 배포 시 상대 경로 사용 (예: --dart-define=API_BASE_URL=)
const String _webApiBaseUrl = String.fromEnvironment(
  'WEB_API_BASE_URL',
  defaultValue: 'http://localhost:8080',
);

/// 플랫폼별 API 기본 URL.
/// - Web: 로컬 개발 시 localhost:8080, Docker 빌드 시 ''(상대경로)
/// - Native: API_BASE_URL 또는 10.0.2.2:8080 (Android 에뮬레이터)
String get apiBaseUrl {
  if (kIsWeb) {
    return _webApiBaseUrl.isEmpty ? '' : _webApiBaseUrl;
  }
  return _apiBaseUrlEnv;
}

/// 인증 API 경로 (apiBaseUrl 기준)
const String apiPathPublicKey = '/api/public-key';
const String apiPathMembers = '/api/members';
const String apiPathLogin = '$apiPathMembers/login';
const String apiPathSignup = '$apiPathMembers/signup';
const String apiPathRefresh = '$apiPathMembers/refresh';
const String apiPathLogout = '$apiPathMembers/logout';

/// Refresh Token 쿠키 이름 (서버 application.yml과 동일)
const String refreshTokenCookieName = 'cinema_refresh';

/// 영화 API (Step16)
const String apiPathMovies = '/api/movies';
const String apiPathMovieDetail = '/api/movies'; // /{movieId}

/// 상영 API (Step16)
const String apiPathScreenings = '/api/screenings';
const String apiPathScreeningsByMovie = '/api/screenings/by-movie';
const String apiPathScreeningSeats = '/api/screenings'; // /{screeningId}/seats
const String apiPathSeatEvents = '/api/screenings'; // /{screeningId}/seat-events (SSE)
const String apiPathHold = '/api/screenings'; // /{screeningId}/seats/{seatId}/hold
const String apiPathHoldRelease = '/api/screenings/holds/release';

/// 예매·결제 API (Step16)
const String apiPathReservations = '/api/reservations';
const String apiPathReservationPay = '/api/reservations/pay';
const String apiPathReservationDetail = '/api/reservations'; // /{reservationId}
const String apiPathReservationCancel = '/api/reservations'; // /{reservationId}/cancel

/// 홈 API (메인 화면)
const String apiPathHome = '/api/home';
const String apiPathHomeStats = '/api/home/stats';
const String apiPathHomeUpcomingMovies = '/api/home/upcoming-movies';
