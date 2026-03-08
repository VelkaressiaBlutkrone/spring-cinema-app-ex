// 공통 API 클라이언트: baseUrl + Bearer 토큰(선택)
import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../exception/api_error_response.dart';
import '../exception/api_exception.dart';
import '../exception/app_exception.dart';
import '../utils/app_logger.dart';

/// API 호출 시 사용하는 공통 클라이언트
/// - baseUrl 기준으로 요청
/// - getAccessToken이 있으면 Authorization: Bearer 추가
/// - 타임아웃 30초, 네트워크 에러 시 재시도 (지수 백오프, 최대 2회)
typedef GetAccessTokenFn = Future<String?> Function();

class ApiClient {
  ApiClient({
    required this.baseUrl,
    GetAccessTokenFn? getAccessToken,
    this.timeout = const Duration(seconds: 30),
    this.maxRetries = 2,
  }) : _getAccessToken = getAccessToken;

  final String baseUrl;
  final GetAccessTokenFn? _getAccessToken;
  final Duration timeout;
  final int maxRetries;

  String _url(String path) {
    final base = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    return path.startsWith('/') ? '$base$path' : '$base/$path';
  }

  Future<Map<String, String>> _headers({bool useAuth = true}) async {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (useAuth && _getAccessToken != null) {
      final token = await _getAccessToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    return headers;
  }

  /// 2xx가 아니면 상태 코드에 따라 적절한 예외 throw + 로그
  void throwIfNotOk(String context, http.Response response, {String? loginId}) {
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    String message = '오류가 발생했습니다.';
    String? code;
    if (response.body.isNotEmpty) {
      try {
        final json = jsonDecode(response.body);
        if (json is Map<String, dynamic>) {
          final err = ApiErrorResponse.fromJson(json);
          message = err.displayMessage;
          code = err.code;
        }
      } catch (_) {}
    }
    final idPart = loginId != null ? ' loginId=$loginId' : '';
    appLogger.w('[Auth] $context failed$idPart → status=${response.statusCode} code=$code result=$message');

    final statusCode = response.statusCode;
    if (statusCode == 401 || statusCode == 403) {
      throw AuthException(message, statusCode: statusCode);
    }
    if (code != null) {
      throw ApiException(message, statusCode: statusCode, code: code);
    }
    if (statusCode >= 400 && statusCode < 500) {
      throw ValidationException(message, statusCode: statusCode);
    }
    if (statusCode >= 500) {
      throw ServerException(message, statusCode: statusCode);
    }
    throw AuthException(message, statusCode: statusCode);
  }

  /// 네트워크 요청 실행 + 타임아웃 + 자동 재시도 (GET만 재시도)
  Future<http.Response> _executeWithRetry(
    Future<http.Response> Function() request, {
    bool retryable = false,
  }) async {
    int attempt = 0;
    while (true) {
      try {
        return await request().timeout(timeout);
      } on TimeoutException {
        throw const NetworkException('서버 응답 시간이 초과되었습니다.');
      } on SocketException catch (e) {
        if (!retryable || attempt >= maxRetries) {
          throw NetworkException('네트워크 연결에 실패했습니다.', originalException: e);
        }
        attempt++;
        final delay = Duration(milliseconds: 500 * (1 << attempt));
        await Future.delayed(delay);
      }
    }
  }

  Future<http.Response> get(String path, {bool useAuth = false}) async {
    final uri = Uri.parse(_url(path));
    final headers = await _headers(useAuth: useAuth);
    return _executeWithRetry(
      () => http.get(uri, headers: headers),
      retryable: true,
    );
  }

  Future<http.Response> post(
    String path, {
    Object? body,
    bool useAuth = true,
  }) async {
    final uri = Uri.parse(_url(path));
    final headers = await _headers(useAuth: useAuth);
    return _executeWithRetry(
      () => http.post(
        uri,
        headers: headers,
        body: body != null ? (body is String ? body : jsonEncode(body)) : null,
      ),
    );
  }

  Future<http.Response> patch(
    String path, {
    Object? body,
    bool useAuth = true,
  }) async {
    final uri = Uri.parse(_url(path));
    final headers = await _headers(useAuth: useAuth);
    return _executeWithRetry(
      () => http.patch(
        uri,
        headers: headers,
        body: body != null ? (body is String ? body : jsonEncode(body)) : null,
      ),
    );
  }
}
