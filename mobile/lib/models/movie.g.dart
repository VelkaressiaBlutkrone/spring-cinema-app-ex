// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'movie.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

MovieModel _$MovieModelFromJson(Map<String, dynamic> json) => MovieModel(
  id: (json['id'] as num).toInt(),
  title: json['title'] as String? ?? '',
  description: json['description'] as String?,
  runningTime: (json['runningTime'] as num?)?.toInt(),
  rating: json['rating'] as String?,
  genre: json['genre'] as String?,
  director: json['director'] as String?,
  actors: json['actors'] as String?,
  posterUrl: json['posterUrl'] as String?,
  releaseDate: json['releaseDate'] as String?,
  status: json['status'] as String?,
  createdAt: json['createdAt'] as String?,
  updatedAt: json['updatedAt'] as String?,
);

Map<String, dynamic> _$MovieModelToJson(MovieModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'description': instance.description,
      'runningTime': instance.runningTime,
      'rating': instance.rating,
      'genre': instance.genre,
      'director': instance.director,
      'actors': instance.actors,
      'posterUrl': instance.posterUrl,
      'releaseDate': instance.releaseDate,
      'status': instance.status,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
    };
