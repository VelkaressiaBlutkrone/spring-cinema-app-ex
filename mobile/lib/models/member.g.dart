// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'member.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

MemberProfileModel _$MemberProfileModelFromJson(Map<String, dynamic> json) =>
    MemberProfileModel(
      loginId: json['loginId'] as String? ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String?,
      phone: json['phone'] as String?,
    );

Map<String, dynamic> _$MemberProfileModelToJson(MemberProfileModel instance) =>
    <String, dynamic>{
      'loginId': instance.loginId,
      'name': instance.name,
      'email': instance.email,
      'phone': instance.phone,
    };

MemberHoldSummaryModel _$MemberHoldSummaryModelFromJson(
  Map<String, dynamic> json,
) => MemberHoldSummaryModel(
  screeningId: (json['screeningId'] as num).toInt(),
  movieTitle: json['movieTitle'] as String? ?? '',
  screenName: json['screenName'] as String? ?? '',
  startTime: json['startTime'] as String? ?? '',
  seats: (json['seats'] as List<dynamic>)
      .map((e) => MemberHoldSeatItemModel.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$MemberHoldSummaryModelToJson(
  MemberHoldSummaryModel instance,
) => <String, dynamic>{
  'screeningId': instance.screeningId,
  'movieTitle': instance.movieTitle,
  'screenName': instance.screenName,
  'startTime': instance.startTime,
  'seats': instance.seats,
};

MemberHoldSeatItemModel _$MemberHoldSeatItemModelFromJson(
  Map<String, dynamic> json,
) => MemberHoldSeatItemModel(
  seatId: (json['seatId'] as num).toInt(),
  rowLabel: json['rowLabel'] as String? ?? '',
  seatNo: (json['seatNo'] as num?)?.toInt() ?? 0,
  displayName: json['displayName'] as String? ?? '',
  holdToken: json['holdToken'] as String? ?? '',
  holdExpireAt: json['holdExpireAt'] as String? ?? '',
);

Map<String, dynamic> _$MemberHoldSeatItemModelToJson(
  MemberHoldSeatItemModel instance,
) => <String, dynamic>{
  'seatId': instance.seatId,
  'rowLabel': instance.rowLabel,
  'seatNo': instance.seatNo,
  'displayName': instance.displayName,
  'holdToken': instance.holdToken,
  'holdExpireAt': instance.holdExpireAt,
};
