package com.cinema.domain.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 영화관 수정 요청 DTO
 */
@Getter
@NoArgsConstructor
public class TheaterUpdateRequest {

    @NotBlank(message = "영화관 이름은 필수입니다.")
    private String name;

    private String location;

    private String address;

    private String phone;
}
