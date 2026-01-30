// 인증 API (Hybrid Encryption + Secure Storage)
// - 로그인/회원가입: EncryptedPayload (RSA + AES-GCM)
// - Refresh Token: Set-Cookie에서 파싱 후 flutter_secure_storage 저장 (모바일)
// - Access Token: flutter_secure_storage 저장

import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import '../exception/api_error_response.dart';
import '../exception/api_exception.dart';
import '../exception/app_exception.dart';
import '../utils/app_logger.dart';
import '../utils/hybrid_encryption.dart';

const _storageKeyAccessToken = 'cinema_access_token';
const _storageKeyRefreshToken = 'cinema_refresh_token';

/// AccessToken 응답 (Refresh는 Set-Cookie → secure storage)
class AccessTokenResponse {
  AccessTokenResponse({required this.accessToken});
  final String accessToken;
  factory AccessTokenResponse.fromJson(Map<String, dynamic> json) {
    return AccessTokenResponse(accessToken: json['accessToken'] as String);
  }
}

/// PublicKey API 응답 (ApiResponse with PublicKeyResponse)
class PublicKeyApiResponse {
  PublicKeyApiResponse({required this.success, this.data});
  final bool success;
  final PublicKeyData? data;
  factory PublicKeyApiResponse.fromJson(Map<String, dynamic> json) {
    return PublicKeyApiResponse(
      success: json['success'] as bool? ?? false,
      data: json['data'] != null
          ? PublicKeyData.fromJson(json['data'] as Map<String, dynamic>)
          : null,
    );
  }
}

class PublicKeyData {
  PublicKeyData({required this.publicKeyPem});
  final String publicKeyPem;
  factory PublicKeyData.fromJson(Map<String, dynamic> json) {
    return PublicKeyData(publicKeyPem: json['publicKeyPem'] as String);
  }
}

class AuthApiService {
  AuthApiService({
    required String baseUrl,
    FlutterSecureStorage? storage,
  })  : _baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl,
        _storage = storage ?? const FlutterSecureStorage(
          aOptions: AndroidOptions(encryptedSharedPreferences: true),
        );

  final String _baseUrl;
  final FlutterSecureStorage _storage;

  String _url(String path) {
    final base = _baseUrl.endsWith('/') ? _baseUrl.substring(0, _baseUrl.length - 1) : _baseUrl;
    return path.startsWith('/') ? '$base$path' : '$base/$path';
  }

  String get _publicKeyUrl => _url(apiPathPublicKey);
  String get _loginUrl => _url(apiPathLogin);
  String get _signupUrl => _url(apiPathSignup);
  String get _refreshUrl => _url(apiPathRefresh);
  String get _logoutUrl => _url(apiPathLogout);

  /// Set-Cookie 헤더에서 cinema_refresh 값 추출
  String? _extractRefreshTokenFromHeaders(Map<String, String> headers) {
    final setCookie = headers['set-cookie'] ?? headers['Set-Cookie'];
    if (setCookie == null || setCookie.isEmpty) return null;
    final prefix = '$refreshTokenCookieName=';
    final start = setCookie.indexOf(prefix);
    if (start == -1) return null;
    final valueStart = start + prefix.length;
    final end = setCookie.indexOf(';', valueStart);
    return end == -1
        ? setCookie.substring(valueStart).trim()
        : setCookie.substring(valueStart, end).trim();
  }

  /// API 에러 응답 파싱 후 ApiException 또는 AuthException throw + 로깅
  /// [loginId] 로그인 실패 시에만 로그용으로 전달 (민감정보 로그 금지 규칙 준수)
  Never _throwApiError(String context, http.Response response, {String? loginId}) {
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
    // 로그인/인증 실패 원인·결과 로그 (status, code, message만, loginId는 선택)
    final idPart = loginId != null ? ' loginId=$loginId' : '';
    appLogger.w(
      '[Auth] $context failed$idPart → status=${response.statusCode} code=$code result=$message',
    );
    if (code != null) {
      throw ApiException(message, statusCode: response.statusCode, code: code);
    }
    throw AuthException(message, statusCode: response.statusCode);
  }

  /// GET /api/public-key → publicKeyPem
  Future<String> getPublicKey() async {
    final response = await http.get(Uri.parse(_publicKeyUrl));
    if (response.statusCode != 200) {
      _throwApiError('getPublicKey', response);
    }
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final api = PublicKeyApiResponse.fromJson(json);
    if (!api.success || api.data == null) {
      throw AuthException('공개키 응답 형식이 올바르지 않습니다.', statusCode: response.statusCode);
    }
    return api.data!.publicKeyPem;
  }

  /// POST /api/members/login (EncryptedPayload) → accessToken, Set-Cookie → secure storage 저장
  Future<AccessTokenResponse> login(String loginId, String password) async {
    appLogger.i('[Auth] Login attempt loginId=$loginId');
    try {
      final pem = await getPublicKey();
      final payload = await encryptPayload(pem, {'loginId': loginId, 'password': password});
      final body = jsonEncode(payload.toJson());
      final response = await http.post(
        Uri.parse(_loginUrl),
        headers: {'Content-Type': 'application/json'},
        body: body,
      );
      if (response.statusCode != 200) {
        _throwApiError('login', response, loginId: loginId);
      }
      final json = jsonDecode(response.body) as Map<String, dynamic>;
      final accessTokenRes = AccessTokenResponse.fromJson(json);
      final refreshToken = _extractRefreshTokenFromHeaders(response.headers);
      await _storage.write(key: _storageKeyAccessToken, value: accessTokenRes.accessToken);
      if (refreshToken != null && refreshToken.isNotEmpty) {
        await _storage.write(key: _storageKeyRefreshToken, value: refreshToken);
      }
      appLogger.i('[Auth] Login success loginId=$loginId');
      return accessTokenRes;
    } catch (e) {
      if (e is ApiException || e is AuthException) rethrow;
      appLogger.e('[Auth] Login error loginId=$loginId', error: e);
      rethrow;
    }
  }

  /// POST /api/members/signup (EncryptedPayload) → memberId
  Future<int> signup({
    required String loginId,
    required String password,
    required String name,
    required String email,
    String? phone,
  }) async {
    final pem = await getPublicKey();
    final plain = <String, dynamic>{
      'loginId': loginId,
      'password': password,
      'name': name,
      'email': email,
    };
    if (phone != null && phone.isNotEmpty) plain['phone'] = phone;
    final payload = await encryptPayload(pem, plain);
    final body = jsonEncode(payload.toJson());
    final response = await http.post(
      Uri.parse(_signupUrl),
      headers: {'Content-Type': 'application/json'},
      body: body,
    );
    if (response.statusCode != 200) {
      _throwApiError('signup', response);
    }
    final id = jsonDecode(response.body);
    return id is int ? id : int.parse(id.toString());
  }

  /// POST /api/members/refresh (Cookie: cinema_refresh) → accessToken + Set-Cookie
  Future<AccessTokenResponse> refresh() async {
    final refreshToken = await _storage.read(key: _storageKeyRefreshToken);
    if (refreshToken == null || refreshToken.isEmpty) {
      throw AuthException('Refresh token이 없습니다.', statusCode: 401);
    }
    final response = await http.post(
      Uri.parse(_refreshUrl),
      headers: {'Cookie': '$refreshTokenCookieName=$refreshToken'},
    );
    if (response.statusCode != 200) {
      await _storage.delete(key: _storageKeyAccessToken);
      await _storage.delete(key: _storageKeyRefreshToken);
      _throwApiError('refresh', response);
    }
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final accessTokenRes = AccessTokenResponse.fromJson(json);
    final newRefresh = _extractRefreshTokenFromHeaders(response.headers);
    await _storage.write(key: _storageKeyAccessToken, value: accessTokenRes.accessToken);
    if (newRefresh != null && newRefresh.isNotEmpty) {
      await _storage.write(key: _storageKeyRefreshToken, value: newRefresh);
    }
    return accessTokenRes;
  }

  /// POST /api/members/logout (Authorization: Bearer) + 저장소 삭제
  Future<void> logout() async {
    final accessToken = await _storage.read(key: _storageKeyAccessToken);
    try {
      if (accessToken != null && accessToken.isNotEmpty) {
        await http.post(
          Uri.parse(_logoutUrl),
          headers: {'Authorization': 'Bearer $accessToken'},
        );
      }
    } finally {
      await _storage.delete(key: _storageKeyAccessToken);
      await _storage.delete(key: _storageKeyRefreshToken);
    }
  }

  /// 저장된 access token 조회 (401 시 refresh 시도 후 재요청에 사용)
  Future<String?> getAccessToken() => _storage.read(key: _storageKeyAccessToken);

  /// 저장된 refresh token 조회
  Future<String?> getStoredRefreshToken() => _storage.read(key: _storageKeyRefreshToken);
}

