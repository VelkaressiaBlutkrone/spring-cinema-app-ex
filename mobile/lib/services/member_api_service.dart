import 'dart:convert';

import '../config/api_config.dart';
import '../models/member.dart';
import 'api_client.dart';

/// 회원 프로필/마이페이지 API (인증 필요)
class MemberApiService {
  MemberApiService(this._client);

  final ApiClient _client;

  /// GET /api/members/me - 본인 프로필 조회
  Future<MemberProfileModel> getProfile() async {
    final response = await _client.get(apiPathMembersMe, useAuth: true);
    _client.throwIfNotOk('getProfile', response);
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    if (json['data'] != null) {
      return MemberProfileModel.fromJson(json['data'] as Map<String, dynamic>);
    }
    return MemberProfileModel.fromJson(json);
  }

  /// PATCH /api/members/me - 본인 정보 수정
  Future<void> updateProfile({
    String? password,
    String? name,
    String? email,
    String? phone,
  }) async {
    final body = <String, dynamic>{};
    if (password != null && password.isNotEmpty) body['password'] = password;
    if (name != null) body['name'] = name;
    if (email != null) body['email'] = email;
    if (phone != null) body['phone'] = phone;
    final response = await _client.patch(apiPathMembersMe, body: body, useAuth: true);
    _client.throwIfNotOk('updateProfile', response);
  }

  /// GET /api/members/me/holds - 본인 HOLD(장바구니) 목록
  Future<List<MemberHoldSummaryModel>> getMyHolds() async {
    final response = await _client.get(apiPathMembersMeHolds, useAuth: true);
    _client.throwIfNotOk('getMyHolds', response);
    final decoded = jsonDecode(response.body);
    List<dynamic> list;
    if (decoded is Map<String, dynamic> && decoded['data'] != null) {
      list = decoded['data'] as List<dynamic>;
    } else if (decoded is List<dynamic>) {
      list = decoded;
    } else {
      return [];
    }
    return list.map((e) => MemberHoldSummaryModel.fromJson(e as Map<String, dynamic>)).toList();
  }
}
