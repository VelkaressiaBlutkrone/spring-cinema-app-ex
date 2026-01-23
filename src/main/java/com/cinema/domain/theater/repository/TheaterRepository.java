package com.cinema.domain.theater.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinema.domain.theater.entity.Theater;
import com.cinema.domain.theater.entity.TheaterStatus;

/**
 * 영화관 Repository
 */
public interface TheaterRepository extends JpaRepository<Theater, Long> {

    List<Theater> findByStatus(TheaterStatus status);

    List<Theater> findByLocation(String location);
}
