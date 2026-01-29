/// 영화관 예매 모바일 앱
/// 2026 Modern Premium Cinematic Style
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'theme/cinema_theme.dart';
import 'screens/main_tab_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // Force dark status bar
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF0A0A0A),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const CinemaApp());
}

class CinemaApp extends StatelessWidget {
  const CinemaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '영화관 예매',
      debugShowCheckedModeBanner: false,
      theme: CinemaTheme.dark,
      home: const MainTabScreen(),
    );
  }
}
