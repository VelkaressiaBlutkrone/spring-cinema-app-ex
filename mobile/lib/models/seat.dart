/// 좌석 배치 조회 응답 (SeatLayoutResponse)
class SeatLayoutModel {
  SeatLayoutModel({
    required this.screeningId,
    required this.seats,
  });

  final int screeningId;
  final List<SeatStatusItemModel> seats;

  factory SeatLayoutModel.fromJson(Map<String, dynamic> json) {
    final list = json['seats'] as List<dynamic>? ?? [];
    return SeatLayoutModel(
      screeningId: (json['screeningId'] as num).toInt(),
      seats: list.map((e) => SeatStatusItemModel.fromJson(e as Map<String, dynamic>)).toList(),
    );
  }
}

/// 좌석 상태 항목 (SeatStatusItem)
class SeatStatusItemModel {
  SeatStatusItemModel({
    required this.seatId,
    required this.status,
    required this.rowLabel,
    required this.seatNo,
    this.holdExpireAt,
  });

  final int seatId;
  final String status; // AVAILABLE, HOLD, RESERVED, PAYMENT_PENDING, BLOCKED, DISABLED
  final String rowLabel;
  final int seatNo;
  final String? holdExpireAt;

  factory SeatStatusItemModel.fromJson(Map<String, dynamic> json) {
    return SeatStatusItemModel(
      seatId: (json['seatId'] as num).toInt(),
      status: json['status'] as String? ?? 'AVAILABLE',
      rowLabel: json['rowLabel'] as String? ?? '',
      seatNo: (json['seatNo'] as num?)?.toInt() ?? 0,
      holdExpireAt: json['holdExpireAt']?.toString(),
    );
  }

  bool get isAvailable => status == 'AVAILABLE';
  bool get isHold => status == 'HOLD';
  bool get isReserved => status == 'RESERVED';
  bool get isSelectable => isAvailable;
}

/// 좌석 HOLD 응답 (SeatHoldResponse)
class SeatHoldModel {
  SeatHoldModel({
    required this.holdToken,
    required this.screeningId,
    required this.seatId,
    this.holdExpireAt,
    this.ttlSeconds,
  });

  final String holdToken;
  final int screeningId;
  final int seatId;
  final String? holdExpireAt;
  final int? ttlSeconds;

  factory SeatHoldModel.fromJson(Map<String, dynamic> json) {
    return SeatHoldModel(
      holdToken: json['holdToken'] as String? ?? '',
      screeningId: (json['screeningId'] as num).toInt(),
      seatId: (json['seatId'] as num).toInt(),
      holdExpireAt: json['holdExpireAt']?.toString(),
      ttlSeconds: (json['ttlSeconds'] as num?)?.toInt(),
    );
  }
}
