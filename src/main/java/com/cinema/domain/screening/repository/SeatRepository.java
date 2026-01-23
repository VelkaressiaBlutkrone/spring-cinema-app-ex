package com.cinema.domain.screening.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinema.domain.screening.entity.Seat;
import com.cinema.domain.screening.entity.SeatType;

/**
 * 좌석 Repository
 */
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByScreenId(Long screenId);

    List<Seat> findByScreenIdAndSeatType(Long screenId, SeatType seatType);

    List<Seat> findByScreenIdOrderByRowLabelAscSeatNoAsc(Long screenId);
}
