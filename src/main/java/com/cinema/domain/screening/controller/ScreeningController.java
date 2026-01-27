package com.cinema.domain.screening.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.cinema.domain.member.repository.MemberRepository;
import com.cinema.domain.movie.dto.ScreeningRequest;
import com.cinema.domain.movie.service.ScreeningService;
import com.cinema.domain.screening.dto.SeatHoldResponse;
import com.cinema.domain.screening.dto.SeatLayoutResponse;
import com.cinema.domain.screening.dto.SeatReleaseRequest;
import com.cinema.domain.screening.service.SeatCommandService;
import com.cinema.domain.screening.service.SeatStatusQueryService;
import com.cinema.global.dto.ApiResponse;
import com.cinema.global.exception.BusinessException;
import com.cinema.global.exception.ErrorCode;
import com.cinema.infrastructure.sse.SeatSseBroadcaster;

import lombok.RequiredArgsConstructor;

/**
 * 상영 스케줄 API Controller
 *
 * Step 5: GET /api/screenings/{screeningId}/seats - 좌석 배치 조회 (Redis 캐시, DB Fallback)
 * Step 6: POST .../hold, POST .../holds/release - 좌석 HOLD / HOLD 해제 (인증 필요)
 * Step 8: GET .../seat-events - 실시간 좌석 상태 갱신 SSE (상영별 구독)
 */
@RestController
@RequestMapping("/api/screenings")
@RequiredArgsConstructor
public class ScreeningController {

    private final ScreeningService screeningService;
    private final SeatStatusQueryService seatStatusQueryService;
    private final SeatCommandService seatCommandService;
    private final MemberRepository memberRepository;
    private final SeatSseBroadcaster seatSseBroadcaster;

    @PostMapping
    public ResponseEntity<Long> createScreening(@RequestBody ScreeningRequest request) {
        return ResponseEntity.ok(screeningService.createScreening(request));
    }

    /**
     * 좌석 배치·상태 조회 (Step 5)
     * Redis 캐시 우선, 미스/장애 시 DB Fallback
     * Key: seat:status:{screeningId}
     */
    @GetMapping("/{screeningId}/seats")
    public ResponseEntity<ApiResponse<SeatLayoutResponse>> getSeatLayout(
            @PathVariable Long screeningId) {
        SeatLayoutResponse layout = seatStatusQueryService.getSeatLayout(screeningId);
        return ResponseEntity.ok(ApiResponse.success(layout));
    }

    /**
     * 실시간 좌석 상태 갱신 SSE (Step 8)
     * 상영별 구독, 좌석 상태 변경 시에만 eventId + 변경 좌석 ID만 Push
     * 인증 불필요 (GET /api/screenings/** permitAll)
     */
    @GetMapping(value = "/{screeningId}/seat-events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamSeatEvents(@PathVariable Long screeningId) {
        return seatSseBroadcaster.register(screeningId);
    }

    /**
     * 좌석 HOLD (Step 6)
     * 인증 필요. 락 획득 실패 시 즉시 실패 응답.
     */
    @PostMapping("/{screeningId}/seats/{seatId}/hold")
    public ResponseEntity<ApiResponse<SeatHoldResponse>> hold(
            @PathVariable Long screeningId,
            @PathVariable Long seatId,
            Authentication authentication) {
        Long memberId = resolveMemberId(authentication);
        SeatHoldResponse response = seatCommandService.hold(screeningId, seatId, memberId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    /**
     * 좌석 HOLD 해제 (Step 6)
     * holdToken 검증 필요.
     */
    @PostMapping("/holds/release")
    public ResponseEntity<ApiResponse<Void>> releaseHold(
            @Validated @RequestBody SeatReleaseRequest request) {
        seatCommandService.releaseHold(
                request.getScreeningId(),
                request.getSeatId(),
                request.getHoldToken());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private Long resolveMemberId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        String loginId = authentication.getName();
        return memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND))
                .getId();
    }
}
