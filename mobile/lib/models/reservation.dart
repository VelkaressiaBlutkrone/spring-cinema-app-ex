/// 예매 상태 표시용 라벨 (일반 사용자용)
const reservationStatusLabel = <String, String>{
  'PENDING': '예매 대기',
  'PAYMENT_PENDING': '결제 대기',
  'CONFIRMED': '예매 완료',
  'CANCELLED': '예매 취소',
  'REFUNDED': '환불 완료',
};

/// 예매 상세 응답 (ReservationDetailResponse)
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
  });

  final int reservationId;
  final String reservationNo;
  final String status;
  final int memberId;
  final int screeningId;
  final String movieTitle;
  final String screenName;
  final String startTime;
  final int totalSeats;
  final int totalAmount;
  final List<ReservationSeatItemModel> seats;
  final String? createdAt;

  factory ReservationDetailModel.fromJson(Map<String, dynamic> json) {
    final list = json['seats'] as List<dynamic>? ?? [];
    return ReservationDetailModel(
      reservationId: (json['reservationId'] as num).toInt(),
      reservationNo: json['reservationNo'] as String? ?? '',
      status: json['status'] as String? ?? '',
      memberId: (json['memberId'] as num).toInt(),
      screeningId: (json['screeningId'] as num).toInt(),
      movieTitle: json['movieTitle'] as String? ?? '',
      screenName: json['screenName'] as String? ?? '',
      startTime: json['startTime'] as String? ?? '',
      totalSeats: (json['totalSeats'] as num?)?.toInt() ?? 0,
      totalAmount: (json['totalAmount'] as num?)?.toInt() ?? 0,
      seats: list.map((e) => ReservationSeatItemModel.fromJson(e as Map<String, dynamic>)).toList(),
      createdAt: json['createdAt']?.toString(),
    );
  }
}

class ReservationSeatItemModel {
  ReservationSeatItemModel({
    required this.seatId,
    required this.rowLabel,
    required this.seatNo,
    required this.displayName,
    required this.price,
  });

  final int seatId;
  final String rowLabel;
  final int seatNo;
  final String displayName;
  final int price;

  factory ReservationSeatItemModel.fromJson(Map<String, dynamic> json) {
    return ReservationSeatItemModel(
      seatId: (json['seatId'] as num).toInt(),
      rowLabel: json['rowLabel'] as String? ?? '',
      seatNo: (json['seatNo'] as num?)?.toInt() ?? 0,
      displayName: json['displayName'] as String? ?? '',
      price: (json['price'] as num?)?.toInt() ?? 0,
    );
  }
}
