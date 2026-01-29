# 공통 UI 컴포넌트

모든 도메인에서 공통으로 사용하는 UI 컴포넌트 모음입니다.

## Cinema Theme 컴포넌트

프로젝트의 Cinema/Neon 테마를 구현한 핵심 컴포넌트들입니다.

### GlassCard

Glassmorphism 2.0 스타일 카드 컴포넌트 - 반투명 유리 효과, 테두리 글로우

**Props**:
```typescript
interface GlassCardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean; // 기본값: true
}
```

**사용 예시**:
```typescript
import { GlassCard } from '@/components/common';

function MyPage() {
  return (
    <GlassCard className="max-w-md">
      <h2>제목</h2>
      <p>내용</p>
    </GlassCard>
  );
}
```

**특징**:
- `backdrop-blur-xl`: 뒤 배경 블러 처리
- `bg-cinema-glass`: 반투명 배경색
- `border-cinema-glass-border`: 테두리 색상
- `shadow-[0_0_24px_rgba(0,0,0,0.2)]`: 그림자 효과

---

### NeonButton

CTA(Call-to-Action) 버튼 - Neon glow 효과, Cinematic 스타일

**Props**:
```typescript
interface NeonButtonProps {
  children: ReactNode;
  to?: To;              // React Router Link로 동작 (to 제공 시)
  state?: unknown;      // Router state
  onClick?: () => void; // 클릭 핸들러
  type?: 'button' | 'submit';
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
  className?: string;
}
```

**사용 예시**:
```typescript
import { NeonButton } from '@/components/common';

// 링크로 사용
<NeonButton to="/movies">영화 찾기</NeonButton>

// 버튼으로 사용
<NeonButton onClick={handleSubmit} variant="primary">
  예매하기
</NeonButton>

// Ghost 스타일
<NeonButton variant="ghost" onClick={handleCancel}>
  취소
</NeonButton>
```

**특징**:
- **Primary**: 네온 블루 배경 (`bg-cinema-neon-blue`), 네온 글로우 효과
- **Ghost**: 투명 배경, 테두리만 표시

---

### NavigationBar

상단 네비게이션 바 - Glassmorphic, Neon accent, Active underline

**Props**: 없음 (내부적으로 authStore 연동)

**사용 예시**:
```typescript
import { NavigationBar } from '@/components/common';

function App() {
  return (
    <>
      <NavigationBar />
      <main>...</main>
    </>
  );
}
```

**특징**:
- Sticky 상단 고정 (`sticky top-0`)
- Glassmorphism 배경 (`backdrop-blur-xl`)
- 활성 메뉴 하이라이트 (네온 블루 언더라인)
- 로그인/로그아웃 버튼 자동 표시
- 반응형 디자인 (모바일/데스크톱)

**네비게이션 링크**:
- 홈 (`/`)
- 영화 찾기 (`/movies`)
- 예매 내역 (`/reservations`)
- 관리자 (`/admin`)

---

## UI 기본 컴포넌트 (ui/)

`@/components/common/ui`에 정의된 기본 UI 컴포넌트들입니다.

### LoadingSpinner

로딩 스피너 - Neon blue 테마

**Props**:
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}
```

**사용 예시**:
```typescript
import { LoadingSpinner } from '@/components/common/ui';

<LoadingSpinner size="lg" message="영화 정보를 불러오는 중..." />
```

---

### Modal

모달 다이얼로그 - Cinema theme (Dark glass)

**Props**:
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

**사용 예시**:
```typescript
import { Modal } from '@/components/common/ui';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>모달 열기</button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="확인"
        size="md"
      >
        <p>모달 내용</p>
      </Modal>
    </>
  );
}
```

**특징**:
- Backdrop blur 배경
- ESC 키로 닫기
- Body scroll 자동 잠금

---

### ConfirmDialog

확인/취소 다이얼로그

**Props**:
```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}
```

**사용 예시**:
```typescript
import { ConfirmDialog } from '@/components/common/ui';

<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="삭제 확인"
  message="정말로 삭제하시겠습니까?"
  confirmText="삭제"
  variant="danger"
/>
```

---

### EmptyState

빈 상태 표시 컴포넌트

**Props**:
```typescript
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}
```

**사용 예시**:
```typescript
import { EmptyState } from '@/components/common/ui';

<EmptyState
  title="예매 내역이 없습니다"
  description="영화를 예매하고 즐거운 시간을 보내세요!"
  action={
    <NeonButton to="/movies">영화 찾기</NeonButton>
  }
/>
```

---

### Pagination

페이징 컴포넌트

**Props**:
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number; // 기본값: 5
}
```

**사용 예시**:
```typescript
import { Pagination } from '@/components/common/ui';

<Pagination
  currentPage={page}
  totalPages={10}
  onPageChange={setPage}
  maxVisible={7}
/>
```

---

### Toast / ToastContainer / ToastContext

토스트 메시지 시스템 - 전역 알림 표시

#### ToastContext 사용 (useToast 훅)

```typescript
import { useToast } from '@/hooks/useToast';

function MyComponent() {
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  
  const handleSuccess = () => {
    showSuccess('예매가 완료되었습니다!');
  };
  
  const handleError = () => {
    showError('예매에 실패했습니다.');
  };
  
  return (
    <button onClick={handleSuccess}>예매하기</button>
  );
}
```

#### App에 ToastContainer 추가

```typescript
import { ToastContainer } from '@/components/common/ui';

function App() {
  return (
    <ToastProvider>
      <NavigationBar />
      <main>...</main>
      <ToastContainer />
    </ToastProvider>
  );
}
```

**Toast 타입**:
- `success`: 성공 (녹색)
- `error`: 에러 (빨간색)
- `info`: 정보 (파란색)
- `warning`: 경고 (노란색)

---

## Import 경로

```typescript
// Cinema Theme 컴포넌트
import { GlassCard, NeonButton, NavigationBar } from '@/components/common';

// UI 기본 컴포넌트
import {
  LoadingSpinner,
  Modal,
  ConfirmDialog,
  EmptyState,
  Pagination,
  Toast,
  ToastContainer,
} from '@/components/common/ui';

// Toast 훅
import { useToast } from '@/hooks/useToast';
```

## 관련 파일

- `@/components/common/GlassCard.tsx`: Glassmorphism 카드
- `@/components/common/NeonButton.tsx`: Neon 효과 버튼
- `@/components/common/NavigationBar.tsx`: 네비게이션 바
- `@/components/common/ui/`: 기본 UI 컴포넌트 폴더
- `@/hooks/useToast`: Toast 메시지 훅
