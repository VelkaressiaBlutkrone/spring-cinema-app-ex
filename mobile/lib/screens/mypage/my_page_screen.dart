// 마이페이지 — 웹 MyPage와 동일 구성
// 탭: 내 정보 / 장바구니 / 결제·예매 내역
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../theme/cinema_theme.dart';
import '../../theme/cinema_animations.dart';
import 'widgets/profile_tab.dart';
import 'widgets/holds_tab.dart';
import 'widgets/reservations_tab.dart';

enum MyPageTab { profile, holds, reservations }

class MyPageScreen extends ConsumerStatefulWidget {
  const MyPageScreen({super.key});

  @override
  ConsumerState<MyPageScreen> createState() => _MyPageScreenState();
}

class _MyPageScreenState extends ConsumerState<MyPageScreen> {
  MyPageTab _tab = MyPageTab.profile;

  void _onTabChanged(MyPageTab tab) {
    setState(() => _tab = tab);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CinemaColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          '마이페이지',
          style: GoogleFonts.bebasNeue(
            fontSize: 24,
            color: CinemaColors.textPrimary,
            letterSpacing: 2,
          ),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildTabBar(),
          Expanded(
            child: AnimatedSwitcher(
              duration: CinemaAnimations.normal,
              switchInCurve: CinemaAnimations.defaultCurve,
              child: switch (_tab) {
                MyPageTab.profile => const ProfileTab(key: ValueKey('profile')),
                MyPageTab.holds => const HoldsTab(key: ValueKey('holds')),
                MyPageTab.reservations => const ReservationsTab(key: ValueKey('reservations')),
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: CinemaColors.glassBorder)),
      ),
      child: Row(
        children: [
          _tabChip('내 정보', _tab == MyPageTab.profile, () => _onTabChanged(MyPageTab.profile)),
          _tabChip('장바구니', _tab == MyPageTab.holds, () => _onTabChanged(MyPageTab.holds)),
          _tabChip('결제/예매 내역', _tab == MyPageTab.reservations, () => _onTabChanged(MyPageTab.reservations)),
        ],
      ),
    );
  }

  Widget _tabChip(String label, bool isActive, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isActive ? CinemaColors.neonBlue : Colors.transparent,
              width: 2,
            ),
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.roboto(
            fontSize: 14,
            fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
            color: isActive ? CinemaColors.neonBlue : CinemaColors.textMuted,
          ),
        ),
      ),
    );
  }
}
