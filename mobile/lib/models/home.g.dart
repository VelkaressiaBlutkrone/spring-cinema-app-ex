// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'home.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

HomeStatsModel _$HomeStatsModelFromJson(Map<String, dynamic> json) =>
    HomeStatsModel(
      theaterCount: (json['theaterCount'] as num?)?.toInt() ?? 0,
      screenCount: (json['screenCount'] as num?)?.toInt() ?? 0,
      todayScreeningCount: (json['todayScreeningCount'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$HomeStatsModelToJson(HomeStatsModel instance) =>
    <String, dynamic>{
      'theaterCount': instance.theaterCount,
      'screenCount': instance.screenCount,
      'todayScreeningCount': instance.todayScreeningCount,
    };

UpcomingMovieModel _$UpcomingMovieModelFromJson(Map<String, dynamic> json) =>
    UpcomingMovieModel(
      id: (json['id'] as num).toInt(),
      title: json['title'] as String? ?? '',
      posterUrl: json['posterUrl'] as String?,
    );

Map<String, dynamic> _$UpcomingMovieModelToJson(UpcomingMovieModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'posterUrl': instance.posterUrl,
    };
