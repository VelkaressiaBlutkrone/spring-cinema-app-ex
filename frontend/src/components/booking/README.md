# 예매 관련 컴포넌트

좌석 선택, HOLD 타이머 등 예매 과정에서 사용되는 컴포넌트입니다.

## 구현된 컴포넌트

### SeatMap

SVG 기반 좌석 맵 컴포넌트로, 좌석 상태를 시각적으로 표시하고 클릭 이벤트를 처리합니다.

#### Props

```typescript
interface SeatMapProps {
  /** 전체 좌석 목록 (상태 정보 포함) */
  seats: SeatStatusItem[];
  /** 내가 HOLD한 좌석 ID 집합 (이 좌석들은 클릭 시 해제) */
  myHoldSeatIds: Set<number>;
  /** 좌석 클릭 시 호출되는 콜백 */
  onSeatClick: (seat: SeatStatusItem) => void;
  /** 좌석 선택 비활성화 여부 */
  disabled?: boolean;
}
```

#### 좌석 상태별 색상

- **AVAILABLE** (녹색): 예매 가능한 좌석
- **HOLD** (파란색): 내가 선택한 좌석
- **HOLD** (주황색): 다른 사용자가 선택한 좌석
- **RESERVED** (빨간색): 예매 완료된 좌석
- **PAYMENT_PENDING** (노란색): 결제 대기 중
- **BLOCKED** (회색): 운영 차단된 좌석
- **DISABLED** (연회색): 비활성화된 좌석

#### 사용 예시

```typescript
import { SeatMap } from '@/components/booking';
import type { SeatStatusItem } from '@/types/seat.types';

function BookingPage() {
  const [seats, setSeats] = useState<SeatStatusItem[]>([]);
  const [myHolds, setMyHolds] = useState<Set<number>>(new Set());
  
  const handleSeatClick = (seat: SeatStatusItem) => {
    if (seat.status === 'AVAILABLE') {
      // 좌석 HOLD 로직
      holdSeat(seat.seatId);
    } else if (myHolds.has(seat.seatId)) {
      // 내 HOLD 좌석 해제 로직
      releaseSeat(seat.seatId);
    }
  };
  
  return (
    <SeatMap
      seats={seats}
      myHoldSeatIds={myHolds}
      onSeatClick={handleSeatClick}
    />
  );
}
```

#### 특징

- SVG 기반 렌더링으로 확대/축소에도 선명한 화질 유지
- 행(rowLabel) 기준으로 자동 그룹핑 및 정렬
- 좌석 번호(seatNo) 표시
- 클릭 가능한 좌석에 hover 효과 적용
- Cinema theme 스타일링 (glassmorphism)

---

### HoldTimer

좌석 HOLD 만료까지 남은 시간을 카운트다운하는 타이머 컴포넌트입니다.

#### Props

```typescript
interface HoldTimerProps {
  /** HOLD 만료 시각 (ISO 8601 문자열) */
  holdExpireAt: string | undefined;
  /** 만료 시 호출되는 콜백 */
  onExpire?: () => void;
  /** 추가 CSS 클래스 */
  className?: string;
}
```

#### 사용 예시

```typescript
import { HoldTimer } from '@/components/booking';

function BookingPage() {
  const holdExpireAt = '2026-01-29T08:30:00Z'; // 서버에서 받은 만료 시각
  
  const handleExpire = () => {
    // HOLD 만료 시 처리 로직 (예: 좌석 해제, 알림 표시)
    alert('좌석 선택 시간이 만료되었습니다.');
  };
  
  return (
    <HoldTimer
      holdExpireAt={holdExpireAt}
      onExpire={handleExpire}
      className="mb-4"
    />
  );
}
```

#### 특징

- 실시간 카운트다운 (MM:SS 형식)
- 남은 시간이 60초 이하일 때 경고 스타일 (빨간색 네온 효과)
- 만료 시 자동으로 `onExpire` 콜백 호출
- Cinema theme 스타일링 (glassmorphism, neon glow)
- holdExpireAt이 없거나 이미 만료된 경우 렌더링하지 않음

---

## 실시간 좌석 상태 업데이트

좌석 상태는 SSE(Server-Sent Events)를 통해 실시간으로 업데이트됩니다:

```typescript
import { useSeatEvents } from '@/hooks/useSeatEvents';

function BookingPage() {
  const screeningId = 123;
  
  useSeatEvents(screeningId, (changedSeatIds) => {
    // 변경된 좌석 ID 목록을 받아서 상태 업데이트
    refetchSeats(changedSeatIds);
  });
  
  // ...
}
```

자세한 내용은 `@/hooks/useSeatEvents`를 참조하세요.

## 예정 컴포넌트

- **SeatSelector**: 좌석 개수 선택 컴포넌트
- **BookingSummary**: 예매 요약 (선택한 좌석, 금액 등)

## 관련 타입

```typescript
// @/types/seat.types
interface SeatStatusItem {
  seatId: number;
  rowLabel: string;
  seatNo: number;
  status: 'AVAILABLE' | 'HOLD' | 'PAYMENT_PENDING' | 'RESERVED' | 'CANCELLED' | 'BLOCKED' | 'DISABLED';
}

interface SeatStatusChangedEvent {
  eventId: string;
  screeningId: number;
  seatIds: number[];
}
```

## 관련 파일

- `@/types/seat.types`: 좌석 관련 타입 정의
- `@/hooks/useSeatEvents`: SSE 실시간 좌석 상태 구독
- `@/api/seats`: 좌석 관련 API 호출
