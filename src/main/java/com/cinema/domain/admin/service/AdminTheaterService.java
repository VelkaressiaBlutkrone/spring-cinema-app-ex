package com.cinema.domain.admin.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.admin.dto.TheaterCreateRequest;
import com.cinema.domain.admin.dto.TheaterResponse;
import com.cinema.domain.admin.dto.TheaterUpdateRequest;
import com.cinema.domain.theater.entity.Theater;
import com.cinema.domain.theater.repository.TheaterRepository;
import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

/**
 * 관리자 영화관 관리 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminTheaterService {

    private final TheaterRepository theaterRepository;

    /**
     * 영화관 등록
     */
    @Transactional
    public Long createTheater(TheaterCreateRequest request) {
        Theater theater = Theater.builder()
                .name(request.getName())
                .location(request.getLocation())
                .address(request.getAddress())
                .phone(request.getPhone())
                .build();

        return theaterRepository.save(theater).getId();
    }

    /**
     * 영화관 수정
     */
    @Transactional
    public void updateTheater(Long theaterId, TheaterUpdateRequest request) {
        Theater theater = theaterRepository.findById(theaterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.THEATER_NOT_FOUND));

        theater.updateInfo(
                request.getName(),
                request.getLocation(),
                request.getAddress(),
                request.getPhone());
    }

    /**
     * 영화관 삭제
     */
    @Transactional
    public void deleteTheater(Long theaterId) {
        Theater theater = theaterRepository.findById(theaterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.THEATER_NOT_FOUND));

        theaterRepository.delete(theater);
    }

    /**
     * 영화관 목록 조회 (페이징)
     */
    public Page<TheaterResponse> getTheaters(Pageable pageable) {
        return theaterRepository.findAll(pageable)
                .map(TheaterResponse::new);
    }

    /**
     * 영화관 상세 조회
     */
    public TheaterResponse getTheater(Long theaterId) {
        Theater theater = theaterRepository.findById(theaterId)
                .orElseThrow(() -> new BusinessException(ErrorCode.THEATER_NOT_FOUND));

        return new TheaterResponse(theater);
    }

    /**
     * 영화관 목록 조회 (전체)
     */
    public List<TheaterResponse> getAllTheaters() {
        return theaterRepository.findAll().stream()
                .map(TheaterResponse::new)
                .toList();
    }
}
