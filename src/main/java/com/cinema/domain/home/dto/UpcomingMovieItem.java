package com.cinema.domain.home.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 3일 이내 상영 예정 영화 목록용 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UpcomingMovieItem {

    private Long id;
    private String title;
    private String posterUrl;
}
