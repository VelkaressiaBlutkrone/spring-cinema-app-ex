// 프론트엔드(React) 사용자 메인화면과 동일 구성
// Hero, 영화관 현황, 3일 이내 상영 예정, 나의 최근 예매 / 빠른 예매
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../provider/auth_provider.dart';
import '../../provider/home_providers.dart';
import '../../theme/cinema_theme.dart';
import 'widgets/cinema_home_hero.dart';
import 'widgets/cinema_home_stats.dart';
import 'widgets/cinema_home_upcoming.dart';
import 'widgets/cinema_home_recent.dart';

class CinemaHomeScreen extends ConsumerWidget {
  const CinemaHomeScreen({super.key});

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Text(
        title.toUpperCase(),
        style: GoogleFonts.bebasNeue(
          fontSize: 18,
          color: CinemaColors.textPrimary,
          letterSpacing: 2,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLoggedIn = ref.watch(authStateProvider).value == true;
    final homeAsync = ref.watch(homeDataProvider);

    return Scaffold(
      backgroundColor: CinemaColors.background,
      body: Stack(
        children: [
          _buildBackground(),
          SafeArea(
            child: CustomScrollView(
              physics: const BouncingScrollPhysics(),
              slivers: [
                // SliverAppBar — 스크롤 시 히어로 축소 + 배경 blur
                SliverAppBar(
                  expandedHeight: 200,
                  floating: false,
                  pinned: true,
                  backgroundColor: Colors.transparent,
                  elevation: 0,
                  flexibleSpace: const FlexibleSpaceBar(
                    background: CinemaHomeHero(),
                  ),
                  // 축소 시 glass 헤더
                  title: null,
                ),
                const SliverToBoxAdapter(child: SizedBox(height: 24)),
                ...homeAsync.when(
                  data: (data) => [
                    SliverToBoxAdapter(child: _buildSectionTitle('영화관 현황')),
                    const SliverToBoxAdapter(child: SizedBox(height: 12)),
                    SliverToBoxAdapter(child: CinemaHomeStats(stats: data.stats)),
                    const SliverToBoxAdapter(child: SizedBox(height: 32)),
                    SliverToBoxAdapter(child: _buildSectionTitle('3일 이내 상영 예정 영화')),
                    const SliverToBoxAdapter(child: SizedBox(height: 12)),
                    SliverToBoxAdapter(child: CinemaHomeUpcoming(upcoming: data.upcoming)),
                    const SliverToBoxAdapter(child: SizedBox(height: 32)),
                    SliverToBoxAdapter(
                      child: _buildSectionTitle(
                        isLoggedIn && data.reservations.isNotEmpty ? '나의 최근 예매' : '빠른 예매',
                      ),
                    ),
                    const SliverToBoxAdapter(child: SizedBox(height: 12)),
                    SliverToBoxAdapter(
                      child: CinemaHomeRecent(
                        isLoggedIn: isLoggedIn,
                        reservations: data.reservations,
                      ),
                    ),
                    const SliverToBoxAdapter(child: SizedBox(height: 100)),
                  ],
                  loading: () => [
                    const SliverFillRemaining(
                      child: Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            CircularProgressIndicator(color: CinemaColors.neonBlue),
                            SizedBox(height: 16),
                            Text(
                              '메인 화면을 불러오는 중...',
                              style: TextStyle(color: CinemaColors.textMuted),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                  error: (e, _) => [
                    SliverFillRemaining(
                      child: Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              e.toString(),
                              style: GoogleFonts.roboto(color: CinemaColors.neonRed, fontSize: 12),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 16),
                            TextButton(
                              onPressed: () => ref.invalidate(homeDataProvider),
                              child: const Text('다시 시도'),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBackground() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF0A0A0A),
            Color(0xFF121212),
            Color(0xFF0A0A0A),
          ],
        ),
      ),
    );
  }
}
