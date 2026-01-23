package com.cinema.domain.screening.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cinema.domain.screening.entity.Screen;
import com.cinema.domain.screening.entity.ScreenStatus;

/**
 * 상영관 Repository
 */
public interface ScreenRepository extends JpaRepository<Screen, Long> {

    List<Screen> findByTheaterId(Long theaterId);

    List<Screen> findByTheaterIdAndStatus(Long theaterId, ScreenStatus status);

    @Query("SELECT s FROM Screen s JOIN FETCH s.theater WHERE s.id = :id")
    Screen findByIdWithTheater(@Param("id") Long id);
}
