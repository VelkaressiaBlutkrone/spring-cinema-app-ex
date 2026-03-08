import 'package:json_annotation/json_annotation.dart';

part 'home.g.dart';

/// 영화관/상영관 현황 요약 (HomeStatsResponse)
@JsonSerializable()
class HomeStatsModel {
  HomeStatsModel({
    required this.theaterCount,
    required this.screenCount,
    required this.todayScreeningCount,
  });

  @JsonKey(defaultValue: 0)
  final int theaterCount;
  @JsonKey(defaultValue: 0)
  final int screenCount;
  @JsonKey(defaultValue: 0)
  final int todayScreeningCount;

  factory HomeStatsModel.fromJson(Map<String, dynamic> json) => _$HomeStatsModelFromJson(json);
  Map<String, dynamic> toJson() => _$HomeStatsModelToJson(this);
}

/// 3일 이내 상영 예정 영화 (UpcomingMovieItem)
@JsonSerializable()
class UpcomingMovieModel {
  UpcomingMovieModel({
    required this.id,
    required this.title,
    this.posterUrl,
  });

  final int id;
  @JsonKey(defaultValue: '')
  final String title;
  final String? posterUrl;

  factory UpcomingMovieModel.fromJson(Map<String, dynamic> json) => _$UpcomingMovieModelFromJson(json);
  Map<String, dynamic> toJson() => _$UpcomingMovieModelToJson(this);
}
