// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'screening.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ScreeningModel _$ScreeningModelFromJson(Map<String, dynamic> json) =>
    ScreeningModel(
      id: (json['id'] as num).toInt(),
      movieId: (json['movieId'] as num).toInt(),
      movieTitle: json['movieTitle'] as String? ?? '',
      screenId: (json['screenId'] as num).toInt(),
      screenName: json['screenName'] as String? ?? '',
      theaterName: json['theaterName'] as String? ?? '',
      startTime: json['startTime'] as String? ?? '',
      endTime: json['endTime'] as String? ?? '',
      status: json['status'] as String?,
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );

Map<String, dynamic> _$ScreeningModelToJson(ScreeningModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'movieId': instance.movieId,
      'movieTitle': instance.movieTitle,
      'screenId': instance.screenId,
      'screenName': instance.screenName,
      'theaterName': instance.theaterName,
      'startTime': instance.startTime,
      'endTime': instance.endTime,
      'status': instance.status,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
    };
