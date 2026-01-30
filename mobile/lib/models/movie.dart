/// 영화 응답 DTO (MovieResponse)
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

  factory MovieModel.fromJson(Map<String, dynamic> json) {
    return MovieModel(
      id: (json['id'] as num).toInt(),
      title: json['title'] as String? ?? '',
      description: json['description']?.toString(),
      runningTime: (json['runningTime'] as num?)?.toInt(),
      rating: json['rating']?.toString(),
      genre: json['genre']?.toString(),
      director: json['director']?.toString(),
      actors: json['actors']?.toString(),
      posterUrl: json['posterUrl']?.toString(),
      releaseDate: json['releaseDate']?.toString(),
      status: json['status']?.toString(),
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString(),
    );
  }
}
