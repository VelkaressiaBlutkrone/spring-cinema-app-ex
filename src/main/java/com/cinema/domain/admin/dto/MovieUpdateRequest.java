package com.cinema.domain.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 영화 수정 요청 DTO
 */
@Getter
@NoArgsConstructor
public class MovieUpdateRequest {

    @NotBlank(message = "영화 제목은 필수입니다.")
    private String title;

    private String description;

    @Positive(message = "상영 시간은 양수여야 합니다.")
    private Integer runningTime;

    private String rating;

    private String genre;

    private String director;

    private String actors;

    private String posterUrl;
}
