# 프론트엔드 재사용 모듈 가이드

본 문서는 프론트엔드 프로젝트에서 재사용 가능한 모듈들을 정리한 문서입니다.

## 목차

1. [공통 컴포넌트](#공통-컴포넌트)
2. [유틸리티 함수](#유틸리티-함수)
3. [커스텀 훅](#커스텀-훅)
4. [타입 정의](#타입-정의)

---

## 공통 컴포넌트

### 위치: `src/components/common/`

### 1. Modal

모달 다이얼로그 래퍼 컴포넌트

```typescript
import { Modal } from '@/components/common/Modal';

// Props
interface ModalProps {
  isOpen: boolean;           // 모달 열림 여부
  onClose: () => void;       // 닫기 핸들러
  title?: string;            // 모달 제목 (선택)
  children: ReactNode;       // 모달 내용
  size?: 'sm' | 'md' | 'lg' | 'xl';  // 크기 (기본값: 'md')
}

// 사용 예시
<Modal isOpen={isOpen} onClose={handleClose} title="상품 등록" size="lg">
  <ProductForm />
</Modal>
```

**특징:**

- 열릴 때 body 스크롤 자동 잠금
- ESC 키로 닫기 지원
- 배경 클릭으로 닫기 지원

---

### 2. ConfirmDialog

확인/취소 다이얼로그 컴포넌트

```typescript
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

// Props
interface ConfirmDialogProps {
  isOpen: boolean;           // 다이얼로그 열림 여부
  onClose: () => void;       // 닫기 핸들러
  onConfirm: () => void;     // 확인 핸들러
  message: string;           // 메시지 (필수)
  title?: string;            // 제목 (기본값: '확인')
  confirmText?: string;      // 확인 버튼 텍스트 (기본값: '확인')
  cancelText?: string;       // 취소 버튼 텍스트 (기본값: '취소')
  variant?: 'danger' | 'default';  // 스타일 (기본값: 'default')
}

// 사용 예시
<ConfirmDialog
  isOpen={isDeleteOpen}
  onClose={() => setIsDeleteOpen(false)}
  onConfirm={handleDelete}
  message="정말 삭제하시겠습니까?"
  title="삭제 확인"
  variant="danger"
/>
```

---

### 3. Toast & ToastContainer & useToast

토스트 알림 시스템

```typescript
// 1. App.tsx에서 ToastContainer로 감싸기
import { ToastContainer } from '@/components/common/ToastContainer';

function App() {
  return (
    <ToastContainer>
      <RouterProvider router={router} />
    </ToastContainer>
  );
}

// 2. 컴포넌트에서 useToast 훅 사용
import { useToast } from '@/components/common/useToast';

function MyComponent() {
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess('저장되었습니다.');
    } catch (error) {
      showError('저장에 실패했습니다.');
    }
  };
}
```

**제공 메서드:**

- `showSuccess(message)`: 성공 메시지 (초록색)
- `showError(message)`: 에러 메시지 (빨간색, 5초 표시)
- `showInfo(message)`: 정보 메시지 (파란색)
- `showWarning(message)`: 경고 메시지 (노란색)
- `showToast(message, type, duration)`: 커스텀 토스트

---

### 4. LoadingSpinner

로딩 스피너 컴포넌트

```typescript
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Props
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';  // 크기 (기본값: 'md')
  message?: string;           // 로딩 메시지 (선택)
}

// 사용 예시
{isLoading && <LoadingSpinner size="lg" message="데이터를 불러오는 중..." />}
```

---

### 5. EmptyState

데이터 없음 상태 표시 컴포넌트

```typescript
import { EmptyState } from '@/components/common/EmptyState';

// Props
interface EmptyStateProps {
  title?: string;      // 제목 (기본값: '데이터가 없습니다')
  message?: string;    // 메시지 (기본값: '표시할 데이터가 없습니다.')
  icon?: ReactNode;    // 커스텀 아이콘
  action?: ReactNode;  // 액션 버튼
}

// 사용 예시
{products.length === 0 && (
  <EmptyState
    title="등록된 상품이 없습니다"
    message="첫 상품을 등록해보세요."
    action={<Button onClick={openAddModal}>상품 추가</Button>}
  />
)}
```

---

### 6. Pagination

페이지네이션 컴포넌트

```typescript
import { Pagination } from '@/components/common/Pagination';

// Props
interface PaginationProps {
  currentPage: number;          // 현재 페이지 (0부터 시작)
  totalPages: number;           // 전체 페이지 수
  totalElements: number;        // 전체 항목 수
  onPageChange: (page: number) => void;  // 페이지 변경 핸들러
}

// 사용 예시
<Pagination
  currentPage={page}
  totalPages={data.totalPages}
  totalElements={data.totalElements}
  onPageChange={(newPage) => setPage(newPage)}
/>
```

**특징:**

- 현재 페이지 기준 ±2 페이지 표시
- 반응형 디자인 (모바일에서 간소화)
- `React.memo`로 최적화

---

## 유틸리티 함수

### 위치: `src/utils/`

### 1. dateUtils.ts

날짜 관련 유틸리티 함수

```typescript
import {
  formatDate,
  getRelativeTime,
  isToday,
  getWeekRange,
  getMonthRange,
  getQuarterRange,
  getYearRange,
  toISOString
} from '@/utils/dateUtils';

// 날짜 포맷팅
formatDate(new Date(), 'YYYY-MM-DD');           // "2024-01-15"
formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');  // "2024-01-15 10:30:00"
formatDate(new Date(), 'YYYY년 MM월 DD일');     // "2024년 01월 15일"

// 상대 시간
getRelativeTime('2024-01-15T10:30:00');  // "3일 전", "1시간 전", "방금 전"

// 오늘 여부
isToday(new Date());  // true

// 기간 범위 (시작일, 종료일 반환)
getWeekRange(new Date());     // { start: Date, end: Date }
getMonthRange(new Date());    // { start: Date, end: Date }
getQuarterRange(new Date());  // { start: Date, end: Date }
getYearRange(new Date());     // { start: Date, end: Date }

// ISO 8601 문자열 변환
toISOString(new Date());  // "2024-01-15T01:30:00.000Z"
```

---

### 2. formatters.ts

포맷팅 유틸리티 함수

```typescript
import { formatNumber, formatPrice, truncateText } from '@/utils/formatters';

// 숫자 포맷팅 (천단위 콤마)
formatNumber(1000000);  // "1,000,000"
formatNumber(null);     // "0"

// 가격 포맷팅
formatPrice(50000);  // "50,000원"
formatPrice(0);      // "0원"

// 텍스트 자르기
truncateText('긴 텍스트입니다', 5);  // "긴 텍스트..."
truncateText('짧은', 10);            // "짧은"
```

---

### 3. errorHandler.ts

에러 처리 유틸리티 함수

```typescript
import { getErrorMessage, isNetworkError, isRetryableError } from '@/utils/errorHandler';

// 사용자 친화적 에러 메시지 추출
try {
  await apiCall();
} catch (error) {
  const message = getErrorMessage(error);
  // Axios 에러: 서버 응답 메시지 또는 HTTP 상태별 기본 메시지
  // 네트워크 에러: "네트워크 연결을 확인해주세요."
  // 일반 에러: error.message 또는 기본 메시지
  showError(message);
}

// 네트워크 에러 확인
if (isNetworkError(error)) {
  // 오프라인 처리
}

// 재시도 가능 에러 확인 (5xx, 네트워크 에러)
if (isRetryableError(error)) {
  // 재시도 로직
}
```

**HTTP 상태별 기본 메시지:**

- 400: "잘못된 요청입니다."
- 401: "인증이 필요합니다."
- 403: "접근 권한이 없습니다."
- 404: "요청한 데이터를 찾을 수 없습니다."
- 500: "서버 오류가 발생했습니다."

---

## 커스텀 훅

### 위치: `src/components/common/useToast.ts`

### useToast

토스트 알림을 표시하는 커스텀 훅

```typescript
import { useToast } from '@/components/common/useToast';

function MyComponent() {
  const { showSuccess, showError, showInfo, showWarning, showToast } = useToast();

  // 성공 메시지 (3초 후 자동 닫힘)
  showSuccess('저장되었습니다.');

  // 에러 메시지 (5초 후 자동 닫힘)
  showError('오류가 발생했습니다.');

  // 정보 메시지
  showInfo('새로운 업데이트가 있습니다.');

  // 경고 메시지
  showWarning('입력값을 확인해주세요.');

  // 커스텀 토스트 (타입, 지속시간 지정)
  showToast('커스텀 메시지', 'info', 5000);
}
```

**주의:** `ToastContainer` 내부에서만 사용 가능

---

## 타입 정의

### 위치: `src/types/`

### 1. common.types.ts

공통 타입 정의

```typescript
// API 응답 기본 구조
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// API 에러 응답
interface ApiErrorResponse {
  timestamp: string;
  status: number;
  code: string;
  error: string;
  message: string;
}

// 페이지 정보
interface PaginationParams {
  page: number;
  size: number;
}

// 정렬 정보
interface SortParams {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
```

---

### 2. product.types.ts

상품 관련 타입 정의

```typescript
// 상품 상태 열거형
enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED'
}

// 상품 요청 DTO
interface ProductRequest {
  productCode: string;
  productName: string;
  description?: string;
  categoryId?: number;
  status: ProductStatus;
}

// 상품 응답 DTO
interface ProductResponse {
  productId: number;
  productCode: string;
  productName: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  status: ProductStatus;
  createdDate?: string;
  lastModifiedDate?: string;
}

// 상품 검색 조건
interface ProductSearchCondition {
  productName?: string;
  productCode?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
}

// 페이징된 상품 목록 응답
interface PagedProductResponse {
  content: ProductResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
```

---

### 3. changeLog.types.ts

변경 이력 관련 타입 정의

```typescript
// 변경 타입 열거형
enum ChangeType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

// 변경 이력 응답
interface ChangeLogResponse {
  changeLogId: number;
  productId: number;
  productName?: string;
  changeType: ChangeType;
  changedField?: string;
  oldValue?: string;
  newValue?: string;
  changedBy?: string;
  changedDate: string;
}

// 변경 이력 검색 조건
interface ChangeLogSearchCondition {
  productId?: number;
  changeType?: ChangeType;
  startDate?: string;
  endDate?: string;
}

// 페이징된 변경 이력 응답
interface PagedChangeLogResponse {
  content: ChangeLogResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
```

---

## 재사용 가이드라인

### 새 프로젝트에서 사용 시

1. **공통 컴포넌트 복사**
   - `components/common/` 폴더 전체 복사
   - 스타일은 Tailwind CSS 기반이므로 Tailwind 설정 필요

2. **유틸리티 함수 복사**
   - `utils/` 폴더 복사
   - 의존성 없이 독립적으로 사용 가능

3. **타입 정의 참고**
   - `types/` 폴더의 구조를 참고하여 새 프로젝트에 맞게 수정

### 주의사항

- `useToast` 훅은 반드시 `ToastContainer` 내부에서 사용
- 모든 컴포넌트는 TypeScript 기반
- Tailwind CSS 클래스 사용 (별도 CSS 파일 불필요)
- Path alias (`@/`) 사용 중 - `tsconfig.json` 설정 필요

---

## 파일 목록

```
src/
├── components/
│   └── common/
│       ├── ConfirmDialog.tsx    # 확인 다이얼로그
│       ├── EmptyState.tsx       # 빈 상태 표시
│       ├── LoadingSpinner.tsx   # 로딩 스피너
│       ├── Modal.tsx            # 모달 래퍼
│       ├── Pagination.tsx       # 페이지네이션
│       ├── Toast.tsx            # 토스트 컴포넌트
│       ├── ToastContainer.tsx   # 토스트 컨테이너
│       ├── ToastContext.tsx     # 토스트 컨텍스트
│       └── useToast.ts          # 토스트 훅
├── utils/
│   ├── dateUtils.ts             # 날짜 유틸리티
│   ├── errorHandler.ts          # 에러 처리 유틸리티
│   └── formatters.ts            # 포맷팅 유틸리티
└── types/
    ├── common.types.ts          # 공통 타입
    ├── product.types.ts         # 상품 타입
    └── changeLog.types.ts       # 변경 이력 타입
```
