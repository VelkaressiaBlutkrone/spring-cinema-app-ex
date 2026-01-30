import 'package:mobile/exception/app_exception.dart';
import 'package:mobile/exception/error_code.dart';

/// API 에러 응답 기반 예외 (서버 ErrorResponse 파싱 후 사용)
///
/// Spring GlobalExceptionHandler 응답과 동기화합니다.
/// [statusCode], [code]로 로깅/분기 처리 가능합니다.
class ApiException extends AppException {
  ApiException(
    super.message, {
    this.statusCode,
    this.code,
    super.originalException,
    super.stackTrace,
  }) : _appErrorCode = code != null ? AppErrorCode.fromCode(code) : null;

  /// HTTP 상태 코드 (401, 404 등)
  final int? statusCode;

  /// 서버 에러 코드 (AUTH_001, MEMBER_002 등)
  final String? code;

  final AppErrorCode? _appErrorCode;

  /// 클라이언트 매핑된 에러 코드
  AppErrorCode get errorCode => _appErrorCode ?? AppErrorCode.unknown;

  /// 사용자에게 보여줄 메시지 (서버 message 우선, 없으면 errorCode.message)
  @override
  String get message => super.message.isNotEmpty ? super.message : errorCode.message;
}
