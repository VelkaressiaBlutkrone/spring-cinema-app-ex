package com.cinema.domain.screening.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinema.domain.movie.dto.ScreeningRequest;
import com.cinema.domain.movie.service.ScreeningService;

import lombok.RequiredArgsConstructor;

/**
 * 상영 스케줄 API Controller
 */
@RestController
@RequestMapping("/api/screenings")
@RequiredArgsConstructor
public class ScreeningController {

    private final ScreeningService screeningService;

    @PostMapping
    public ResponseEntity<Long> createScreening(@RequestBody ScreeningRequest request) {
        return ResponseEntity.ok(screeningService.createScreening(request));
    }
}
