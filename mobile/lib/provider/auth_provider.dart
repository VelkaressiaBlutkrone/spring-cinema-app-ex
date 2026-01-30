import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/services/auth_api_service.dart';

/// AuthApiService 싱글톤 프로바이더
final authApiServiceProvider = Provider<AuthApiService>((ref) {
  return AuthApiService();
});

/// 인증 상태: true = 로그인됨, false = 미로그인, 로딩/에러는 AsyncValue로 표현
final authStateProvider =
    NotifierProvider<AuthNotifier, AsyncValue<bool>>(AuthNotifier.new);

class AuthNotifier extends Notifier<AsyncValue<bool>> {
  @override
  AsyncValue<bool> build() {
    Future.microtask(() => _checkToken());
    return const AsyncValue.loading();
  }

  Future<void> _checkToken() async {
    final service = ref.read(authApiServiceProvider);
    try {
      final token = await service.getAccessToken();
      state = AsyncValue.data((token ?? '').isNotEmpty);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  /// 로그인 성공 시 상태를 true로 갱신
  void setLoggedIn() {
    state = const AsyncValue.data(true);
  }

  /// 로그아웃 또는 토큰 만료 시 false로 갱신
  void setLoggedOut() {
    state = const AsyncValue.data(false);
  }

  /// 로그인 실행 (실패 시 AppException throw)
  Future<void> login(String loginId, String password) async {
    final service = ref.read(authApiServiceProvider);
    await service.login(loginId, password);
    setLoggedIn();
  }

  /// 회원가입 실행 (실패 시 AppException throw)
  Future<int> signup({
    required String loginId,
    required String password,
    required String name,
    required String email,
    String? phone,
  }) async {
    final service = ref.read(authApiServiceProvider);
    return service.signup(
      loginId: loginId,
      password: password,
      name: name,
      email: email,
      phone: phone,
    );
  }

  /// 로그아웃
  Future<void> logout() async {
    final service = ref.read(authApiServiceProvider);
    await service.logout();
    setLoggedOut();
  }

  /// 토큰 갱신 (401 시 호출). 실패 시 AppException throw
  Future<void> refreshToken() async {
    final service = ref.read(authApiServiceProvider);
    await service.refresh();
    setLoggedIn();
  }
}
