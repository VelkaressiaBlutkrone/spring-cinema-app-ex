import '../config/api_config.dart';
import '../models/payment.dart';
import '../models/reservation.dart';
import 'api_service_base.dart';

/// 예매·결제 API (인증 필요)
class ReservationApiService extends ApiServiceBase {
  ReservationApiService(super.client);

  /// GET /api/reservations - 내 예매 목록
  Future<List<ReservationDetailModel>> getMyReservations() async {
    final path = apiPathReservations;
    final response = await client.get(path, useAuth: true);
    return parseListResponse(
      response,
      'getMyReservations',
      ReservationDetailModel.fromJson,
      '예매 목록 조회 실패',
    );
  }

  /// GET /api/reservations/{reservationId}
  Future<ReservationDetailModel> getReservationDetail(int reservationId) async {
    final path = '$apiPathReservationDetail/$reservationId';
    final response = await client.get(path, useAuth: true);
    return parseResponse(
      response,
      'getReservationDetail',
      (d) => ReservationDetailModel.fromJson(d as Map<String, dynamic>),
      '예매 상세 조회 실패',
    );
  }

  /// POST /api/reservations/pay
  Future<PaymentResponseModel> pay(PaymentRequestModel request) async {
    final path = apiPathReservationPay;
    final response = await client.post(path, body: request.toJson(), useAuth: true);
    return parseResponse(
      response,
      'pay',
      (d) => PaymentResponseModel.fromJson(d as Map<String, dynamic>),
      '결제 실패',
    );
  }

  /// POST /api/reservations/{reservationId}/cancel
  Future<void> cancelReservation(int reservationId) async {
    final path = '$apiPathReservationCancel/$reservationId/cancel';
    final response = await client.post(path, body: null, useAuth: true);
    parseVoidResponse(response, 'cancelReservation');
  }
}
