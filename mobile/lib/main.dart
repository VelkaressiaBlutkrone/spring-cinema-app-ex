// 영화관 예매 모바일 앱
// 2026 Modern Premium Cinematic Style
// 상태 관리: flutter_riverpod
// 라우팅: go_router
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'routes/app_router.dart';
import 'theme/cinema_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF0A0A0A),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  runApp(
    const ProviderScope(
      child: CinemaApp(),
    ),
  );
}

class CinemaApp extends ConsumerWidget {
  const CinemaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    return MaterialApp.router(
      title: '영화관 예매',
      debugShowCheckedModeBanner: false,
      theme: CinemaTheme.dark,
      routerConfig: router,
    );
  }
}
