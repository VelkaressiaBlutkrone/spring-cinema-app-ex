# 커스텀 훅

재사용 가능한 React 커스텀 훅 모음입니다.

## 구현된 훅

### useToast

토스트 메시지를 표시하는 훅입니다. `ToastContext`를 사용하여 전역적으로 토스트 메시지를 관리합니다.

**반환값**:
```typescript
interface ToastContextValue {
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}
```

**사용 예시**:
```typescript
import { useToast } from '@/hooks/useToast';

function MyComponent() {
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  
  const handleSuccess = () => {
    showSuccess('예매가 완료되었습니다!');
  };
  
  const handleError = () => {
    showError('예매에 실패했습니다. 다시 시도해주세요.');
  };
  
  const handleInfo = () => {
    showInfo('좌석을 선택해주세요.');
  };
  
  const handleWarning = () => {
    showWarning('선택한 좌석의 HOLD가 곧 만료됩니다.', 5000);
  };
  
  return (
    <div>
      <button onClick={handleSuccess}>성공 메시지</button>
      <button onClick={handleError}>에러 메시지</button>
      <button onClick={handleInfo}>정보 메시지</button>
      <button onClick={handleWarning}>경고 메시지</button>
    </div>
  );
}
```

**필수 조건**:
- `ToastProvider`로 앱을 감싸야 합니다.
- `ToastContainer` 컴포넌트를 앱에 추가해야 합니다.

```typescript
import { ToastProvider, ToastContainer } from '@/components/common/ui';

function App() {
  return (
    <ToastProvider>
      <MyComponent />
      <ToastContainer />
    </ToastProvider>
  );
}
```

---

### useSeatEvents

SSE(Server-Sent Events)를 사용하여 실시간으로 좌석 상태 변경을 구독하는 훅입니다.

**파라미터**:
```typescript
useSeatEvents(
  screeningId: number | null,
  onSeatIdsChanged: (seatIds: number[]) => void
)
```

**사용 예시**:
```typescript
import { useSeatEvents } from '@/hooks/useSeatEvents';

function BookingPage() {
  const screeningId = 123;
  const [seats, setSeats] = useState<SeatStatusItem[]>([]);
  
  // 좌석 상태가 변경되면 자동으로 refetch
  useSeatEvents(screeningId, (changedSeatIds) => {
    console.log('변경된 좌석 ID:', changedSeatIds);
    // 변경된 좌석만 다시 조회하거나, 전체 좌석 상태를 다시 조회
    refetchSeats();
  });
  
  // ...
}
```

**특징**:
- 특정 상영(screeningId)의 좌석 상태 변경 이벤트를 실시간으로 수신
- 다른 사용자가 좌석을 HOLD/해제하면 자동으로 콜백 호출
- `screeningId`가 `null`이면 구독하지 않음
- 컴포넌트 언마운트 시 자동으로 연결 종료

**SSE 이벤트**:
- 이벤트 타입: `seat-status-changed`
- Payload: `{ eventId: string, screeningId: number, seatIds: number[] }`

---

### useIsAdmin

현재 로그인한 사용자가 관리자(ADMIN) 권한을 가지고 있는지 확인하는 훅입니다.

**반환값**:
```typescript
useIsAdmin(): boolean
```

**사용 예시**:
```typescript
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Navigate } from 'react-router-dom';

function AdminPage() {
  const isAdmin = useIsAdmin();
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div>
      <h1>관리자 페이지</h1>
      {/* 관리자 전용 기능 */}
    </div>
  );
}
```

**특징**:
- `authStore`의 `accessToken`에서 JWT payload를 파싱하여 role 확인
- `role === 'ADMIN'`인 경우 `true` 반환
- 비로그인 상태이거나 ADMIN이 아닌 경우 `false` 반환

**내부 동작**:
```typescript
// useIsAdmin 내부 구현
import { useAuthStore } from '@/stores/authStore';
import { isAdminFromToken } from '@/utils/jwt';

export function useIsAdmin(): boolean {
  const accessToken = useAuthStore((s) => s.accessToken);
  return isAdminFromToken(accessToken);
}
```

---

## 예정 훅

향후 개발 예정인 커스텀 훅:

### useAuth (예정)

인증 상태와 로그인/로그아웃 기능을 제공하는 훅

```typescript
// 예정
interface UseAuthReturn {
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => void;
}
```

---

### usePagination (예정)

페이지네이션 상태 관리 훅

```typescript
// 예정
interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}
```

---

## Import 경로

```typescript
import { useToast } from '@/hooks/useToast';
import { useSeatEvents } from '@/hooks/useSeatEvents';
import { useIsAdmin } from '@/hooks/useIsAdmin';
```

또는 `@/hooks` 인덱스에서 일괄 import:

```typescript
import { useToast, useSeatEvents, useIsAdmin } from '@/hooks';
```

## 관련 파일

- `@/hooks/useToast.ts`: 토스트 메시지 훅
- `@/hooks/useSeatEvents.ts`: SSE 좌석 상태 구독 훅
- `@/hooks/useIsAdmin.ts`: 관리자 권한 확인 훅
- `@/components/common/ui/ToastContext.tsx`: Toast 컨텍스트
- `@/stores/authStore.ts`: 인증 상태 저장소
- `@/utils/jwt.ts`: JWT 파싱 유틸리티
