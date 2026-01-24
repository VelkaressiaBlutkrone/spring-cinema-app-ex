package com.cinema.domain.movie.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinema.domain.movie.entity.Movie;

public interface MovieRepository extends JpaRepository<Movie, Long> {

}
