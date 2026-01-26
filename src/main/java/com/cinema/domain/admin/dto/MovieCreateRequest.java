package com.cinema.domain.admin.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 영화 등록 요청 DTO
 */
@Getter
@NoArgsConstructor
public class MovieCreateRequest {

    @NotBlank(message = "영화 제목은 필수입니다.")
    private String title;

    private String description;

    @NotNull(message = "상영 시간은 필수입니다.")
    @Positive(message = "상영 시간은 양수여야 합니다.")
    private Integer runningTime;

    private String rating;

    private String genre;

    private String director;

    private String actors;

    private String posterUrl;

    private LocalDate releaseDate;
}
