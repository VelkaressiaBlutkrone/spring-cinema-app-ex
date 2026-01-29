# 타입 정의

TypeScript 타입 정의 파일 모음입니다.

## 개요

프로젝트의 모든 타입 정의는 `@/types` 폴더에서 관리됩니다.  
백엔드 API 응답과 일치하도록 설계되었으며, 도메인별로 분리되어 있습니다.

## 타입 파일 목록

### common.types.ts

공통으로 사용되는 타입 정의

**주요 타입**:
```typescript
// 페이지네이션 요청 파라미터
interface PaginationParams {
  page?: number;
  size?: number;
}

// 정렬 파라미터
interface SortParams {
  sort?: string;
  direction?: 'ASC' | 'DESC';
}
```

---

### movie.types.ts

영화 및 상영 스케줄 관련 타입

**주요 타입**:

```typescript
// 영화 상태
type MovieStatus = 'RELEASED' | 'UPCOMING' | 'ENDED' | 'DELETED';

// 영화 정보
interface Movie {
  id: number;
  title: string;
  description?: string;
  runningTime?: number;
  rating?: string;
  genre?: string;
  director?: string;
  actors?: string;
  posterUrl?: string;
  releaseDate?: string;
  status: MovieStatus;
  createdAt?: string;
  updatedAt?: string;
}

// 상영 상태
type ScreeningStatus = 'SCHEDULED' | 'NOW_SHOWING' | 'ONGOING' | 'ENDED' | 'CANCELLED';

// 상영 정보
interface Screening {
  id: number;
  movieId: number;
  movieTitle: string;
  screenId: number;
  screenName: string;
  theaterName?: string;
  startTime: string;  // ISO 8601
  endTime: string;    // ISO 8601
  status: ScreeningStatus;
  createdAt?: string;
  updatedAt?: string;
}
```

**상수**:
```typescript
// 상영 상태 라벨 (한글 표시용)
const SCREENING_STATUS_LABEL: Record<string, string> = {
  SCHEDULED: '상영 예정',
  NOW_SHOWING: '상영 중',
  ONGOING: '상영 중',
  ENDED: '상영 종료',
  CANCELLED: '상영 취소',
};
```

**사용 예시**:
```typescript
import { SCREENING_STATUS_LABEL } from '@/types/movie.types';

const statusText = SCREENING_STATUS_LABEL[screening.status]; // "상영 중"
```

---

### auth.types.ts

인증 관련 타입

**주요 타입**:
```typescript
// 로그인 요청
interface LoginRequest {
  loginId: string;
  password: string;
}

// 회원가입 요청
interface SignUpRequest {
  loginId: string;
  password: string;
  name: string;
  email: string;
  phone: string;
}

// JWT 역할
type UserRole = 'USER' | 'ADMIN';
```

---

### api.types.ts

API 공통 응답 타입

**주요 타입**:
```typescript
// API 공통 응답 래퍼
interface ApiResponseBody<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Spring Page 응답
interface SpringPage<T> {
  content: T[];           // 데이터 배열
  totalPages: number;     // 전체 페이지 수
  totalElements: number;  // 전체 항목 수
  size: number;           // 페이지 크기
  number: number;         // 현재 페이지 번호 (0부터 시작)
  first: boolean;         // 첫 페이지 여부
  last: boolean;          // 마지막 페이지 여부
}
```

**사용 예시**:
```typescript
import { ApiResponseBody, SpringPage } from '@/types/api.types';
import { Movie } from '@/types/movie.types';

// API 응답 타입
type MoviesResponse = ApiResponseBody<SpringPage<Movie>>;

// 사용
const response: MoviesResponse = await moviesApi.getMovies();
const movies = response.data.content;
```

---

### seat.types.ts

좌석 및 HOLD 관련 타입

**주요 타입**:
```typescript
// 좌석 상태
type SeatStatus =
  | 'AVAILABLE'      // 예매 가능
  | 'HOLD'           // 임시 선택 (HOLD)
  | 'PAYMENT_PENDING' // 결제 대기
  | 'RESERVED'       // 예매 완료
  | 'CANCELLED'      // 예매 취소
  | 'BLOCKED'        // 운영 차단
  | 'DISABLED';      // 비활성화

// 좌석 상태 정보
interface SeatStatusItem {
  seatId: number;
  status: SeatStatus;
  rowLabel: string;   // 행 라벨 (A, B, C, ...)
  seatNo: number;     // 좌석 번호
  holdExpireAt?: string; // HOLD 만료 시각 (ISO 8601)
}

// 좌석 배치 응답
interface SeatLayoutResponse {
  screeningId: number;
  seats: SeatStatusItem[];
}

// 좌석 HOLD 응답
interface SeatHoldResponse {
  holdToken: string;
  screeningId: number;
  seatId: number;
  holdExpireAt: string; // ISO 8601
  ttlSeconds: number;   // 남은 초
}

// 좌석 HOLD 해제 요청
interface SeatReleaseRequest {
  screeningId: number;
  seatId: number;
  holdToken: string;
}

// SSE 이벤트: 좌석 상태 변경
interface SeatStatusChangedEvent {
  eventId: string;
  screeningId: number;
  seatIds: number[];
}
```

---

### reservation.types.ts

예매 및 결제 관련 타입

**주요 타입**:
```typescript
// 결제 수단
type PaymentMethod = 
  | 'CARD'           // 신용카드
  | 'KAKAO_PAY'      // 카카오페이
  | 'NAVER_PAY'      // 네이버페이
  | 'TOSS'           // 토스
  | 'BANK_TRANSFER'; // 계좌이체

// 좌석 HOLD 정보
interface SeatHoldItem {
  seatId: number;
  holdToken: string;
}

// 결제 요청
interface PaymentRequest {
  screeningId: number;
  seatHoldItems: SeatHoldItem[];
  payMethod: PaymentMethod;
}

// 결제 응답
interface PaymentResponse {
  reservationId: number;
  reservationNo: string;
  screeningId: number;
  totalSeats: number;
  totalAmount: number;
}

// 예매 좌석 정보
interface ReservationSeatItem {
  seatId: number;
  rowLabel: string;
  seatNo: number;
  displayName: string; // "A-1" 형식
  price: number;
}

// 예매 상세 정보
interface ReservationDetailResponse {
  reservationId: number;
  reservationNo: string;
  status: string;
  memberId: number;
  screeningId: number;
  movieTitle: string;
  screenName: string;
  startTime: string; // ISO 8601
  totalSeats: number;
  totalAmount: number;
  seats: ReservationSeatItem[];
  createdAt: string;
}
```

---

### admin.types.ts

관리자 기능 관련 타입 (영화, 상영관, 스크린, 상영 스케줄, 좌석 등)

**주요 타입**:
```typescript
// 영화 생성/수정 요청
interface MovieCreateRequest {
  title: string;
  description?: string;
  runningTime?: number;
  rating?: string;
  genre?: string;
  director?: string;
  actors?: string;
  posterUrl?: string;
  releaseDate?: string;
}

// 상영관 생성/수정 요청
interface TheaterCreateRequest {
  name: string;
  location?: string;
}

// 스크린 생성/수정 요청
interface ScreenCreateRequest {
  theaterId: number;
  name: string;
  totalSeats: number;
}

// 상영 스케줄 생성 요청
interface ScreeningCreateRequest {
  movieId: number;
  screenId: number;
  startTime: string; // ISO 8601
}

// 좌석 생성 요청
interface SeatCreateRequest {
  screenId: number;
  rowLabel: string;
  seatNo: number;
  seatType?: string;
}
```

---

## Import 경로

개별 타입 import:
```typescript
import type { Movie, Screening } from '@/types/movie.types';
import type { SeatStatusItem, SeatHoldResponse } from '@/types/seat.types';
import type { PaymentMethod, PaymentRequest } from '@/types/reservation.types';
```

또는 `@/types` 인덱스에서 일괄 import:
```typescript
import type {
  Movie,
  Screening,
  SeatStatusItem,
  PaymentMethod,
  ApiResponseBody,
  SpringPage,
} from '@/types';
```

## 타입 네이밍 컨벤션

- **Request**: API 요청 타입 (예: `LoginRequest`, `PaymentRequest`)
- **Response**: API 응답 타입 (예: `SeatHoldResponse`, `PaymentResponse`)
- **Item**: 목록 항목 타입 (예: `SeatStatusItem`, `ReservationSeatItem`)
- **Params**: 파라미터 타입 (예: `PaginationParams`, `SortParams`)
- **Status**: 상태 열거형 (예: `MovieStatus`, `ScreeningStatus`, `SeatStatus`)
- **Method**: 방법 열거형 (예: `PaymentMethod`)

## 관련 파일

- `@/types/index.ts`: 모든 타입 재export
- `@/api/`: API 호출 시 타입 사용
- `@/components/`: 컴포넌트 Props 타입 정의
- `@/pages/`: 페이지 레벨 타입 사용
