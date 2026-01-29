/// API 기본 URL (개발/운영에서 오버라이드 가능)
/// - Android 에뮬레이터: http://10.0.2.2:8080
/// - iOS 시뮬레이터: http://localhost:8080
/// - 실제 기기: 실제 서버 URL (HTTPS 권장)
const String apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:8080',
);

/// 인증 API 경로 (apiBaseUrl 기준)
const String apiPathPublicKey = '/api/public-key';
const String apiPathMembers = '/api/members';
const String apiPathLogin = '$apiPathMembers/login';
const String apiPathSignup = '$apiPathMembers/signup';
const String apiPathRefresh = '$apiPathMembers/refresh';
const String apiPathLogout = '$apiPathMembers/logout';

/// Refresh Token 쿠키 이름 (서버 application.yml과 동일)
const String refreshTokenCookieName = 'cinema_refresh';
