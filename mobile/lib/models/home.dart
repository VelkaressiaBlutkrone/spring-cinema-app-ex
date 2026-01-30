/// 영화관/상영관 현황 요약 (HomeStatsResponse)
class HomeStatsModel {
  HomeStatsModel({
    required this.theaterCount,
    required this.screenCount,
    required this.todayScreeningCount,
  });

  final int theaterCount;
  final int screenCount;
  final int todayScreeningCount;

  factory HomeStatsModel.fromJson(Map<String, dynamic> json) {
    return HomeStatsModel(
      theaterCount: (json['theaterCount'] as num?)?.toInt() ?? 0,
      screenCount: (json['screenCount'] as num?)?.toInt() ?? 0,
      todayScreeningCount: (json['todayScreeningCount'] as num?)?.toInt() ?? 0,
    );
  }
}

/// 3일 이내 상영 예정 영화 (UpcomingMovieItem)
class UpcomingMovieModel {
  UpcomingMovieModel({
    required this.id,
    required this.title,
    this.posterUrl,
  });

  final int id;
  final String title;
  final String? posterUrl;

  factory UpcomingMovieModel.fromJson(Map<String, dynamic> json) {
    return UpcomingMovieModel(
      id: (json['id'] as num).toInt(),
      title: json['title'] as String? ?? '',
      posterUrl: json['posterUrl']?.toString(),
    );
  }
}
