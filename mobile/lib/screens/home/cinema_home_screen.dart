/// 2026 Modern Premium Cinematic Home Dashboard
/// Deep black, glassmorphism 2.0, neon accents, immersive movie theater atmosphere
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../theme/cinema_theme.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/neon_button.dart';

class CinemaHomeScreen extends StatelessWidget {
  const CinemaHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CinemaColors.background,
      body: Stack(
        children: [
          // Background: cinematic grain + volumetric light leak
          _buildBackground(),
          // Scrollable content
          SafeArea(
            child: CustomScrollView(
              slivers: [
                // Hero section: large trending poster
                SliverToBoxAdapter(child: _buildHeroSection(context)),
                const SliverToBoxAdapter(child: SizedBox(height: 24)),
                // Floating glassmorphic quick booking card
                SliverToBoxAdapter(child: _buildQuickBookingCard(context)),
                const SliverToBoxAdapter(child: SizedBox(height: 32)),
                // 인기 상영작 carousel
                SliverToBoxAdapter(child: _buildSectionTitle('인기 상영작')),
                const SliverToBoxAdapter(child: SizedBox(height: 12)),
                SliverToBoxAdapter(child: _buildPopularCarousel()),
                const SliverToBoxAdapter(child: SizedBox(height: 32)),
                // 3일 이내 상영 예정 영화
                SliverToBoxAdapter(child: _buildSectionTitle('3일 이내 상영 예정 영화')),
                const SliverToBoxAdapter(child: SizedBox(height: 12)),
                SliverToBoxAdapter(child: _buildUpcomingSection()),
                const SliverToBoxAdapter(child: SizedBox(height: 32)),
                // 나의 최근 예매
                SliverToBoxAdapter(child: _buildSectionTitle('나의 최근 예매')),
                const SliverToBoxAdapter(child: SizedBox(height: 12)),
                SliverToBoxAdapter(child: _buildRecentReservations()),
                const SliverToBoxAdapter(child: SizedBox(height: 100)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBackground() {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Base gradient (deep black charcoal)
        Container(
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
        ),
        // Volumetric light leak (subtle red & electric blue)
        Positioned(
          top: -100,
          right: -100,
          child: Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  CinemaColors.neonRed.withOpacity(0.08),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),
        Positioned(
          top: 100,
          left: -80,
          child: Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  CinemaColors.neonBlue.withOpacity(0.06),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHeroSection(BuildContext context) {
    return SizedBox(
      height: 280,
      width: double.infinity,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Blurred dynamic poster (gradient placeholder)
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  CinemaColors.neonRed.withOpacity(0.2),
                  CinemaColors.neonBlue.withOpacity(0.15),
                  CinemaColors.surface,
                ],
              ),
            ),
          ),
          // Rim light overlay
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  CinemaColors.neonBlue.withOpacity(0.1),
                  Colors.transparent,
                  CinemaColors.neonRed.withOpacity(0.05),
                ],
              ),
            ),
          ),
          // Blur overlay for depth
          ClipRect(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 2, sigmaY: 2),
              child: Container(color: Colors.transparent),
            ),
          ),
          // Title overlay
          Positioned(
            left: 20,
            right: 20,
            bottom: 24,
            child: Text(
              'TRENDING NOW',
              style: GoogleFonts.bebasNeue(
                fontSize: 28,
                color: CinemaColors.textPrimary.withOpacity(0.9),
                letterSpacing: 4,
                shadows: [
                  Shadow(
                    color: CinemaColors.neonBlue.withOpacity(0.5),
                    blurRadius: 12,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickBookingCard(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GlassCard(
        padding: const EdgeInsets.all(24),
        borderRadius: 24,
        blur: 24,
        child: Column(
          children: [
            Text(
              '빠른 예매',
              style: GoogleFonts.bebasNeue(
                fontSize: 20,
                color: CinemaColors.textPrimary,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 16),
            NeonButton(
              label: '지금 바로 예매하기',
              onPressed: () {},
              isPrimary: true,
            ),
          ],
        ),
      ),
    );
  }

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

  Widget _buildPopularCarousel() {
    final items = [
      _MovieItem(title: '듄: 파트 2', rating: 4.8, isHot: true),
      _MovieItem(title: '오펜하이머', rating: 4.9, isHot: true),
      _MovieItem(title: '스파이더맨', rating: 4.5, isHot: false),
    ];
    return SizedBox(
      height: 220,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final item = items[index];
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: _PopularPosterCard(item: item),
          );
        },
      ),
    );
  }

  Widget _buildUpcomingSection() {
    final items = [
      _UpcomingItem(title: '블레이드', date: '12/25 14:00'),
      _UpcomingItem(title: '어벤져스 5', date: '12/26 19:30'),
      _UpcomingItem(title: '배트맨', date: '12/27 11:00'),
    ];
    return SizedBox(
      height: 140,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final item = items[index];
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6),
            child: _UpcomingCard(item: item),
          );
        },
      ),
    );
  }

  Widget _buildRecentReservations() {
    // Empty state for demo
    const hasReservations = false;
    if (hasReservations) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: GlassCard(
          child: Column(
            children: [
              ListTile(
                title: Text('듄: 파트 2', style: GoogleFonts.roboto(color: CinemaColors.textPrimary)),
                subtitle: Text('12/24 19:30 · CGV 강남 1관', style: GoogleFonts.roboto(color: CinemaColors.textSecondary, fontSize: 12)),
              ),
            ],
          ),
        ),
      );
    }
    return _buildEmptyReservationState();
  }

  Widget _buildEmptyReservationState() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GlassCard(
        padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
        child: Column(
          children: [
            // Film reel illustration (simplified)
            Icon(
              Icons.movie_filter_outlined,
              size: 64,
              color: CinemaColors.textMuted.withOpacity(0.6),
            ),
            const SizedBox(height: 16),
            Text(
              '첫 예매를 시작해보세요',
              style: GoogleFonts.roboto(
                fontSize: 16,
                color: CinemaColors.textSecondary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '인기 상영작에서 영화를 선택하고\n좌석을 예매해 보세요',
              textAlign: TextAlign.center,
              style: GoogleFonts.roboto(
                fontSize: 13,
                color: CinemaColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MovieItem {
  final String title;
  final double rating;
  final bool isHot;
  _MovieItem({required this.title, required this.rating, required this.isHot});
}

class _UpcomingItem {
  final String title;
  final String date;
  _UpcomingItem({required this.title, required this.date});
}

class _PopularPosterCard extends StatelessWidget {
  const _PopularPosterCard({required this.item});

  final _MovieItem item;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 140,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Stack(
              children: [
                Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        CinemaColors.neonRed.withOpacity(0.3),
                        CinemaColors.neonBlue.withOpacity(0.2),
                      ],
                    ),
                  ),
                ),
                if (item.isHot)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: CinemaColors.neonRed.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: [
                          BoxShadow(
                            color: CinemaColors.neonRed.withOpacity(0.5),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: Text(
                        'HOT',
                        style: GoogleFonts.bebasNeue(
                          fontSize: 12,
                          color: Colors.white,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            item.title,
            style: GoogleFonts.bebasNeue(
              fontSize: 16,
              color: CinemaColors.textPrimary,
              letterSpacing: 1,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Row(
            children: [
              Icon(Icons.star, size: 14, color: CinemaColors.neonAmber),
              const SizedBox(width: 4),
              Text(
                item.rating.toString(),
                style: GoogleFonts.roboto(
                  fontSize: 12,
                  color: CinemaColors.textSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _UpcomingCard extends StatelessWidget {
  const _UpcomingCard({required this.item});

  final _UpcomingItem item;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 160,
      child: GlassCard(
        padding: const EdgeInsets.all(12),
        borderRadius: 16,
        blur: 16,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              height: 80,
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                gradient: LinearGradient(
                  colors: [
                    CinemaColors.neonBlue.withOpacity(0.2),
                    CinemaColors.neonPurple.withOpacity(0.15),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              item.title,
              style: GoogleFonts.bebasNeue(
                fontSize: 14,
                color: CinemaColors.textPrimary,
                letterSpacing: 1,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            Text(
              item.date,
              style: GoogleFonts.roboto(
                fontSize: 11,
                color: CinemaColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
