package com.cinema.domain.movie.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinema.domain.movie.entity.Screen;

public interface ScreenRepository extends JpaRepository<Screen, Long>{
    
}
