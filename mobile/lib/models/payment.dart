/// 결제(예매) 요청 (PaymentRequest) - seatHoldItems, payMethod
class PaymentRequestModel {
  PaymentRequestModel({
    required this.screeningId,
    required this.seatHoldItems,
    required this.payMethod,
  });

  final int screeningId;
  final List<SeatHoldItemModel> seatHoldItems;
  final String payMethod; // CARD, CASH, etc.

  Map<String, dynamic> toJson() => {
        'screeningId': screeningId,
        'seatHoldItems': seatHoldItems.map((e) => e.toJson()).toList(),
        'payMethod': payMethod,
      };
}

class SeatHoldItemModel {
  SeatHoldItemModel({required this.seatId, required this.holdToken});

  final int seatId;
  final String holdToken;

  Map<String, dynamic> toJson() => {'seatId': seatId, 'holdToken': holdToken};
}

/// 결제 완료 응답 (PaymentResponse)
class PaymentResponseModel {
  PaymentResponseModel({
    required this.reservationId,
    required this.reservationNo,
    required this.screeningId,
    required this.totalSeats,
    required this.totalAmount,
  });

  final int reservationId;
  final String reservationNo;
  final int screeningId;
  final int totalSeats;
  final int totalAmount;

  factory PaymentResponseModel.fromJson(Map<String, dynamic> json) {
    return PaymentResponseModel(
      reservationId: (json['reservationId'] as num).toInt(),
      reservationNo: json['reservationNo'] as String? ?? '',
      screeningId: (json['screeningId'] as num).toInt(),
      totalSeats: (json['totalSeats'] as num?)?.toInt() ?? 0,
      totalAmount: (json['totalAmount'] as num?)?.toInt() ?? 0,
    );
  }
}
