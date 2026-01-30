/// 서버 ErrorResponse DTO (Spring ErrorResponse.java와 동기화)
///
/// API 4xx/5xx 응답 body 파싱 시 사용합니다.
class ApiErrorResponse {
  ApiErrorResponse({
    this.timestamp,
    this.status,
    this.code,
    this.error,
    this.message,
    this.path,
  });

  final String? timestamp;
  final int? status;
  final String? code;
  final String? error;
  final String? message;
  final String? path;

  factory ApiErrorResponse.fromJson(Map<String, dynamic> json) {
    return ApiErrorResponse(
      timestamp: json['timestamp']?.toString(),
      status: json['status'] is int ? json['status'] as int : null,
      code: json['code']?.toString(),
      error: json['error']?.toString(),
      message: json['message']?.toString(),
      path: json['path']?.toString(),
    );
  }

  String get displayMessage => message ?? '오류가 발생했습니다.';
}
