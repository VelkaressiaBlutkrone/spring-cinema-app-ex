import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../models/movie.dart';
import '../../models/screening.dart';
import '../../provider/api_providers.dart';
import '../../theme/cinema_theme.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/glass_card.dart';
import '../seat/seat_select_screen.dart';

/// 영화 상세 + 상영 시간표 화면
class MovieDetailScreen extends ConsumerStatefulWidget {
  const MovieDetailScreen({super.key, required this.movieId});

  final int movieId;

  @override
  ConsumerState<MovieDetailScreen> createState() => _MovieDetailScreenState();
}

class _MovieDetailScreenState extends ConsumerState<MovieDetailScreen> {
  AsyncValue<MovieModel> _movie = const AsyncValue.loading();
  AsyncValue<List<ScreeningModel>> _screenings = const AsyncValue.loading();

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final movieService = ref.read(movieApiServiceProvider);
    final screeningService = ref.read(screeningApiServiceProvider);
    setState(() {
      _movie = const AsyncValue.loading();
      _screenings = const AsyncValue.loading();
    });
    try {
      final movie = await movieService.getMovie(widget.movieId);
      if (!mounted) return;
      setState(() => _movie = AsyncValue.data(movie));
      final list = await screeningService.getScreeningsByMovie(widget.movieId);
      if (mounted) setState(() => _screenings = AsyncValue.data(list));
    } catch (e, st) {
      if (mounted) {
        setState(() {
          _movie = AsyncValue.error(e, st);
          _screenings = AsyncValue.error(e, st);
        });
      }
    }
  }

  static String _formatDateTime(String? iso) {
    if (iso == null || iso.isEmpty) return '-';
    try {
      final dt = DateTime.parse(iso);
      return DateFormat('MM/dd HH:mm').format(dt);
    } catch (_) {
      return iso;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CinemaColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          '상영 시간표',
          style: GoogleFonts.bebasNeue(
            fontSize: 20,
            color: CinemaColors.textPrimary,
            letterSpacing: 1,
          ),
        ),
      ),
      body: _movie.when(
        data: (movie) {
          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 8),
                Text(
                  movie.title,
                  style: GoogleFonts.bebasNeue(
                    fontSize: 24,
                    color: CinemaColors.textPrimary,
                    letterSpacing: 1,
                  ),
                ),
                if (movie.genre != null || movie.runningTime != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    [
                      if (movie.genre != null) movie.genre,
                      if (movie.runningTime != null) '${movie.runningTime}분',
                    ].join(' · '),
                    style: GoogleFonts.roboto(
                      fontSize: 14,
                      color: CinemaColors.textMuted,
                    ),
                  ),
                ],
                const SizedBox(height: 24),
                Text(
                  '상영 시간',
                  style: GoogleFonts.bebasNeue(
                    fontSize: 18,
                    color: CinemaColors.textPrimary,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 12),
                _screenings.when(
                  data: (list) {
                    if (list.isEmpty) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 24),
                        child: Text(
                          '예매 가능한 상영이 없습니다.',
                          style: GoogleFonts.roboto(color: CinemaColors.textMuted),
                        ),
                      );
                    }
                    return Column(
                      children: list.map((s) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: GlassCard(
                            padding: const EdgeInsets.all(16),
                            borderRadius: 12,
                            blur: 16,
                            child: InkWell(
                              onTap: () => Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => SeatSelectScreen(
                                    screeningId: s.id,
                                    movieTitle: s.movieTitle,
                                    screenName: s.screenName,
                                    theaterName: s.theaterName,
                                    startTime: s.startTime,
                                  ),
                                ),
                              ),
                              borderRadius: BorderRadius.circular(12),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          s.theaterName,
                                          style: GoogleFonts.roboto(
                                            fontWeight: FontWeight.w600,
                                            color: CinemaColors.textPrimary,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          '${s.screenName} · ${_formatDateTime(s.startTime)}',
                                          style: GoogleFonts.roboto(
                                            fontSize: 13,
                                            color: CinemaColors.textMuted,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Icon(Icons.chevron_right, color: CinemaColors.textMuted),
                                ],
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    );
                  },
                  loading: () => const Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: Center(child: CircularProgressIndicator()),
                  ),
                  error: (e, _) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 24),
                    child: Text(
                      e.toString(),
                      style: GoogleFonts.roboto(color: CinemaColors.neonRed, fontSize: 12),
                    ),
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(e.toString(), style: GoogleFonts.roboto(color: CinemaColors.neonRed), textAlign: TextAlign.center),
              const SizedBox(height: 16),
              CustomButton(text: '다시 시도', onPressed: _load, size: ButtonSize.small),
            ],
          ),
        ),
      ),
    );
  }
}
