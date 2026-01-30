import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../provider/auth_provider.dart';
import 'login_screen.dart';
import '../main_tab_screen.dart';

/// 인증 상태에 따라 로그인 화면 또는 메인 탭으로 분기
class AuthGate extends ConsumerWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    return authState.when(
      data: (isLoggedIn) {
        if (isLoggedIn) return const MainTabScreen();
        return const LoginScreen();
      },
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (err, _) => const LoginScreen(),
    );
  }
}
