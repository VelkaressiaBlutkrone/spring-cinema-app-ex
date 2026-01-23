package com.cinema.domain.screen.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cinema.domain.screen.entity.Screen;

public interface ScreenRepository extends JpaRepository<Screen, Long> {

}
