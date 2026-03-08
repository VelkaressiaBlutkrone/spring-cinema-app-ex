import 'package:json_annotation/json_annotation.dart';

part 'seat.g.dart';

/// 좌석 배치 조회 응답 (SeatLayoutResponse)
@JsonSerializable()
class SeatLayoutModel {
  SeatLayoutModel({
    required this.screeningId,
    required this.seats,
  });

  final int screeningId;
  final List<SeatStatusItemModel> seats;

  factory SeatLayoutModel.fromJson(Map<String, dynamic> json) => _$SeatLayoutModelFromJson(json);
  Map<String, dynamic> toJson() => _$SeatLayoutModelToJson(this);
}

/// 좌석 상태 항목 (SeatStatusItem)
@JsonSerializable()
class SeatStatusItemModel {
  SeatStatusItemModel({
    required this.seatId,
    required this.status,
    required this.rowLabel,
    required this.seatNo,
    this.holdExpireAt,
    this.holdToken,
    this.isHeldByCurrentUser,
  });

  final int seatId;
  @JsonKey(defaultValue: 'AVAILABLE')
  final String status; // AVAILABLE, HOLD, RESERVED, PAYMENT_PENDING, BLOCKED, DISABLED
  @JsonKey(defaultValue: '')
  final String rowLabel;
  @JsonKey(defaultValue: 0)
  final int seatNo;
  final String? holdExpireAt;
  /// 현재 사용자 소유 HOLD일 때만 API가 내려줌 (재진입 시 취소용)
  final String? holdToken;
  /// 현재 사용자 소유 HOLD 여부
  final bool? isHeldByCurrentUser;

  factory SeatStatusItemModel.fromJson(Map<String, dynamic> json) => _$SeatStatusItemModelFromJson(json);
  Map<String, dynamic> toJson() => _$SeatStatusItemModelToJson(this);

  bool get isAvailable => status == 'AVAILABLE';
  bool get isHold => status == 'HOLD';
  bool get isReserved => status == 'RESERVED';
  bool get isBlocked => status == 'BLOCKED';
  bool get isSelectable => isAvailable;
}

/// 좌석 HOLD 응답 (SeatHoldResponse)
@JsonSerializable()
class SeatHoldModel {
  SeatHoldModel({
    required this.holdToken,
    required this.screeningId,
    required this.seatId,
    this.holdExpireAt,
    this.ttlSeconds,
  });

  @JsonKey(defaultValue: '')
  final String holdToken;
  final int screeningId;
  final int seatId;
  final String? holdExpireAt;
  final int? ttlSeconds;

  factory SeatHoldModel.fromJson(Map<String, dynamic> json) => _$SeatHoldModelFromJson(json);
  Map<String, dynamic> toJson() => _$SeatHoldModelToJson(this);
}
