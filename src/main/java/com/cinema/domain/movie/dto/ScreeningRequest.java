package com.cinema.domain.movie.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ScreeningRequest {
    
    private Long movieId;       // 어떤 영화를 상영할지
    private Long screenId;      // 어느 상영관에서 할지
    private LocalDateTime startTime; // 언제 시작할지 (yyyy-MM-ddTHH:mm:ss 형식)

    // 종료 시간(endTime)은 영화의 러닝타임을 더해서 서버에서 계산하므로 입력받지 않습니다.
}