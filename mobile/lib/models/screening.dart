import 'package:json_annotation/json_annotation.dart';

part 'screening.g.dart';

/// 상영 스케줄 응답 DTO (ScreeningResponse)
@JsonSerializable()
class ScreeningModel {
  ScreeningModel({
    required this.id,
    required this.movieId,
    required this.movieTitle,
    required this.screenId,
    required this.screenName,
    required this.theaterName,
    required this.startTime,
    required this.endTime,
    this.status,
    this.createdAt,
    this.updatedAt,
  });

  final int id;
  final int movieId;
  @JsonKey(defaultValue: '')
  final String movieTitle;
  final int screenId;
  @JsonKey(defaultValue: '')
  final String screenName;
  @JsonKey(defaultValue: '')
  final String theaterName;
  @JsonKey(defaultValue: '')
  final String startTime;
  @JsonKey(defaultValue: '')
  final String endTime;
  final String? status;
  final String? createdAt;
  final String? updatedAt;

  factory ScreeningModel.fromJson(Map<String, dynamic> json) => _$ScreeningModelFromJson(json);
  Map<String, dynamic> toJson() => _$ScreeningModelToJson(this);
}
