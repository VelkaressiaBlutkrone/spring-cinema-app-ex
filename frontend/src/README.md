# 영화관 예매 시스템 Frontend 프로젝트 구조

## 폴더 구조

```text
src/
  api/                    # API 클라이언트 및 서비스
    axiosInstance.ts      # Axios 인스턴스 설정

  components/             # React 컴포넌트
    auth/                 # 인증 관련 컴포넌트 (LoginForm, ProtectedRoute 등)
    booking/              # 예매 관련 컴포넌트 (SeatMap, SeatTimer 등)
    movie/                # 영화 관련 컴포넌트 (MovieCard, TimeTable 등)
    payment/              # 결제 관련 컴포넌트 (PaymentSummary 등)
    common/               # 공통 UI 컴포넌트 (Button, Modal, Toast 등)
      ui/                 # UI 컴포넌트

  hooks/                  # 커스텀 훅
    useToast.ts           # 토스트 메시지 훅

  types/                  # TypeScript 타입 정의
    common.types.ts        # 공통 타입

  utils/                  # 유틸리티 함수
    dateUtils.ts          # 날짜 관련 유틸리티
    errorHandler.ts       # 에러 처리 유틸리티
    formatters.ts         # 포맷팅 유틸리티
```

## Import 경로 가이드

### 공통 UI 컴포넌트

```typescript
import { LoadingSpinner, Modal } from '@/components/common';
```

### 유틸리티 함수

```typescript
import { formatDate, getErrorMessage } from '@/utils';
```

### 커스텀 훅

```typescript
import { useToast } from '@/hooks';
```

### API 클라이언트

```typescript
import { axiosInstance } from '@/api';
```

### 타입 정의

```typescript
import type { ApiResponse } from '@/types';
```

## 도메인별 컴포넌트 추가 가이드

각 도메인 폴더(auth, booking, movie, payment)에 컴포넌트를 추가할 때는:

1. 해당 도메인 폴더에 컴포넌트 파일 생성
2. 필요시 index.ts 파일로 export
3. 도메인별 API는 src/api/ 폴더에 추가
4. 도메인별 타입은 src/types/ 폴더에 추가
