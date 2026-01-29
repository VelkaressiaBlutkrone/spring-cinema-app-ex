package com.cinema.domain.admin.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.admin.dto.StatsDailyItem;
import com.cinema.domain.admin.dto.StatsKpiResponse;
import com.cinema.domain.admin.dto.StatsTopMovieItem;
import com.cinema.domain.payment.entity.Payment;
import com.cinema.domain.payment.entity.PaymentStatus;
import com.cinema.domain.payment.repository.PaymentRepository;
import com.cinema.domain.reservation.entity.Reservation;
import com.cinema.domain.reservation.entity.ReservationStatus;
import com.cinema.domain.reservation.repository.ReservationRepository;
import com.cinema.domain.movie.entity.Movie;
import com.cinema.domain.screening.entity.SeatStatus;
import com.cinema.domain.screening.entity.Screening;
import com.cinema.domain.screening.repository.ScreeningRepository;

import lombok.RequiredArgsConstructor;

/**
 * 통계 대시보드 서비스 (Step 15)
 * KPI, 일별 추이, 상영 중 영화 TOP 예매 순위
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStatsService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final ScreeningRepository screeningRepository;

    /**
     * KPI: 오늘 매출, 예매 건수, 좌석 점유율(%), 노쇼 예상금액(플레이스홀더)
     */
    public StatsKpiResponse getKpi() {
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);

        long todaySales = paymentRepository
                .findByPayStatusAndPaidAtBetween(PaymentStatus.SUCCESS, todayStart, todayEnd)
                .stream()
                .mapToLong(p -> p.getPayAmount())
                .sum();

        long todayBookings = reservationRepository
                .findByStatusAndCreatedAtBetween(ReservationStatus.CONFIRMED, todayStart, todayEnd)
                .size();

        BigDecimal todayOccupancy = computeTodayOccupancy(todayStart, todayEnd);

        return new StatsKpiResponse(
                todaySales,
                todayBookings,
                todayOccupancy,
                0L /* 노쇼 예상금액 플레이스홀더 */);
    }

    /**
     * 일별 매출·예매 건수 추이 (최근 days일)
     */
    public List<StatsDailyItem> getDailyTrend(int days) {
        if (days < 1 || days > 365) {
            days = 30;
        }
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusDays(days).toLocalDate().atStartOfDay();

        var payments = paymentRepository
                .findByPayStatusAndPaidAtBetween(PaymentStatus.SUCCESS, start, end);
        var reservations = reservationRepository
                .findByStatusAndCreatedAtBetween(ReservationStatus.CONFIRMED, start, end);

        Map<LocalDate, Long> salesByDate = payments.stream()
                .filter(p -> p.getPaidAt() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getPaidAt().toLocalDate(),
                        Collectors.summingLong(Payment::getPayAmount)));
        Map<LocalDate, Long> bookingsByDate = reservations.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getCreatedAt().toLocalDate(),
                        Collectors.counting()));

        List<StatsDailyItem> result = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            LocalDate d = end.toLocalDate().minusDays(days - 1 - i);
            long sales = salesByDate.getOrDefault(d, 0L);
            long bookings = bookingsByDate.getOrDefault(d, 0L);
            result.add(new StatsDailyItem(d, sales, bookings));
        }
        return result;
    }

    /**
     * 오늘 상영 영화 TOP N 예매 순위 (예매 건수 기준)
     */
    public List<StatsTopMovieItem> getTopMoviesByBookings(int limit) {
        if (limit < 1 || limit > 20) {
            limit = 5;
        }
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);

        List<Screening> todayScreenings = screeningRepository.findUpcomingScreenings(todayStart, todayEnd);
        if (todayScreenings.isEmpty()) {
            return List.of();
        }

        List<Long> screeningIds = todayScreenings.stream().map(Screening::getId).toList();
        Map<Long, Long> countsByMovie = reservationRepository
                .findByStatusAndCreatedAtBetween(ReservationStatus.CONFIRMED, todayStart, todayEnd)
                .stream()
                .filter(r -> screeningIds.contains(r.getScreening().getId()))
                .collect(Collectors.groupingBy(
                        r -> r.getScreening().getMovie().getId(),
                        Collectors.counting()));

        Map<Long, Movie> moviesById = todayScreenings.stream()
                .map(Screening::getMovie)
                .collect(Collectors.toMap(Movie::getId, m -> m, (a, b) -> a));

        return moviesById.values().stream()
                .map(m -> new StatsTopMovieItem(
                        m.getId(),
                        m.getTitle(),
                        countsByMovie.getOrDefault(m.getId(), 0L)))
                .sorted(Comparator.comparingLong(StatsTopMovieItem::getBookingCount).reversed())
                .limit(limit)
                .toList();
    }

    private BigDecimal computeTodayOccupancy(LocalDateTime todayStart, LocalDateTime todayEnd) {
        List<Screening> todayScreenings = screeningRepository.findUpcomingScreenings(todayStart, todayEnd);
        if (todayScreenings.isEmpty()) {
            return BigDecimal.ZERO;
        }

        long totalSeats = 0;
        long reservedSeats = 0;
        for (Screening s : todayScreenings) {
            var opt = screeningRepository.findByIdWithScreeningSeats(s.getId());
            if (opt.isEmpty()) {
                continue;
            }
            var seats = opt.get().getScreeningSeats();
            int total = seats.size();
            long reserved = seats.stream()
                    .filter(ss -> ss.getStatus() == SeatStatus.RESERVED)
                    .count();
            totalSeats += total;
            reservedSeats += reserved;
        }
        if (totalSeats == 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(reservedSeats * 100.0 / totalSeats)
                .setScale(1, RoundingMode.HALF_UP);
    }
}
