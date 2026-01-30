// 공통 API 클라이언트: baseUrl + Bearer 토큰(선택)
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../exception/api_error_response.dart';
import '../exception/api_exception.dart';
import '../exception/app_exception.dart';
import '../utils/app_logger.dart';

/// API 호출 시 사용하는 공통 클라이언트
/// - baseUrl 기준으로 요청
/// - getAccessToken이 있으면 Authorization: Bearer 추가
typedef GetAccessTokenFn = Future<String?> Function();

class ApiClient {
  ApiClient({
    required this.baseUrl,
    GetAccessTokenFn? getAccessToken,
  }) : _getAccessToken = getAccessToken;

  final String baseUrl;
  final GetAccessTokenFn? _getAccessToken;

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

  /// 2xx가 아니면 ApiException/AuthException throw + 로그
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
    if (code != null) {
      throw ApiException(message, statusCode: response.statusCode, code: code);
    }
    throw AuthException(message, statusCode: response.statusCode);
  }

  Future<http.Response> get(String path, {bool useAuth = false}) async {
    final uri = Uri.parse(_url(path));
    final headers = await _headers(useAuth: useAuth);
    return http.get(uri, headers: headers);
  }

  Future<http.Response> post(
    String path, {
    Object? body,
    bool useAuth = true,
  }) async {
    final uri = Uri.parse(_url(path));
    final headers = await _headers(useAuth: useAuth);
    return http.post(
      uri,
      headers: headers,
      body: body != null ? (body is String ? body : jsonEncode(body)) : null,
    );
  }
}
