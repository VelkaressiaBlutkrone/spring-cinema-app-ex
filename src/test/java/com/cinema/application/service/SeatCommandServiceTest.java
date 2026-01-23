package com.cinema.application.service;

import com.cinema.domain.repository.ScreeningRepository;
import com.cinema.domain.screening.Screening;
import com.cinema.domain.screening.Seat;
import com.cinema.domain.screening.SeatStatus;
import com.cinema.infrastructure.lock.DistributedLockManager;
import com.cinema.infrastructure.redis.RedisService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

/**
 * SeatCommandService Unit Test
 * RULE.md 1. 절대 원칙 및 4. 좌석 상태 관리 규칙 준수 여부 테스트
 */
@ExtendWith(MockitoExtension.class)
class SeatCommandServiceTest {

    @InjectMocks
    private SeatCommandService seatCommandService;

    @Mock
    private ScreeningRepository screeningRepository;

    @Mock
    private RedisService redisService;

    @Mock
    private DistributedLockManager lockManager;

    @Test
    @DisplayName("좌석 HOLD 성공 시나리오 - 락 획득 -> DB 조회 -> 상태 변경 -> DB 저장 -> Redis 저장 -> 락 해제")
    void holdSeat_Success() {
        // Given
        Long screeningId = 1L;
        Long seatId = 10L;
        Long userId = 100L;

        Seat seat = Seat.builder()
                .seatId(seatId)
                .status(SeatStatus.AVAILABLE)
                .build();

        Screening screening = Screening.builder()
                .screeningId(screeningId)
                .seats(Collections.singletonList(seat))
                .build();

        // Mocking: 락 획득 성공
        given(lockManager.tryLock(anyString(), anyString(), anyLong())).willReturn(true);
        // Mocking: Screening 조회 성공
        given(screeningRepository.findById(screeningId)).willReturn(Optional.of(screening));

        // When
        String holdToken = seatCommandService.holdSeat(screeningId, seatId, userId);

        // Then
        // 1. 락 획득 시도 확인
        verify(lockManager).tryLock(contains("screening:" + screeningId), contains("seat:" + seatId), anyLong());

        // 2. DB 조회 확인
        verify(screeningRepository).findById(screeningId);

        // 3. 상태 변경 확인 (Domain Logic)
        assertThat(seat.getStatus()).isEqualTo(SeatStatus.HOLD);

        // 4. DB 저장 확인 (Dirty Checking으로 자동 저장되지만, 명시적 호출이 있다면 검증)
        // verify(screeningRepository).save(screening);

        // 5. Redis에 HOLD 정보 저장 확인 (TTL 설정 필수)
        verify(redisService).saveHold(eq(screeningId), eq(seatId), anyString(), anyLong());

        // 6. 락 해제 확인
        verify(lockManager).unlock(contains("screening:" + screeningId), contains("seat:" + seatId));

        // 7. 토큰 반환 확인
        assertThat(holdToken).isNotNull();
    }

    @Test
    @DisplayName("분산 락 획득 실패 시 즉시 실패 응답 (Fail Fast)")
    void holdSeat_Fail_LockAcquisition() {
        // Given
        Long screeningId = 1L;
        Long seatId = 10L;
        Long userId = 100L;

        // Mocking: 락 획득 실패
        given(lockManager.tryLock(anyString(), anyString(), anyLong())).willReturn(false);

        // When & Then
        assertThatThrownBy(() -> seatCommandService.holdSeat(screeningId, seatId, userId))
                .isInstanceOf(IllegalStateException.class) // 또는 커스텀 예외
                .hasMessageContaining("잠시 후 다시 시도해주세요");

        // Verify: DB 조회나 Redis 저장이 일어나지 않아야 함
        verify(screeningRepository, never()).findById(anyLong());
        verify(redisService, never()).saveHold(anyLong(), anyLong(), anyString(), anyLong());
    }
}
