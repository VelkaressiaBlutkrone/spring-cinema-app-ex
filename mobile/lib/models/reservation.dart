import 'package:json_annotation/json_annotation.dart';

part 'reservation.g.dart';

/// 예매 상태 표시용 라벨 (일반 사용자용)
const reservationStatusLabel = <String, String>{
  'PENDING': '예매 대기',
  'PAYMENT_PENDING': '결제 대기',
  'CONFIRMED': '예매 완료',
  'CANCELLED': '예매 취소',
  'REFUNDED': '환불 완료',
};

/// 결제 요약 (마이페이지 표시용)
@JsonSerializable()
class PaymentSummaryModel {
  PaymentSummaryModel({
    required this.paymentId,
    required this.paymentNo,
    required this.payStatus,
    required this.payMethod,
    required this.payAmount,
    this.paidAt,
  });

  @JsonKey(defaultValue: 0)
  final int paymentId;
  @JsonKey(defaultValue: '')
  final String paymentNo;
  @JsonKey(defaultValue: '')
  final String payStatus;
  @JsonKey(defaultValue: '')
  final String payMethod;
  @JsonKey(defaultValue: 0)
  final int payAmount;
  final String? paidAt;

  factory PaymentSummaryModel.fromJson(Map<String, dynamic> json) => _$PaymentSummaryModelFromJson(json);
  Map<String, dynamic> toJson() => _$PaymentSummaryModelToJson(this);
}

/// 예매 상세 응답 (ReservationDetailResponse)
@JsonSerializable()
class ReservationDetailModel {
  ReservationDetailModel({
    required this.reservationId,
    required this.reservationNo,
    required this.status,
    required this.memberId,
    required this.screeningId,
    required this.movieTitle,
    required this.screenName,
    required this.startTime,
    required this.totalSeats,
    required this.totalAmount,
    required this.seats,
    this.createdAt,
    this.payment,
  });

  final int reservationId;
  @JsonKey(defaultValue: '')
  final String reservationNo;
  @JsonKey(defaultValue: '')
  final String status;
  final int memberId;
  final int screeningId;
  @JsonKey(defaultValue: '')
  final String movieTitle;
  @JsonKey(defaultValue: '')
  final String screenName;
  @JsonKey(defaultValue: '')
  final String startTime;
  @JsonKey(defaultValue: 0)
  final int totalSeats;
  @JsonKey(defaultValue: 0)
  final int totalAmount;
  final List<ReservationSeatItemModel> seats;
  final String? createdAt;
  final PaymentSummaryModel? payment;

  factory ReservationDetailModel.fromJson(Map<String, dynamic> json) => _$ReservationDetailModelFromJson(json);
  Map<String, dynamic> toJson() => _$ReservationDetailModelToJson(this);
}

@JsonSerializable()
class ReservationSeatItemModel {
  ReservationSeatItemModel({
    required this.seatId,
    required this.rowLabel,
    required this.seatNo,
    required this.displayName,
    required this.price,
  });

  final int seatId;
  @JsonKey(defaultValue: '')
  final String rowLabel;
  @JsonKey(defaultValue: 0)
  final int seatNo;
  @JsonKey(defaultValue: '')
  final String displayName;
  @JsonKey(defaultValue: 0)
  final int price;

  factory ReservationSeatItemModel.fromJson(Map<String, dynamic> json) => _$ReservationSeatItemModelFromJson(json);
  Map<String, dynamic> toJson() => _$ReservationSeatItemModelToJson(this);
}
