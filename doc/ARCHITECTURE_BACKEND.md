# 백엔드 아키텍처 (Backend Architecture)

## 1. 도메인 모델 (ERD)

주요 엔티티 간의 관계를 나타냅니다. `Screening`이 Aggregate Root 역할을 수행하며 좌석을 관리합니다.

```mermaid
erDiagram
    MEMBER ||--o{ RESERVATION : makes
    MEMBER {
        Long id PK
        String loginId
        String password
        String role
    }

    MOVIE ||--o{ SCREENING : has
    MOVIE {
        Long id PK
        String title
        String status
    }

    THEATER ||--o{ SCREEN : contains
    SCREEN ||--o{ SEAT : has
    SCREEN ||--o{ SCREENING : hosts

    SCREENING ||--o{ SCREENING_SEAT : manages
    SCREENING {
        Long id PK
        LocalDateTime startTime
        LocalDateTime endTime
    }

    SEAT {
        Long id PK
        String rowLabel
        int seatNo
        String type
    }

    SCREENING_SEAT {
        Long id PK
        Long screeningId FK
        Long seatId FK
        Enum status "AVAILABLE, HOLD, RESERVED..."
    }

    RESERVATION ||--o{ RESERVATION_SEAT : includes
    RESERVATION ||--|| PAYMENT : triggers
    RESERVATION {
        Long id PK
        String reservationNo
        Enum status
    }
```

## 2. 좌석 상태 머신 (Seat State Machine)

`RULE.md`에 정의된 7가지 좌석 상태의 전이 과정입니다.

```mermaid
stateDiagram-v2
    [*] --> AVAILABLE

    AVAILABLE --> HOLD : 좌석 선택 (Redis TTL 설정)
    HOLD --> AVAILABLE : TTL 만료 / 사용자 취소

    HOLD --> PAYMENT_PENDING : 결제 진입
    PAYMENT_PENDING --> AVAILABLE : 결제 실패 / 취소

    PAYMENT_PENDING --> RESERVED : 결제 성공 (DB 저장)
    RESERVATION_CANCELLED --> AVAILABLE : 환불 완료

    RESERVED --> RESERVATION_CANCELLED : 예매 취소

    AVAILABLE --> BLOCKED : 관리자 차단
    BLOCKED --> AVAILABLE : 관리자 해제

    AVAILABLE --> DISABLED : 물리적 고장
    DISABLED --> AVAILABLE : 수리 완료
```

## 3. 핵심 로직: 좌석 예매 시퀀스 (Reservation Sequence)

동시성 제어와 데이터 일관성을 보장하기 위한 흐름입니다.

```mermaid
sequenceDiagram
    participant User
    participant API as Backend API
    participant Redis
    participant DB
    participant PG as Payment Gateway

    Note over User, DB: Step 1: 좌석 선점 (HOLD)
    User->>API: 좌석 선택 요청 (screeningId, seatId)
    API->>Redis: 분산 락 획득 (lock:seat:{id})
    alt 락 획득 성공
        API->>Redis: 좌석 상태 조회 (seat:status)
        alt 상태 == AVAILABLE
            API->>Redis: HOLD 상태 저장 (TTL 5분)
            API->>Redis: HOLD Token 발급
            API->>User: 성공 (Hold Token 반환)
        else 이미 선점됨
            API->>User: 실패 (Already Reserved)
        end
        API->>Redis: 락 해제
    else 락 획득 실패
        API->>User: 실패 (System Busy)
    end

    Note over User, DB: Step 2: 결제 및 예매 확정
    User->>API: 결제 요청 (Hold Token, Payment Info)
    API->>API: Hold Token 검증

    API->>Redis: 상태 변경 (HOLD -> PAYMENT_PENDING)

    API->>PG: 결제 승인 요청
    alt 결제 성공
        API->>DB: 트랜잭션 시작
        API->>DB: 예매 정보(Reservation) 저장
        API->>DB: 결제 정보(Payment) 저장
        API->>DB: 좌석 상태(ScreeningSeat) RESERVED 업데이트
        API->>DB: 트랜잭션 커밋

        par Async Tasks
            API->>Redis: HOLD 키 삭제 (Clean up)
            API->>Redis: 캐시 갱신 / WebSocket Push
        end

        API->>User: 예매 완료 응답
    else 결제 실패
        API->>Redis: 상태 복구 (PAYMENT_PENDING -> AVAILABLE)
        API->>User: 결제 실패 응답
    end
```

## 4. 패키지 구조 (DDD)

- `domain.member`: 회원, 인증(JWT)
- `domain.movie`: 영화 정보
- `domain.theater`: 극장, 상영관
- `domain.screening`: **[Aggregate Root]** 상영 스케줄, 좌석 상태 관리
- `domain.reservation`: 예매 생성, 취소
- `domain.payment`: 결제 처리, 검증
- `global`: 예외 처리, 설정, 유틸리티
