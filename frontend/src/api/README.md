# API 클라이언트 및 서비스

모든 API 호출 관련 파일입니다.

## 개요

프로젝트의 모든 API 호출은 `@/api` 폴더에서 관리됩니다.  
Axios 인스턴스를 기반으로 하며, 인증 토큰 자동 추가, 에러 처리 등이 구현되어 있습니다.

## Axios 인스턴스

### axiosInstance

설정된 Axios 인스턴스로, 모든 API 호출에 사용됩니다.

**특징**:
- Base URL: `VITE_API_BASE_URL` 환경변수 또는 `http://localhost:8080/api`
- 자동 Authorization 헤더 추가 (Bearer 토큰)
- 401 Unauthorized 시 자동 리다이렉트 처리
- 응답 인터셉터: 에러 응답 자동 처리

**Import**:
```typescript
import { axiosInstance } from '@/api/axiosInstance';
```

---

## 도메인별 API 모듈

### authApi - 인증 관련 API

회원가입, 로그인, 로그아웃 등 인증 관련 API

**엔드포인트**:

#### `authApi.login(body: LoginRequest)`
- **Method**: POST
- **URL**: `/members/login`
- **설명**: 로그인 (Hybrid Encryption 사용)
- **요청**: `{ loginId: string, password: string }`
- **응답**: `{ accessToken: string }` (Refresh Token은 HttpOnly Cookie)

#### `authApi.signup(body: SignUpRequest)`
- **Method**: POST
- **URL**: `/members/signup`
- **설명**: 회원가입 (Hybrid Encryption 사용)
- **요청**: `{ loginId: string, password: string, name: string, email: string, phone: string }`
- **응답**: `number` (생성된 회원 ID)

#### `authApi.logout()`
- **Method**: POST
- **URL**: `/members/logout`
- **설명**: 로그아웃 (Refresh Token 쿠키 삭제)

**사용 예시**:
```typescript
import { authApi } from '@/api/auth';

// 로그인
const response = await authApi.login({
  loginId: 'user@example.com',
  password: 'myPassword123'
});
console.log(response.accessToken);

// 회원가입
const memberId = await authApi.signup({
  loginId: 'user@example.com',
  password: 'myPassword123',
  name: '홍길동',
  email: 'user@example.com',
  phone: '010-1234-5678'
});
```

---

### moviesApi - 영화 API

영화 목록 조회, 영화 상세 정보 조회

**엔드포인트**:

#### `moviesApi.getMovies(params?: PaginationParams)`
- **Method**: GET
- **URL**: `/movies`
- **설명**: 영화 목록 조회 (페이징)
- **요청**: `{ page?: number, size?: number }`
- **응답**: `SpringPage<Movie>`

#### `moviesApi.getMovie(movieId: number)`
- **Method**: GET
- **URL**: `/movies/{movieId}`
- **설명**: 영화 상세 정보 조회
- **응답**: `Movie`

**사용 예시**:
```typescript
import { moviesApi } from '@/api/movies';

// 영화 목록 조회
const response = await moviesApi.getMovies({ page: 0, size: 20 });
console.log(response.data.content); // Movie[]

// 영화 상세 조회
const movie = await moviesApi.getMovie(123);
console.log(movie.data); // Movie
```

---

### screeningsApi - 상영 스케줄 API

상영 스케줄 조회

**엔드포인트**:

#### `screeningsApi.getScreenings(params?: PaginationParams)`
- **Method**: GET
- **URL**: `/screenings`
- **설명**: 전체 상영 스케줄 조회 (페이징)
- **요청**: `{ page?: number, size?: number }`
- **응답**: `SpringPage<Screening>`

#### `screeningsApi.getScreeningsByMovie(movieId: number)`
- **Method**: GET
- **URL**: `/screenings/by-movie`
- **설명**: 특정 영화의 상영 스케줄 조회
- **요청**: `{ movieId: number }`
- **응답**: `Screening[]`

#### `screeningsApi.getScreening(screeningId: number)`
- **Method**: GET
- **URL**: `/screenings/{screeningId}`
- **설명**: 특정 상영 스케줄 조회
- **응답**: `Screening`

**사용 예시**:
```typescript
import { screeningsApi } from '@/api/movies';

// 특정 영화의 상영 스케줄 조회
const screenings = await screeningsApi.getScreeningsByMovie(123);
console.log(screenings.data); // Screening[]
```

---

### seatsApi - 좌석 API

좌석 배치 조회, 좌석 HOLD, HOLD 해제

**엔드포인트**:

#### `seatsApi.getSeatLayout(screeningId: number)`
- **Method**: GET
- **URL**: `/screenings/{screeningId}/seats`
- **설명**: 좌석 배치 및 상태 조회 (Redis 캐시, DB Fallback)
- **응답**: `SeatLayoutResponse`

#### `seatsApi.holdSeat(screeningId: number, seatId: number)`
- **Method**: POST
- **URL**: `/screenings/{screeningId}/seats/{seatId}/hold`
- **설명**: 좌석 HOLD (인증 필요)
- **응답**: `SeatHoldResponse`

#### `seatsApi.releaseHold(body: SeatReleaseRequest)`
- **Method**: POST
- **URL**: `/screenings/holds/release`
- **설명**: 좌석 HOLD 해제
- **요청**: `{ screeningId: number, seatIds: number[] }`

**사용 예시**:
```typescript
import { seatsApi } from '@/api/seats';

// 좌석 배치 조회
const layout = await seatsApi.getSeatLayout(123);
console.log(layout.data.seats); // SeatStatusItem[]

// 좌석 HOLD
const holdResult = await seatsApi.holdSeat(123, 456);
console.log(holdResult.data.holdExpireAt); // ISO 8601 날짜 문자열

// 좌석 HOLD 해제
await seatsApi.releaseHold({ screeningId: 123, seatIds: [456] });
```

---

### reservationsApi - 예매 API

예매 생성, 내 예매 조회, 예매 취소

**엔드포인트**:

#### `reservationsApi.createReservation(body: PaymentRequest)`
- **Method**: POST
- **URL**: `/reservations`
- **설명**: 예매 생성 (결제)
- **요청**: `PaymentRequest`
- **응답**: `Reservation`

#### `reservationsApi.getMyReservations()`
- **Method**: GET
- **URL**: `/reservations/my`
- **설명**: 내 예매 목록 조회 (인증 필요)
- **응답**: `Reservation[]`

#### `reservationsApi.cancelReservation(reservationId: number)`
- **Method**: POST
- **URL**: `/reservations/{reservationId}/cancel`
- **설명**: 예매 취소

**사용 예시**:
```typescript
import { reservationsApi } from '@/api/reservations';

// 예매 생성
const reservation = await reservationsApi.createReservation({
  screeningId: 123,
  seatHoldItems: [
    { seatId: 1, holdToken: 'token1' },
    { seatId: 2, holdToken: 'token2' },
    { seatId: 3, holdToken: 'token3' },
  ],
  payMethod: 'CARD',
});

// 내 예매 조회
const myReservations = await reservationsApi.getMyReservations();

// 예매 취소
await reservationsApi.cancelReservation(456);
```

---

### homeApi - 홈 화면 API

홈 화면 데이터 조회

**엔드포인트**:

#### `homeApi.getHomeData()`
- **Method**: GET
- **URL**: `/home`
- **설명**: 홈 화면 데이터 조회 (인기 영화, 최신 상영 등)
- **응답**: `HomeData`

---

### adminMoviesApi - 관리자 영화 API

영화 생성, 수정, 삭제 (관리자 전용)

**엔드포인트**:
- `adminMoviesApi.getMovies(params)`: 영화 목록 조회
- `adminMoviesApi.createMovie(body)`: 영화 생성
- `adminMoviesApi.updateMovie(id, body)`: 영화 수정
- `adminMoviesApi.deleteMovie(id)`: 영화 삭제

---

### adminTheatersApi - 관리자 상영관 API

상영관 생성, 수정, 삭제 (관리자 전용)

---

### adminScreensApi - 관리자 스크린 API

스크린 생성, 수정, 삭제 (관리자 전용)

---

### adminScreeningsApi - 관리자 상영 스케줄 API

상영 스케줄 생성, 수정, 삭제 (관리자 전용)

---

### adminSeatsApi - 관리자 좌석 API

좌석 생성, 수정, 상태 변경 (관리자 전용)

---

## Import 경로

```typescript
// 개별 API 모듈
import { authApi } from '@/api/auth';
import { moviesApi, screeningsApi } from '@/api/movies';
import { seatsApi } from '@/api/seats';
import { reservationsApi } from '@/api/reservations';
import { homeApi } from '@/api/home';
import {
  adminMoviesApi,
  adminTheatersApi,
  adminScreensApi,
  adminScreeningsApi,
  adminSeatsApi
} from '@/api/admin';

// Axios 인스턴스
import { axiosInstance } from '@/api/axiosInstance';
```

또는 `@/api` 인덱스에서 일괄 import:

```typescript
import {
  axiosInstance,
  authApi,
  moviesApi,
  screeningsApi,
  seatsApi,
  reservationsApi,
  homeApi,
  adminMoviesApi,
  adminTheatersApi,
  adminScreensApi,
  adminScreeningsApi,
  adminSeatsApi
} from '@/api';
```

## 공통 응답 타입

API 응답은 다음과 같은 공통 구조를 따릅니다:

```typescript
// @/types/api.types
interface ApiResponseBody<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface SpringPage<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
```

## 에러 처리

API 에러는 `@/utils/errorHandler`를 통해 처리됩니다:

```typescript
import { getErrorMessage } from '@/utils/errorHandler';

try {
  await moviesApi.getMovies();
} catch (error) {
  const message = getErrorMessage(error);
  console.error(message);
}
```

## 관련 파일

- `@/api/axiosInstance.ts`: Axios 인스턴스 설정
- `@/types/api.types`: API 공통 타입 정의
- `@/utils/errorHandler`: API 에러 처리 유틸리티
- `@/utils/hybridEncryption`: 로그인/회원가입 암호화
