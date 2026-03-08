# React 프론트엔드 리팩토링 계획

## 개요

- **프레임워크**: React 19.2 + TypeScript 5.7 + Vite 7.3
- **상태관리**: Zustand (auth), React Query (서버 상태), 로컬 useState
- **스타일링**: Tailwind CSS 4.1 + 커스텀 CSS 변수 (cinema + admin 테마)
- **실시간**: EventSource (SSE) + 자동 재연결
- **차트**: Recharts (관리자 대시보드)

## 전체 평가 (리팩토링 후)

| 카테고리 | 상태 | 비고 |
|---------|------|------|
| 프로젝트 구조 | ✅ 양호 | 명확한 디렉토리 분리 |
| 컴포넌트 설계 | ✅ 양호 | 대형 페이지 분리 완료, 커스텀 훅 추출 |
| 상태 관리 | ✅ 양호 | React Query 도입 (HomePage, MoviesPage, ReservationsPage) |
| 타입 안전성 | ✅ 양호 | strict 모드, 타입 정의 일관적 |
| 성능 | ✅ 양호 | 코드 스플리팅, 메모이제이션, SSE 재연결 |
| 코드 중복 | ✅ 양호 | useCrudPage 훅으로 관리자 CRUD 통합 |
| 에러 처리 | ✅ 양호 | 일관된 유틸리티, auth refresh 동작 |
| 테스트 | ❌ 없음 | 테스트 파일 미발견 (별도 계획) |

---

## Phase 1: 높은 우선순위 (구조적 개선) ✅ 완료

### 1.1 관리자 CRUD 페이지 중복 제거 ✅

- `hooks/useCrudPage.ts` 공통 CRUD 로직 커스텀 훅 생성
- AdminMoviesPage, AdminTheatersPage, AdminScreensPage, AdminScreeningsPage에 적용
- AdminSeatsPage: 고유 패턴(이중 모달)으로 별도 유지
- AdminReservationsPage: 읽기 전용 페이지로 CRUD 패턴 비적합

### 1.2 라우트 가드 구현 ✅

- `components/auth/ProtectedRoute.tsx` 생성 (인증 필수 경로 가드)
- `components/auth/AdminRoute.tsx` 생성 (관리자 전용 경로 가드)
- `routes/index.tsx`에 가드 적용 완료
- 각 페이지의 수동 인증 검사 useEffect 제거

### 1.3 대형 페이지 컴포넌트 분리 ✅

| 페이지 | 변경 내용 |
|--------|----------|
| MyPage.tsx | `ProfileTab`, `HoldsTab`, `ReservationsTab`으로 분리 (361줄 → 57줄) |
| SeatSelectPage.tsx | `useSeatHoldLogic` 훅 추출 (323줄 → 146줄) |
| PaymentPage.tsx | `PaymentSuccess` 컴포넌트 분리, 인증 검사 제거 |

### 1.4 useFetch 커스텀 훅 도입 ✅

- `hooks/useFetch.ts` 생성 (범용 데이터 페칭 훅)
- Phase 2.1에서 React Query로 대체된 페이지에서는 미사용, 단순 페이지용으로 유지

---

## Phase 2: 중간 우선순위 (품질 향상) ✅ 완료

### 2.1 React Query 도입 ✅

- `lib/queryClient.ts` 생성 (staleTime: 30s, retry: 1)
- `App.tsx`에 `QueryClientProvider` 추가
- 적용 완료:
  - HomePage: stats, upcoming, reservations 3개 useQuery 분리
  - MoviesPage: 영화 목록 useQuery
  - ReservationsPage: 예매 내역 useQuery

### 2.2 메모이제이션 보강 ✅

| 파일 | 수정 내용 |
|------|----------|
| NavigationBar.tsx | `loginId` → `useMemo`, `handleLogout` → `useCallback` |
| useSeatHoldLogic.ts | `minHoldExpireAt` → `useMemo`, `myHoldSeatIds` → `useMemo` |

### 2.3 커스텀 훅 추가 ✅

| 훅 | 상태 | 비고 |
|----|------|------|
| `useCrudPage` | ✅ 생성 | 관리자 CRUD 페이지 공통 로직 |
| `useSeatHoldLogic` | ✅ 생성 | 좌석 HOLD/해제 로직 |
| `useFetch` | ✅ 생성 | 범용 데이터 페칭 |
| `useDebounce` | ✅ 생성 | 입력 디바운스 |
| `usePagination` | — | useCrudPage에 통합 |
| `useFilter` | — | AdminReservationsPage에 ref 패턴으로 최적화 |

### 2.4 관리자/사용자 테마 통합 ✅

- `index.css`에 관리자 테마 CSS 변수 11개 정의 (`cinema-admin-*`)
- 모든 관리자 페이지 (Movies, Theaters, Screens, Screenings, Seats, Reservations, Payments)에 적용
- 하드코딩된 gray/indigo/red 색상 → cinema-admin 시맨틱 토큰으로 교체

---

## Phase 3: 낮은 우선순위 (최적화) ✅ 완료

### 3.1 코드 스플리팅 (Lazy Loading) ✅

- 관리자 페이지 9개 + 404 페이지 lazy import 적용
- `Suspense` + `LoadingSpinner` 폴백
- **메인 번들 905KB → 421KB (53% 감소)**

### 3.2 인라인 스타일 → Tailwind 통합 ✅

| 파일 | 수정 내용 |
|------|----------|
| NavigationBar.tsx | `style={{ backgroundColor }}` → `bg-[rgba(18,18,18,0.85)]` |
| NavigationBar.tsx | `style={{ boxShadow }}` → `shadow-[...]` Tailwind arbitrary value |
| SeatMap.tsx | SVG fill 속성으로 JS 객체 유지 (적합) |

### 3.3 SSE 재연결 로직 추가 ✅

- `useSeatEvents.ts`에 지수 백오프 자동 재연결 구현
- 기본 1초 → 최대 30초, 성공 연결 시 카운터 리셋

### 3.4 API 타임아웃 조정 ✅

- `axiosInstance.ts` 타임아웃: 5000ms → 10000ms

### 3.5 404 페이지 구현 ✅

- `pages/NotFoundPage.tsx` 생성 (GlassCard + NeonButton 활용)
- `routes/index.tsx` catch-all 경로에 적용 (기존 무음 리디렉션 대체)

### 3.6 Dead Code 제거 ✅

- `authStore.ts`의 미사용 `syncTokensToStorage` 함수 삭제
- `stores/index.ts`에서 해당 export 제거

---

## 리렌더링 최적화 포인트

| 파일 | 상태 | 수정 내용 |
|------|------|----------|
| SeatSelectPage → useSeatHoldLogic | ✅ | `useMemo`로 minHoldExpireAt, myHoldSeatIds 메모이제이션 |
| MyPage | ✅ | 탭 컴포넌트 분리로 독립 렌더링 |
| AdminReservationsPage | ✅ | ref 패턴으로 필터 변경 시 자동 호출 방지 |

---

## 테스트 전략 (신규, 미구현)

현재 테스트 파일이 없으므로 단계적 도입 권장:

| 단계 | 범위 | 도구 |
|------|------|------|
| 1단계 | 커스텀 훅 단위 테스트 | Vitest + React Testing Library |
| 2단계 | 주요 컴포넌트 렌더링 테스트 | React Testing Library |
| 3단계 | API 통합 테스트 | MSW (Mock Service Worker) |
| 4단계 | E2E 테스트 | Playwright 또는 Cypress |
