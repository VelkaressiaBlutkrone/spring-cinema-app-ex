import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../provider/auth_provider.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/signup_screen.dart';
import '../screens/main_tab_screen.dart';
import '../theme/cinema_animations.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isLoggedIn = authState.value == true;
      final isLoading = authState.isLoading;
      final isAuthRoute = state.matchedLocation == '/login' || state.matchedLocation == '/signup';

      if (isLoading) return null;

      if (!isLoggedIn && !isAuthRoute) return '/login';
      if (isLoggedIn && isAuthRoute) return '/';

      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const MainTabScreen(),
          transitionsBuilder: CinemaAnimations.pageTransitionBuilder,
          transitionDuration: CinemaAnimations.normal,
          reverseTransitionDuration: const Duration(milliseconds: 200),
        ),
      ),
      GoRoute(
        path: '/login',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const LoginScreen(),
          transitionsBuilder: CinemaAnimations.modalTransitionBuilder,
          transitionDuration: CinemaAnimations.slow,
          reverseTransitionDuration: CinemaAnimations.normal,
        ),
      ),
      GoRoute(
        path: '/signup',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const SignupScreen(),
          transitionsBuilder: CinemaAnimations.modalTransitionBuilder,
          transitionDuration: CinemaAnimations.slow,
          reverseTransitionDuration: CinemaAnimations.normal,
        ),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('페이지를 찾을 수 없습니다: ${state.error}'),
      ),
    ),
  );
});
