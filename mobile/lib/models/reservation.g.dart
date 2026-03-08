// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reservation.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PaymentSummaryModel _$PaymentSummaryModelFromJson(Map<String, dynamic> json) =>
    PaymentSummaryModel(
      paymentId: (json['paymentId'] as num?)?.toInt() ?? 0,
      paymentNo: json['paymentNo'] as String? ?? '',
      payStatus: json['payStatus'] as String? ?? '',
      payMethod: json['payMethod'] as String? ?? '',
      payAmount: (json['payAmount'] as num?)?.toInt() ?? 0,
      paidAt: json['paidAt'] as String?,
    );

Map<String, dynamic> _$PaymentSummaryModelToJson(
  PaymentSummaryModel instance,
) => <String, dynamic>{
  'paymentId': instance.paymentId,
  'paymentNo': instance.paymentNo,
  'payStatus': instance.payStatus,
  'payMethod': instance.payMethod,
  'payAmount': instance.payAmount,
  'paidAt': instance.paidAt,
};

ReservationDetailModel _$ReservationDetailModelFromJson(
  Map<String, dynamic> json,
) => ReservationDetailModel(
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
  seats: (json['seats'] as List<dynamic>)
      .map((e) => ReservationSeatItemModel.fromJson(e as Map<String, dynamic>))
      .toList(),
  createdAt: json['createdAt'] as String?,
  payment: json['payment'] == null
      ? null
      : PaymentSummaryModel.fromJson(json['payment'] as Map<String, dynamic>),
);

Map<String, dynamic> _$ReservationDetailModelToJson(
  ReservationDetailModel instance,
) => <String, dynamic>{
  'reservationId': instance.reservationId,
  'reservationNo': instance.reservationNo,
  'status': instance.status,
  'memberId': instance.memberId,
  'screeningId': instance.screeningId,
  'movieTitle': instance.movieTitle,
  'screenName': instance.screenName,
  'startTime': instance.startTime,
  'totalSeats': instance.totalSeats,
  'totalAmount': instance.totalAmount,
  'seats': instance.seats,
  'createdAt': instance.createdAt,
  'payment': instance.payment,
};

ReservationSeatItemModel _$ReservationSeatItemModelFromJson(
  Map<String, dynamic> json,
) => ReservationSeatItemModel(
  seatId: (json['seatId'] as num).toInt(),
  rowLabel: json['rowLabel'] as String? ?? '',
  seatNo: (json['seatNo'] as num?)?.toInt() ?? 0,
  displayName: json['displayName'] as String? ?? '',
  price: (json['price'] as num?)?.toInt() ?? 0,
);

Map<String, dynamic> _$ReservationSeatItemModelToJson(
  ReservationSeatItemModel instance,
) => <String, dynamic>{
  'seatId': instance.seatId,
  'rowLabel': instance.rowLabel,
  'seatNo': instance.seatNo,
  'displayName': instance.displayName,
  'price': instance.price,
};
