import 'package:json_annotation/json_annotation.dart';

part 'payment.g.dart';

/// 결제(예매) 요청 (PaymentRequest) - seatHoldItems, payMethod
@JsonSerializable()
class PaymentRequestModel {
  PaymentRequestModel({
    required this.screeningId,
    required this.seatHoldItems,
    required this.payMethod,
  });

  final int screeningId;
  final List<SeatHoldItemModel> seatHoldItems;
  final String payMethod; // CARD, CASH, etc.

  factory PaymentRequestModel.fromJson(Map<String, dynamic> json) => _$PaymentRequestModelFromJson(json);
  Map<String, dynamic> toJson() => _$PaymentRequestModelToJson(this);
}

@JsonSerializable()
class SeatHoldItemModel {
  SeatHoldItemModel({required this.seatId, required this.holdToken});

  final int seatId;
  final String holdToken;

  factory SeatHoldItemModel.fromJson(Map<String, dynamic> json) => _$SeatHoldItemModelFromJson(json);
  Map<String, dynamic> toJson() => _$SeatHoldItemModelToJson(this);
}

/// 결제 완료 응답 (PaymentResponse)
@JsonSerializable()
class PaymentResponseModel {
  PaymentResponseModel({
    required this.reservationId,
    required this.reservationNo,
    required this.screeningId,
    required this.totalSeats,
    required this.totalAmount,
  });

  final int reservationId;
  @JsonKey(defaultValue: '')
  final String reservationNo;
  final int screeningId;
  @JsonKey(defaultValue: 0)
  final int totalSeats;
  @JsonKey(defaultValue: 0)
  final int totalAmount;

  factory PaymentResponseModel.fromJson(Map<String, dynamic> json) => _$PaymentResponseModelFromJson(json);
  Map<String, dynamic> toJson() => _$PaymentResponseModelToJson(this);
}
