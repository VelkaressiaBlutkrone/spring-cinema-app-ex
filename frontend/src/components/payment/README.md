# 결제 관련 컴포넌트

결제 정보 입력, 결제 수단 선택 등 결제 과정에서 사용되는 컴포넌트입니다.

## 개요

현재 결제 관련 컴포넌트는 페이지 레벨에서 직접 구현되어 있으며, 향후 재사용 가능한 컴포넌트로 분리할 예정입니다.  
결제 처리는 `@/api/reservations` API를 통해 이루어집니다.

## 예정 컴포넌트

### PaymentSummary

결제 금액, 선택한 좌석 정보 등을 요약하여 표시하는 컴포넌트

**Props (예정)**:
```typescript
interface PaymentSummaryProps {
  screening: Screening;
  seats: SeatStatusItem[];
  totalAmount: number;
}
```

**사용 예시**:
```typescript
import { PaymentSummary } from '@/components/payment';

function PaymentPage() {
  return (
    <PaymentSummary
      screening={screening}
      seats={selectedSeats}
      totalAmount={screening.basePrice * selectedSeats.length}
    />
  );
}
```

---

### PaymentForm

결제 정보를 입력하는 폼 컴포넌트

**Props (예정)**:
```typescript
interface PaymentFormProps {
  onSubmit: (data: PaymentRequest) => void;
  loading?: boolean;
}
```

---

### PaymentMethodSelector

결제 수단을 선택하는 컴포넌트

**Props (예정)**:
```typescript
interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
}
```

**사용 예시**:
```typescript
import { PaymentMethodSelector } from '@/components/payment';
import type { PaymentMethod } from '@/types/reservation.types';

function PaymentPage() {
  const [method, setMethod] = useState<PaymentMethod>('CARD');
  
  return (
    <PaymentMethodSelector
      selectedMethod={method}
      onMethodChange={setMethod}
    />
  );
}
```

---

### PaymentComplete

결제 완료 화면을 표시하는 컴포넌트

**Props (예정)**:
```typescript
interface PaymentCompleteProps {
  reservation: Reservation;
  onConfirm?: () => void;
}
```

## 결제 수단 (PaymentMethod)

프로젝트에서 지원하는 결제 수단은 다음과 같습니다:

```typescript
// @/types/reservation.types
type PaymentMethod = 
  | 'CARD'           // 신용카드
  | 'KAKAO_PAY'      // 카카오페이
  | 'NAVER_PAY'      // 네이버페이
  | 'TOSS'           // 토스
  | 'BANK_TRANSFER'; // 계좌이체
```

## 결제 관련 타입

결제 관련 타입은 `@/types/reservation.types`에 정의되어 있습니다:

```typescript
// @/types/reservation.types
interface PaymentRequest {
  screeningId: number;
  seatIds: number[];
  paymentMethod: PaymentMethod;
  // ... 기타 필드
}

interface Reservation {
  id: number;
  userId: number;
  screeningId: number;
  movieTitle: string;
  screenName: string;
  startTime: string;
  seatIds: number[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: ReservationStatus;
  createdAt: string;
}

type ReservationStatus = 
  | 'PENDING'    // 결제 대기
  | 'CONFIRMED'  // 예매 완료
  | 'CANCELLED'; // 취소됨
```

## 결제 프로세스

일반적인 결제 프로세스는 다음과 같습니다:

```typescript
import { reservationsApi } from '@/api/reservations';
import type { PaymentRequest } from '@/types/reservation.types';

async function processPayment() {
  const paymentData: PaymentRequest = {
    screeningId: 123,
    seatIds: [1, 2, 3],
    paymentMethod: 'CARD',
    // ... 기타 필드
  };
  
  try {
    // 결제 요청
    const reservation = await reservationsApi.createReservation(paymentData);
    
    // 결제 완료 처리
    console.log('예매 완료:', reservation);
    navigate('/reservations');
  } catch (error) {
    // 결제 실패 처리
    console.error('결제 실패:', error);
  }
}
```

## PaymentPage 연동

결제 페이지는 다음과 같은 흐름으로 동작합니다:

1. **좌석 선택 완료** → 결제 페이지로 이동
2. **결제 정보 입력** → PaymentForm 컴포넌트
3. **결제 수단 선택** → PaymentMethodSelector 컴포넌트
4. **결제 요약 확인** → PaymentSummary 컴포넌트
5. **결제 실행** → API 호출
6. **결제 완료** → PaymentComplete 컴포넌트 또는 예매 내역 페이지로 이동

## API 연동

결제 관련 API는 `@/api/reservations`를 통해 호출합니다:

```typescript
import { reservationsApi } from '@/api/reservations';

// 예매 생성 (결제)
const reservation = await reservationsApi.createReservation(paymentRequest);

// 내 예매 목록 조회
const myReservations = await reservationsApi.getMyReservations();

// 예매 취소
await reservationsApi.cancelReservation(reservationId);
```

## Cinema Theme 스타일링

결제 컴포넌트는 프로젝트의 Cinema/Neon 테마를 따릅니다:

- **GlassCard**: 결제 정보를 담는 반투명 카드
- **NeonButton**: 결제하기 버튼 (Primary 색상, 네온 글로우 효과)
- **보안 표시**: 자물쇠 아이콘, SSL 보안 텍스트 등

## 관련 파일

- `@/types/reservation.types`: 예매 및 결제 타입 정의
- `@/api/reservations`: 예매/결제 API 호출
- `@/components/common/GlassCard`: Glassmorphism 카드
- `@/components/common/NeonButton`: Neon 효과 버튼
