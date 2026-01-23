package com.cinema.domain.screen.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cinema.domain.screen.entity.Screening;

public interface ScreeningRepository extends JpaRepository<Screening, Long> {

    // 겹치는 상영 일정이 있는지 확인 (매우 중요!)
    // 조건: (기존 시작 < 새로운 종료) AND (기존 종료 > 새로운 시작)
    @Query("SELECT COUNT(s) > 0 FROM Screening s " +
            "WHERE s.screen.id = :screenId " +
            "AND s.startTime < :newEndTime " +
            "AND s.endTime > :newStartTime")
    boolean existsByTimeOverlap(@Param("screenId") Long screenId,
            @Param("newStartTime") LocalDateTime newStartTime,
            @Param("newEndTime") LocalDateTime newEndTime);
}
