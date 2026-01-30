import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../models/api_response.dart';
import '../../models/movie.dart';
import '../../provider/api_providers.dart';
import '../../theme/cinema_theme.dart';
import '../../widgets/glass_card.dart';
import 'movie_detail_screen.dart';

/// 영화 목록 화면 (영화찾기 탭)
class MoviesScreen extends ConsumerStatefulWidget {
  const MoviesScreen({super.key});

  @override
  ConsumerState<MoviesScreen> createState() => _MoviesScreenState();
}

class _MoviesScreenState extends ConsumerState<MoviesScreen> {
  AsyncValue<PageResponse<MovieModel>> _movies = const AsyncValue.loading();

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _movies = const AsyncValue.loading());
    try {
      final page = await ref.read(movieApiServiceProvider).getMovies();
      if (mounted) setState(() => _movies = AsyncValue.data(page));
    } catch (e, st) {
      if (mounted) setState(() => _movies = AsyncValue.error(e, st));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CinemaColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          '영화찾기',
          style: GoogleFonts.bebasNeue(
            fontSize: 24,
            color: CinemaColors.textPrimary,
            letterSpacing: 2,
          ),
        ),
      ),
      body: _movies.when(
        data: (page) {
          if (page.content.isEmpty) {
            return Center(
              child: Text(
                '상영 중인 영화가 없습니다.',
                style: GoogleFonts.roboto(color: CinemaColors.textMuted),
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: _load,
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: page.content.length,
              itemBuilder: (context, index) {
                final movie = page.content[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _MovieListTile(
                    movie: movie,
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => MovieDetailScreen(movieId: movie.id),
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                e.toString(),
                style: GoogleFonts.roboto(color: CinemaColors.neonRed),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: _load,
                child: const Text('다시 시도'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MovieListTile extends StatelessWidget {
  const _MovieListTile({required this.movie, required this.onTap});

  final MovieModel movie;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      borderRadius: 16,
      blur: 16,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 80,
              height: 112,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    CinemaColors.neonBlue.withValues(alpha: 0.3),
                    CinemaColors.neonPurple.withValues(alpha: 0.2),
                  ],
                ),
              ),
              child: movie.posterUrl != null && movie.posterUrl!.isNotEmpty
                  ? null
                  : Icon(Icons.movie_outlined, size: 40, color: CinemaColors.textMuted),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    movie.title,
                    style: GoogleFonts.bebasNeue(
                      fontSize: 18,
                      color: CinemaColors.textPrimary,
                      letterSpacing: 1,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (movie.genre != null && movie.genre!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      movie.genre!,
                      style: GoogleFonts.roboto(
                        fontSize: 12,
                        color: CinemaColors.textMuted,
                      ),
                    ),
                  ],
                  if (movie.runningTime != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      '${movie.runningTime}분',
                      style: GoogleFonts.roboto(
                        fontSize: 12,
                        color: CinemaColors.textSecondary,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: CinemaColors.textMuted),
          ],
        ),
      ),
    );
  }
}
