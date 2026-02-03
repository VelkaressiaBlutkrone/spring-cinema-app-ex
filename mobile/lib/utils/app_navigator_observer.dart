import 'package:flutter/material.dart';

import 'app_logger.dart';

/// 화면 이동 시 로그 출력
class AppNavigatorObserver extends NavigatorObserver {
  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPush(route, previousRoute);
    final to = route.settings.name ?? _routeShortName(route);
    final from = previousRoute?.settings.name ?? _routeShortName(previousRoute) ?? '(최초)';
    if (from != '(최초)' || to != 'AuthGate') {
      logNavigation(from, to);
    }
  }

  String _routeShortName(Route<dynamic>? r) {
    if (r == null) return '(최초)';
    final s = r.toString();
    // MaterialPageRoute<void>(SeatSelectScreen(...)) -> SeatSelectScreen
    final match = RegExp(r'(\w+Screen|\w+Gate)').firstMatch(s);
    return match?.group(1) ?? s;
  }
}
