/// 상영 스케줄 응답 DTO (ScreeningResponse)
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
  final String movieTitle;
  final int screenId;
  final String screenName;
  final String theaterName;
  final String startTime;
  final String endTime;
  final String? status;
  final String? createdAt;
  final String? updatedAt;

  factory ScreeningModel.fromJson(Map<String, dynamic> json) {
    return ScreeningModel(
      id: (json['id'] as num).toInt(),
      movieId: (json['movieId'] as num).toInt(),
      movieTitle: json['movieTitle'] as String? ?? '',
      screenId: (json['screenId'] as num).toInt(),
      screenName: json['screenName'] as String? ?? '',
      theaterName: json['theaterName'] as String? ?? '',
      startTime: json['startTime'] as String? ?? '',
      endTime: json['endTime'] as String? ?? '',
      status: json['status']?.toString(),
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString(),
    );
  }
}
