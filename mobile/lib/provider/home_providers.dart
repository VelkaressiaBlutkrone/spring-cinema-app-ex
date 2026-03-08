import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/home.dart';
import '../models/reservation.dart';
import 'api_providers.dart';
import 'auth_provider.dart';

const int _recentReservationsLimit = 5;

/// 홈 화면 통합 데이터
class HomeData {
  const HomeData({
    required this.stats,
    required this.upcoming,
    required this.reservations,
  });

  final HomeStatsModel stats;
  final List<UpcomingMovieModel> upcoming;
  final List<ReservationDetailModel> reservations;
}

/// 홈 화면 데이터 Provider (stats + upcoming + reservations)
final homeDataProvider = FutureProvider.autoDispose<HomeData>((ref) async {
  final homeService = ref.watch(homeApiServiceProvider);
  final isLoggedIn = ref.watch(authStateProvider).value == true;

  final stats = await homeService.getStats();
  final upcoming = await homeService.getUpcomingMovies(days: 3);

  List<ReservationDetailModel> reservations = [];
  if (isLoggedIn) {
    final resService = ref.watch(reservationApiServiceProvider);
    final list = await resService.getMyReservations();
    reservations = list.take(_recentReservationsLimit).toList();
  }

  return HomeData(
    stats: stats,
    upcoming: upcoming,
    reservations: reservations,
  );
});
