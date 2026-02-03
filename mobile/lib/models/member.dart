/// 회원 프로필 조회 응답 (GET /api/members/me)
class MemberProfileModel {
  MemberProfileModel({
    required this.loginId,
    required this.name,
    this.email,
    this.phone,
  });

  final String loginId;
  final String name;
  final String? email;
  final String? phone;

  factory MemberProfileModel.fromJson(Map<String, dynamic> json) {
    return MemberProfileModel(
      loginId: json['loginId'] as String? ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String?,
      phone: json['phone'] as String?,
    );
  }
}

/// 마이페이지 HOLD(장바구니) 요약 - 상영별 그룹
class MemberHoldSummaryModel {
  MemberHoldSummaryModel({
    required this.screeningId,
    required this.movieTitle,
    required this.screenName,
    required this.startTime,
    required this.seats,
  });

  final int screeningId;
  final String movieTitle;
  final String screenName;
  final String startTime;
  final List<MemberHoldSeatItemModel> seats;

  factory MemberHoldSummaryModel.fromJson(Map<String, dynamic> json) {
    final list = json['seats'] as List<dynamic>? ?? [];
    return MemberHoldSummaryModel(
      screeningId: (json['screeningId'] as num).toInt(),
      movieTitle: json['movieTitle'] as String? ?? '',
      screenName: json['screenName'] as String? ?? '',
      startTime: json['startTime'] as String? ?? '',
      seats: list.map((e) => MemberHoldSeatItemModel.fromJson(e as Map<String, dynamic>)).toList(),
    );
  }
}

/// HOLD 좌석 항목 (holdToken으로 결제/해제)
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
  final String rowLabel;
  final int seatNo;
  final String displayName;
  final String holdToken;
  final String holdExpireAt;

  factory MemberHoldSeatItemModel.fromJson(Map<String, dynamic> json) {
    return MemberHoldSeatItemModel(
      seatId: (json['seatId'] as num).toInt(),
      rowLabel: json['rowLabel'] as String? ?? '',
      seatNo: (json['seatNo'] as num?)?.toInt() ?? 0,
      displayName: json['displayName'] as String? ?? '',
      holdToken: json['holdToken'] as String? ?? '',
      holdExpireAt: json['holdExpireAt']?.toString() ?? '',
    );
  }
}
