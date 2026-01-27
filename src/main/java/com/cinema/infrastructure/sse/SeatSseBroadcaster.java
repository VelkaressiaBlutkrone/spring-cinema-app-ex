package com.cinema.infrastructure.sse;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.cinema.domain.screening.service.SeatEventPublisher;
import com.google.gson.Gson;

import lombok.extern.slf4j.Slf4j;

/**
 * 좌석 상태 변경 실시간 푸시 (Step 8) - SSE 구현
 *
 * RULE:
 * - 좌석 상태 변경 시에만 Push
 * - 변경 좌석 ID만 전달 (전체 좌석 재전송 금지)
 * - 이벤트 ID 기반 멱등성 보장
 * - 상영별 구독 관리
 */
@Slf4j
@Component
public class SeatSseBroadcaster implements SeatEventPublisher {

    private static final long SSE_TIMEOUT_MS = 30 * 60 * 1000L; // 30분

    private final Gson gson;

    /** 상영 ID -> 해당 상영 구독자(SseEmitter) 목록 */
    private final Map<Long, List<SseEmitter>> screeningSubscribers = new ConcurrentHashMap<>();

    public SeatSseBroadcaster(Gson gson) {
        this.gson = gson;
    }

    /**
     * 상영 좌석 이벤트 구독 등록
     * GET /api/screenings/{screeningId}/seat-events 에서 호출
     */
    public SseEmitter register(Long screeningId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);

        screeningSubscribers
                .computeIfAbsent(screeningId, k -> new CopyOnWriteArrayList<>())
                .add(emitter);

        emitter.onCompletion(() -> unregister(screeningId, emitter));
        emitter.onTimeout(() -> unregister(screeningId, emitter));
        emitter.onError(e -> unregister(screeningId, emitter));

        return emitter;
    }

    private void unregister(Long screeningId, SseEmitter emitter) {
        List<SseEmitter> list = screeningSubscribers.get(screeningId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) {
                screeningSubscribers.remove(screeningId);
            }
        }
    }

    @Override
    public void publishSeatStatusChanged(Long screeningId, List<Long> seatIds) {
        if (screeningId == null || seatIds == null || seatIds.isEmpty()) {
            return;
        }
        List<SseEmitter> subscribers = screeningSubscribers.get(screeningId);
        if (subscribers == null || subscribers.isEmpty()) {
            return;
        }

        String eventId = UUID.randomUUID().toString();
        SeatEventPayload payload = new SeatEventPayload(eventId, screeningId, new ArrayList<>(seatIds));

        List<SseEmitter> dead = new ArrayList<>();
        for (SseEmitter emitter : subscribers) {
            try {
                emitter.send(SseEmitter.event()
                        .id(eventId)
                        .name("seat-status-changed")
                        .data(gson.toJson(payload)));
            } catch (IOException e) {
                log.debug("[SSE] send failed screeningId={}, emitter={}", screeningId, e.getMessage());
                dead.add(emitter);
            }
        }
        for (SseEmitter e : dead) {
            unregister(screeningId, e);
        }
    }

    /** 이벤트 페이로드 - eventId 기반 멱등성, 변경 좌석 ID만 전달 */
    public record SeatEventPayload(String eventId, Long screeningId, List<Long> seatIds) {}
}
