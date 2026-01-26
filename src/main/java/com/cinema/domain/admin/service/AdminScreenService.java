package com.cinema.domain.admin.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinema.domain.admin.dto.ScreenCreateRequest;
import com.cinema.domain.admin.dto.ScreenResponse;
import com.cinema.domain.admin.dto.ScreenUpdateRequest;
import com.cinema.domain.screening.entity.Screen;
import com.cinema.domain.screening.repository.ScreenRepository;
import com.cinema.domain.theater.entity.Theater;
import com.cinema.domain.theater.repository.TheaterRepository;
import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

/**
 * 관리자 상영관 관리 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminScreenService {

    private final ScreenRepository screenRepository;
    private final TheaterRepository theaterRepository;

    /**
     * 상영관 등록
     */
    @Transactional
    public Long createScreen(ScreenCreateRequest request) {
        Theater theater = theaterRepository.findById(request.getTheaterId())
                .orElseThrow(() -> new BusinessException(ErrorCode.THEATER_NOT_FOUND));

        Screen screen = Screen.builder()
                .theater(theater)
                .name(request.getName())
                .totalRows(request.getTotalRows())
                .totalCols(request.getTotalCols())
                .screenType(request.getScreenType())
                .build();

        return screenRepository.save(screen).getId();
    }

    /**
     * 상영관 수정
     */
    @Transactional
    public void updateScreen(Long screenId, ScreenUpdateRequest request) {
        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCREEN_NOT_FOUND));

        screen.updateInfo(
                request.getName(),
                request.getTotalRows(),
                request.getTotalCols(),
                request.getScreenType());
    }

    /**
     * 상영관 삭제
     */
    @Transactional
    public void deleteScreen(Long screenId) {
        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCREEN_NOT_FOUND));

        screenRepository.delete(screen);
    }

    /**
     * 상영관 목록 조회 (페이징)
     */
    public Page<ScreenResponse> getScreens(Pageable pageable) {
        return screenRepository.findAll(pageable)
                .map(ScreenResponse::new);
    }

    /**
     * 상영관 상세 조회
     */
    public ScreenResponse getScreen(Long screenId) {
        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCREEN_NOT_FOUND));

        return new ScreenResponse(screen);
    }

    /**
     * 특정 영화관의 상영관 목록 조회
     */
    public List<ScreenResponse> getScreensByTheater(Long theaterId) {
        return screenRepository.findByTheaterId(theaterId).stream()
                .map(ScreenResponse::new)
                .collect(Collectors.toList());
    }
}
