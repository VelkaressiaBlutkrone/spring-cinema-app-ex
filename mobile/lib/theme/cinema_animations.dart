// 공통 애니메이션 상수 및 유틸리티
// flutter_animate 체이닝에서 일관된 설정을 위해 사용
import 'package:flutter/material.dart';

class CinemaAnimations {
  CinemaAnimations._();

  // --- Duration ---
  static const Duration fast = Duration(milliseconds: 150);
  static const Duration normal = Duration(milliseconds: 300);
  static const Duration slow = Duration(milliseconds: 400);
  static const Duration slower = Duration(milliseconds: 500);

  // --- Curve ---
  static const Curve defaultCurve = Curves.easeOutCubic;
  static const Curve enterCurve = Curves.easeOutCubic;
  static const Curve exitCurve = Curves.easeInCubic;
  static const Curve bounceCurve = Curves.elasticOut;

  // --- Offset ---
  static const double slideOffset = 20.0;
  static const double slideOffsetLarge = 40.0;

  // --- Scale ---
  static const double scaleBegin = 0.95;
  static const double pressScale = 0.97;

  // --- Stagger ---
  static const Duration staggerDelay = Duration(milliseconds: 50);
  static const Duration staggerDelayFast = Duration(milliseconds: 30);

  /// 리스트 아이템의 stagger delay 계산
  static Duration staggerDelayFor(int index, {Duration? interval}) {
    return (interval ?? staggerDelay) * index;
  }

  // --- 페이지 전환 ---

  /// fade + slideUp 페이지 전환 (go_router CustomTransitionPage용)
  static Widget pageTransitionBuilder(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return FadeTransition(
      opacity: CurvedAnimation(parent: animation, curve: defaultCurve),
      child: SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(0, 0.04),
          end: Offset.zero,
        ).animate(CurvedAnimation(parent: animation, curve: defaultCurve)),
        child: child,
      ),
    );
  }

  /// 모달 스타일 slideUp 전환
  static Widget modalTransitionBuilder(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(0, 1),
        end: Offset.zero,
      ).animate(CurvedAnimation(parent: animation, curve: defaultCurve)),
      child: child,
    );
  }
}
