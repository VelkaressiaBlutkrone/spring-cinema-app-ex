import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/reservation.dart';
import 'api_providers.dart';

/// 내 예매 내역 Provider
final myReservationsProvider =
    FutureProvider.autoDispose<List<ReservationDetailModel>>((ref) async {
  final service = ref.watch(reservationApiServiceProvider);
  return service.getMyReservations();
});
