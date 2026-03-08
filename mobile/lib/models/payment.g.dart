// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PaymentRequestModel _$PaymentRequestModelFromJson(Map<String, dynamic> json) =>
    PaymentRequestModel(
      screeningId: (json['screeningId'] as num).toInt(),
      seatHoldItems: (json['seatHoldItems'] as List<dynamic>)
          .map((e) => SeatHoldItemModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      payMethod: json['payMethod'] as String,
    );

Map<String, dynamic> _$PaymentRequestModelToJson(
  PaymentRequestModel instance,
) => <String, dynamic>{
  'screeningId': instance.screeningId,
  'seatHoldItems': instance.seatHoldItems,
  'payMethod': instance.payMethod,
};

SeatHoldItemModel _$SeatHoldItemModelFromJson(Map<String, dynamic> json) =>
    SeatHoldItemModel(
      seatId: (json['seatId'] as num).toInt(),
      holdToken: json['holdToken'] as String,
    );

Map<String, dynamic> _$SeatHoldItemModelToJson(SeatHoldItemModel instance) =>
    <String, dynamic>{
      'seatId': instance.seatId,
      'holdToken': instance.holdToken,
    };

PaymentResponseModel _$PaymentResponseModelFromJson(
  Map<String, dynamic> json,
) => PaymentResponseModel(
  reservationId: (json['reservationId'] as num).toInt(),
  reservationNo: json['reservationNo'] as String? ?? '',
  screeningId: (json['screeningId'] as num).toInt(),
  totalSeats: (json['totalSeats'] as num?)?.toInt() ?? 0,
  totalAmount: (json['totalAmount'] as num?)?.toInt() ?? 0,
);

Map<String, dynamic> _$PaymentResponseModelToJson(
  PaymentResponseModel instance,
) => <String, dynamic>{
  'reservationId': instance.reservationId,
  'reservationNo': instance.reservationNo,
  'screeningId': instance.screeningId,
  'totalSeats': instance.totalSeats,
  'totalAmount': instance.totalAmount,
};
