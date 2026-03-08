import 'package:json_annotation/json_annotation.dart';

part 'member.g.dart';

/// 회원 프로필 조회 응답 (GET /api/members/me)
@JsonSerializable()
class MemberProfileModel {
  MemberProfileModel({
    required this.loginId,
    required this.name,
    this.email,
    this.phone,
  });

  @JsonKey(defaultValue: '')
  final String loginId;
  @JsonKey(defaultValue: '')
  final String name;
  final String? email;
  final String? phone;

  factory MemberProfileModel.fromJson(Map<String, dynamic> json) => _$MemberProfileModelFromJson(json);
  Map<String, dynamic> toJson() => _$MemberProfileModelToJson(this);
}

/// 마이페이지 HOLD(장바구니) 요약 - 상영별 그룹
@JsonSerializable()
class MemberHoldSummaryModel {
  MemberHoldSummaryModel({
    required this.screeningId,
    required this.movieTitle,
    required this.screenName,
    required this.startTime,
    required this.seats,
  });

  final int screeningId;
  @JsonKey(defaultValue: '')
  final String movieTitle;
  @JsonKey(defaultValue: '')
  final String screenName;
  @JsonKey(defaultValue: '')
  final String startTime;
  final List<MemberHoldSeatItemModel> seats;

  factory MemberHoldSummaryModel.fromJson(Map<String, dynamic> json) => _$MemberHoldSummaryModelFromJson(json);
  Map<String, dynamic> toJson() => _$MemberHoldSummaryModelToJson(this);
}

/// HOLD 좌석 항목 (holdToken으로 결제/해제)
@JsonSerializable()
class MemberHoldSeatItemModel {
  MemberHoldSeatItemModel({
    required this.seatId,
    required this.rowLabel,
    required this.seatNo,
    required this.displayName,
    required this.holdToken,
    required this.holdExpireAt,
  });

  final int seatId;
  @JsonKey(defaultValue: '')
  final String rowLabel;
  @JsonKey(defaultValue: 0)
  final int seatNo;
  @JsonKey(defaultValue: '')
  final String displayName;
  @JsonKey(defaultValue: '')
  final String holdToken;
  @JsonKey(defaultValue: '')
  final String holdExpireAt;

  factory MemberHoldSeatItemModel.fromJson(Map<String, dynamic> json) => _$MemberHoldSeatItemModelFromJson(json);
  Map<String, dynamic> toJson() => _$MemberHoldSeatItemModelToJson(this);
}
