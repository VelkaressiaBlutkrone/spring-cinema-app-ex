// 프론트엔드(React) 사용자 메인화면과 동일 구성
// Hero, 영화관 현황, 3일 이내 상영 예정, 나의 최근 예매 / 빠른 예매
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../models/home.dart';
import '../../models/reservation.dart';
import '../../provider/api_providers.dart';
import '../../provider/auth_provider.dart';
import '../../provider/main_tab_provider.dart';
import '../../theme/cinema_theme.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/neon_button.dart';
import '../movies/movie_detail_screen.dart';

const int _recentReservationsLimit = 5;

class CinemaHomeScreen extends ConsumerStatefulWidget {
  const CinemaHomeScreen({super.key});

  @override
  ConsumerState<CinemaHomeScreen> createState() => _CinemaHomeScreenState();
}

class _CinemaHomeScreenState extends ConsumerState<CinemaHomeScreen> {
  bool _loading = true;
  HomeStatsModel? _stats;
  List<UpcomingMovieModel> _upcoming = [];
  List<ReservationDetailModel> _reservations = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final homeService = ref.read(homeApiServiceProvider);
    final isLoggedIn = ref.read(authStateProvider).value == true;

    try {
      final stats = await homeService.getStats();
      final upcoming = await homeService.getUpcomingMovies(days: 3);
      if (!mounted) return;
      setState(() {
        _stats = stats;
        _upcoming = upcoming;
      });

      if (isLoggedIn) {
        final resService = ref.read(reservationApiServiceProvider);
        final list = await resService.getMyReservations();
        if (mounted) {
          setState(() {
            _reservations = list.take(_recentReservationsLimit).toList();
          });
        }
      }
    } catch (_) {
      if (mounted) setState(() {});
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CinemaColors.background,
      body: Stack(
        children: [
          _buildBackground(),
          SafeArea(
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(child: _buildHeroSection()),
                const SliverToBoxAdapter(child: SizedBox(height: 24)),
                if (_loading)
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
                  )
                else
                  ..._buildContentSlivers(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildContentSlivers() {
    return [
      // 영화관 현황
      if (_stats != null) ...[
        SliverToBoxAdapter(child: _buildSectionTitle('영화관 현황')),
        const SliverToBoxAdapter(child: SizedBox(height: 12)),
        SliverToBoxAdapter(child: _buildStatsCard()),
        const SliverToBoxAdapter(child: SizedBox(height: 32)),
      ],
      // 3일 이내 상영 예정 영화
      SliverToBoxAdapter(child: _buildSectionTitle('3일 이내 상영 예정 영화')),
      const SliverToBoxAdapter(child: SizedBox(height: 12)),
      SliverToBoxAdapter(child: _buildUpcomingSection()),
      const SliverToBoxAdapter(child: SizedBox(height: 32)),
      // 나의 최근 예매 / 빠른 예매
      SliverToBoxAdapter(
        child: _buildSectionTitle(
          ref.watch(authStateProvider).value == true && _reservations.isNotEmpty
              ? '나의 최근 예매'
              : '빠른 예매',
        ),
      ),
      const SliverToBoxAdapter(child: SizedBox(height: 12)),
      SliverToBoxAdapter(child: _buildRecentOrQuickSection()),
      const SliverToBoxAdapter(child: SizedBox(height: 100)),
    ];
  }

  Widget _buildBackground() {
    return Stack(
      fit: StackFit.expand,
      children: [
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
      ],
    );
  }

  /// Hero: 프론트엔드와 동일 — "영화관 예매" + 부제
  Widget _buildHeroSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.fromLTRB(24, 32, 24, 32),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              CinemaColors.neonRed.withValues(alpha: 0.2),
              CinemaColors.neonBlue.withValues(alpha: 0.1),
              CinemaColors.surface,
            ],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '영화관 예매',
              style: GoogleFonts.bebasNeue(
                fontSize: 36,
                color: CinemaColors.textPrimary,
                letterSpacing: 4,
                shadows: [
                  Shadow(
                    color: CinemaColors.neonBlue.withValues(alpha: 0.3),
                    blurRadius: 20,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '상영 중인 영화를 확인하고 편리하게 예매하세요.',
              style: GoogleFonts.roboto(
                fontSize: 14,
                color: CinemaColors.textMuted,
              ),
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

  Widget _buildStatsCard() {
    final s = _stats!;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GlassCard(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        borderRadius: 20,
        blur: 20,
        child: Wrap(
          spacing: 24,
          runSpacing: 12,
          children: [
            _statChip('영화관', '${s.theaterCount}개'),
            _statChip('상영관', '${s.screenCount}개'),
            _statChip('오늘 상영', '${s.todayScreeningCount}편'),
          ],
        ),
      ),
    );
  }

  Widget _statChip(String label, String value) {
    return Text.rich(
      TextSpan(
        style: GoogleFonts.roboto(fontSize: 14, color: CinemaColors.textMuted),
        children: [
          TextSpan(text: '$label '),
          TextSpan(
            text: value,
            style: GoogleFonts.roboto(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: CinemaColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  /// 상영 예정 영화 — 수평 스크롤 (앨범 넘기기, 웹과 동일 UX)
  Widget _buildUpcomingSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GlassCard(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        borderRadius: 20,
        blur: 20,
        child: _upcoming.isEmpty
            ? Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Text(
                  '상영 예정 영화가 없습니다.',
                  style: GoogleFonts.roboto(
                    fontSize: 14,
                    color: CinemaColors.textMuted,
                  ),
                ),
              )
            : SizedBox(
                height: 220,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _upcoming.length,
                  itemBuilder: (context, index) {
                    final m = _upcoming[index];
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      child: SizedBox(
                        width: 120,
                        child: _UpcomingMovieTile(
                          movie: m,
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute<void>(
                                builder: (_) => MovieDetailScreen(movieId: m.id),
                              ),
                            );
                          },
                        ),
                      ),
                    );
                  },
                ),
              ),
      ),
    );
  }

  Widget _buildRecentOrQuickSection() {
    final isLoggedIn = ref.watch(authStateProvider).value == true;
    final hasRecent = isLoggedIn && _reservations.isNotEmpty;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GlassCard(
        padding: const EdgeInsets.all(20),
        borderRadius: 20,
        blur: 20,
        child: hasRecent ? _buildRecentList() : _buildQuickBookingEmpty(),
      ),
    );
  }

  Widget _buildRecentList() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ..._reservations.map((r) => _RecentReservationTile(reservation: r)),
        const SizedBox(height: 16),
        GestureDetector(
          onTap: () => ref.read(mainTabIndexProvider.notifier).setIndex(2),
          child: Text(
            '예매 내역 전체 보기 →',
            style: GoogleFonts.roboto(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: CinemaColors.neonBlue,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildQuickBookingEmpty() {
    final isLoggedIn = ref.watch(authStateProvider).value == true;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const SizedBox(height: 24),
        Icon(
          Icons.movie_filter_outlined,
          size: 56,
          color: CinemaColors.textMuted.withValues(alpha: 0.6),
        ),
        const SizedBox(height: 16),
        Text(
          isLoggedIn ? '첫 예매를 시작해보세요' : '지금 바로 예매를 시작해보세요',
          style: GoogleFonts.roboto(
            fontSize: 16,
            color: CinemaColors.textMuted,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          '영화 목록에서 상영을 선택해 예매해 보세요.',
          style: GoogleFonts.roboto(
            fontSize: 13,
            color: CinemaColors.textMuted,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),
        NeonButton(
          label: '지금 바로 예매하기',
          onPressed: () => ref.read(mainTabIndexProvider.notifier).setIndex(1),
          isPrimary: true,
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}

class _UpcomingMovieTile extends StatelessWidget {
  const _UpcomingMovieTile({required this.movie, required this.onTap});

  final UpcomingMovieModel movie;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: AspectRatio(
              aspectRatio: 2 / 3,
              child: movie.posterUrl != null && movie.posterUrl!.isNotEmpty
                  ? Image.network(
                      movie.posterUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => _posterPlaceholder(),
                    )
                  : _posterPlaceholder(),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            movie.title,
            style: GoogleFonts.roboto(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: CinemaColors.textPrimary,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _posterPlaceholder() {
    return Container(
      color: CinemaColors.surfaceElevated,
      child: const Center(
        child: Text('🎬', style: TextStyle(fontSize: 32)),
      ),
    );
  }
}

class _RecentReservationTile extends StatelessWidget {
  const _RecentReservationTile({required this.reservation});

  final ReservationDetailModel reservation;

  static String _formatDateTime(String? iso) {
    if (iso == null || iso.isEmpty) return '-';
    try {
      return DateFormat('yyyy-MM-dd HH:mm').format(DateTime.parse(iso));
    } catch (_) {
      return iso;
    }
  }

  static String _formatPrice(int amount) {
    return NumberFormat('#,###원').format(amount);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: CinemaColors.glassBorder),
          color: CinemaColors.surface,
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    reservation.movieTitle,
                    style: GoogleFonts.roboto(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: CinemaColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${_formatDateTime(reservation.startTime)} · ${reservation.screenName}',
                    style: GoogleFonts.roboto(
                      fontSize: 12,
                      color: CinemaColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            Text(
              _formatPrice(reservation.totalAmount),
              style: GoogleFonts.roboto(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: CinemaColors.neonAmber,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
