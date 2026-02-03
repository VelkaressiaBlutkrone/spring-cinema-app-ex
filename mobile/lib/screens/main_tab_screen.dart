// Main tab screen with bottom navigation
// 홈 / 영화찾기 / 예매내역 / 마이페이지
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../provider/auth_provider.dart';
import '../provider/main_tab_provider.dart';
import '../theme/cinema_theme.dart';
import '../utils/jwt_utils.dart';
import 'home/cinema_home_screen.dart';
import 'movies/movies_screen.dart';
import 'mypage/my_page_screen.dart';
import 'reservations/reservations_screen.dart';

class MainTabScreen extends ConsumerStatefulWidget {
  const MainTabScreen({super.key});

  @override
  ConsumerState<MainTabScreen> createState() => _MainTabScreenState();
}

class _MainTabScreenState extends ConsumerState<MainTabScreen> {
  String? _loginId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadLoginId());
  }

  Future<void> _loadLoginId() async {
    final auth = ref.read(authApiServiceProvider);
    final token = await auth.getAccessToken();
    final id = getLoginIdFromToken(token);
    if (mounted) setState(() => _loginId = id);
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = ref.watch(mainTabIndexProvider);
    final isLoggedIn = ref.watch(authStateProvider).value == true;
    return Scaffold(
      backgroundColor: CinemaColors.background,
      appBar: isLoggedIn
          ? AppBar(
              backgroundColor: Colors.transparent,
              elevation: 0,
              title: Text(
                '영화관 예매',
                style: GoogleFonts.bebasNeue(
                  fontSize: 20,
                  color: CinemaColors.textPrimary,
                  letterSpacing: 2,
                ),
              ),
              actions: [
                GestureDetector(
                  onTap: () => ref.read(mainTabIndexProvider.notifier).setIndex(3),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Text(
                      _loginId ?? '회원',
                      style: GoogleFonts.roboto(
                        fontSize: 14,
                        color: CinemaColors.textMuted,
                      ),
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
                    ),
                  ),
                ),
              ],
            )
          : null,
      body: IndexedStack(
        index: currentIndex,
        children: const [
          CinemaHomeScreen(),
          MoviesScreen(),
          ReservationsScreen(),
          MyPageScreen(),
        ],
      ),
      bottomNavigationBar: _buildBottomNav(currentIndex),
    );
  }

  Widget _buildBottomNav(int currentIndex) {
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
              _MainTabScreenState._tabs.length,
              (index) => _NavItem(
                icon: _MainTabScreenState._tabs[index].icon,
                label: _MainTabScreenState._tabs[index].label,
                isActive: currentIndex == index,
                onTap: () => ref.read(mainTabIndexProvider.notifier).setIndex(index),
              ),
            ),
          ),
        ),
      ),
    );
  }

  static const List<_TabItem> _tabs = [
    _TabItem(icon: Icons.home_rounded, label: '홈'),
    _TabItem(icon: Icons.movie_creation_rounded, label: '영화찾기'),
    _TabItem(icon: Icons.confirmation_number_rounded, label: '예매내역'),
    _TabItem(icon: Icons.person_rounded, label: '마이페이지'),
  ];
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

