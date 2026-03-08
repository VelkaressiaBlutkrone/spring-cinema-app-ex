import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../models/home.dart';
import '../../../theme/cinema_theme.dart';
import '../../../widgets/glass_card.dart';
import '../../movies/movie_detail_screen.dart';

class CinemaHomeUpcoming extends StatelessWidget {
  const CinemaHomeUpcoming({super.key, required this.upcoming});

  final List<UpcomingMovieModel> upcoming;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GlassCard(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        borderRadius: 20,
        blur: 20,
        child: upcoming.isEmpty
            ? Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Text(
                  '상영 예정 영화가 없습니다.',
                  style: GoogleFonts.roboto(fontSize: 14, color: CinemaColors.textMuted),
                ),
              )
            : SizedBox(
                height: 220,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: upcoming.length,
                  itemBuilder: (context, index) {
                    final m = upcoming[index];
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
                  ? CachedNetworkImage(
                      imageUrl: movie.posterUrl!,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => _posterPlaceholder(),
                      errorWidget: (context, url, error) => _posterPlaceholder(),
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
