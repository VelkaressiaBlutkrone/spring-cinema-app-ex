import 'package:json_annotation/json_annotation.dart';

part 'movie.g.dart';

/// 영화 응답 DTO (MovieResponse)
@JsonSerializable()
class MovieModel {
  MovieModel({
    required this.id,
    required this.title,
    this.description,
    this.runningTime,
    this.rating,
    this.genre,
    this.director,
    this.actors,
    this.posterUrl,
    this.releaseDate,
    this.status,
    this.createdAt,
    this.updatedAt,
  });

  final int id;
  @JsonKey(defaultValue: '')
  final String title;
  final String? description;
  final int? runningTime;
  final String? rating;
  final String? genre;
  final String? director;
  final String? actors;
  final String? posterUrl;
  final String? releaseDate;
  final String? status;
  final String? createdAt;
  final String? updatedAt;

  factory MovieModel.fromJson(Map<String, dynamic> json) => _$MovieModelFromJson(json);
  Map<String, dynamic> toJson() => _$MovieModelToJson(this);
}
