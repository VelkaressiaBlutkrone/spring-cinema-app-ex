import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/api_response.dart';
import 'api_client.dart';

/// API 서비스 공통 베이스 클래스
/// 반복되는 응답 파싱/에러 처리 로직을 통합합니다.
abstract class ApiServiceBase {
  ApiServiceBase(this.client);

  final ApiClient client;

  /// 단일 객체 응답 파싱
  T parseResponse<T>(
    http.Response response,
    String context,
    T Function(dynamic) converter,
    String errorMsg,
  ) {
    client.throwIfNotOk(context, response);
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final api = ApiResponse.fromJson(json, converter);
    if (!api.success || api.data == null) {
      throw Exception(api.message ?? errorMsg);
    }
    return api.data!;
  }

  /// 리스트 응답 파싱
  List<T> parseListResponse<T>(
    http.Response response,
    String context,
    T Function(Map<String, dynamic>) converter,
    String errorMsg,
  ) {
    client.throwIfNotOk(context, response);
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final api = ApiResponse.fromJson(json, (d) {
      final list = d as List<dynamic>;
      return list.map((e) => converter(e as Map<String, dynamic>)).toList();
    });
    if (!api.success || api.data == null) {
      throw Exception(api.message ?? errorMsg);
    }
    return api.data!;
  }

  /// void 응답 (성공 여부만 확인)
  void parseVoidResponse(http.Response response, String context) {
    client.throwIfNotOk(context, response);
  }
}
