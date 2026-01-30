import 'dart:convert';

import '../config/api_config.dart';
import '../models/api_response.dart';
import '../models/payment.dart';
import '../models/reservation.dart';
import 'api_client.dart';

/// 예매·결제 API (인증 필요)
class ReservationApiService {
  ReservationApiService(this._client);

  final ApiClient _client;

  /// GET /api/reservations - 내 예매 목록
  Future<List<ReservationDetailModel>> getMyReservations() async {
    final path = apiPathReservations;
    final response = await _client.get(path, useAuth: true);
    _client.throwIfNotOk('getMyReservations', response);
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final api = ApiResponse.fromJson(json, (d) {
      final list = d as List<dynamic>;
      return list.map((e) => ReservationDetailModel.fromJson(e as Map<String, dynamic>)).toList();
    });
    if (!api.success || api.data == null) throw Exception(api.message ?? '예매 목록 조회 실패');
    return api.data!;
  }

  /// GET /api/reservations/{reservationId}
  Future<ReservationDetailModel> getReservationDetail(int reservationId) async {
    final path = '$apiPathReservationDetail/$reservationId';
    final response = await _client.get(path, useAuth: true);
    _client.throwIfNotOk('getReservationDetail', response);
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final api = ApiResponse.fromJson(json, (d) => ReservationDetailModel.fromJson(d as Map<String, dynamic>));
    if (!api.success || api.data == null) throw Exception(api.message ?? '예매 상세 조회 실패');
    return api.data!;
  }

  /// POST /api/reservations/pay - 결제(예매 확정)
  Future<PaymentResponseModel> pay(PaymentRequestModel request) async {
    final path = apiPathReservationPay;
    final response = await _client.post(path, body: request.toJson(), useAuth: true);
    _client.throwIfNotOk('pay', response);
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final api = ApiResponse.fromJson(json, (d) => PaymentResponseModel.fromJson(d as Map<String, dynamic>));
    if (!api.success || api.data == null) throw Exception(api.message ?? '결제 실패');
    return api.data!;
  }

  /// POST /api/reservations/{reservationId}/cancel
  Future<void> cancelReservation(int reservationId) async {
    final path = '$apiPathReservationCancel/$reservationId/cancel';
    final response = await _client.post(path, body: null, useAuth: true);
    _client.throwIfNotOk('cancelReservation', response);
  }
}
