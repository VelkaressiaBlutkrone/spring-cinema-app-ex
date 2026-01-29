// Main tab screen with bottom navigation
// 홈 / 영화찾기 / 예매내역 / 마이페이지
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/cinema_theme.dart';
import 'home/cinema_home_screen.dart';

class MainTabScreen extends StatefulWidget {
  const MainTabScreen({super.key});

  @override
  State<MainTabScreen> createState() => _MainTabScreenState();
}

class _MainTabScreenState extends State<MainTabScreen> {
  int _currentIndex = 0;

  static const List<_TabItem> _tabs = [
    _TabItem(icon: Icons.home_rounded, label: '홈'),
    _TabItem(icon: Icons.movie_creation_rounded, label: '영화찾기'),
    _TabItem(icon: Icons.confirmation_number_rounded, label: '예매내역'),
    _TabItem(icon: Icons.person_rounded, label: '마이페이지'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CinemaColors.background,
      body: IndexedStack(
        index: _currentIndex,
        children: [
          const CinemaHomeScreen(),
          _PlaceholderScreen(title: '영화찾기'),
          _PlaceholderScreen(title: '예매내역'),
          _PlaceholderScreen(title: '마이페이지'),
        ],
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: BoxDecoration(
        color: CinemaColors.surface.withValues(alpha: 0.95),
        border: Border(
          top: BorderSide(
            color: CinemaColors.glassBorder,
            width: 0.5,
          ),
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(
              _tabs.length,
              (index) => _NavItem(
                icon: _tabs[index].icon,
                label: _tabs[index].label,
                isActive: _currentIndex == index,
                onTap: () => setState(() => _currentIndex = index),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _TabItem {
  final IconData icon;
  final String label;
  const _TabItem({required this.icon, required this.label});
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isActive ? CinemaColors.neonBlue : Colors.transparent,
              width: 2,
            ),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 24,
              color: isActive ? CinemaColors.neonBlue : CinemaColors.textMuted,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: GoogleFonts.roboto(
                fontSize: 11,
                color: isActive ? CinemaColors.textPrimary : CinemaColors.textMuted,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PlaceholderScreen extends StatelessWidget {
  const _PlaceholderScreen({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        title,
        style: GoogleFonts.bebasNeue(
          fontSize: 24,
          color: CinemaColors.textMuted,
          letterSpacing: 2,
        ),
      ),
    );
  }
}
