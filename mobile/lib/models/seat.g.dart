// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'seat.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SeatLayoutModel _$SeatLayoutModelFromJson(Map<String, dynamic> json) =>
    SeatLayoutModel(
      screeningId: (json['screeningId'] as num).toInt(),
      seats: (json['seats'] as List<dynamic>)
          .map((e) => SeatStatusItemModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$SeatLayoutModelToJson(SeatLayoutModel instance) =>
    <String, dynamic>{
      'screeningId': instance.screeningId,
      'seats': instance.seats,
    };

SeatStatusItemModel _$SeatStatusItemModelFromJson(Map<String, dynamic> json) =>
    SeatStatusItemModel(
      seatId: (json['seatId'] as num).toInt(),
      status: json['status'] as String? ?? 'AVAILABLE',
      rowLabel: json['rowLabel'] as String? ?? '',
      seatNo: (json['seatNo'] as num?)?.toInt() ?? 0,
      holdExpireAt: json['holdExpireAt'] as String?,
      holdToken: json['holdToken'] as String?,
      isHeldByCurrentUser: json['isHeldByCurrentUser'] as bool?,
    );

Map<String, dynamic> _$SeatStatusItemModelToJson(
  SeatStatusItemModel instance,
) => <String, dynamic>{
  'seatId': instance.seatId,
  'status': instance.status,
  'rowLabel': instance.rowLabel,
  'seatNo': instance.seatNo,
  'holdExpireAt': instance.holdExpireAt,
  'holdToken': instance.holdToken,
  'isHeldByCurrentUser': instance.isHeldByCurrentUser,
};

SeatHoldModel _$SeatHoldModelFromJson(Map<String, dynamic> json) =>
    SeatHoldModel(
      holdToken: json['holdToken'] as String? ?? '',
      screeningId: (json['screeningId'] as num).toInt(),
      seatId: (json['seatId'] as num).toInt(),
      holdExpireAt: json['holdExpireAt'] as String?,
      ttlSeconds: (json['ttlSeconds'] as num?)?.toInt(),
    );

Map<String, dynamic> _$SeatHoldModelToJson(SeatHoldModel instance) =>
    <String, dynamic>{
      'holdToken': instance.holdToken,
      'screeningId': instance.screeningId,
      'seatId': instance.seatId,
      'holdExpireAt': instance.holdExpireAt,
      'ttlSeconds': instance.ttlSeconds,
    };
