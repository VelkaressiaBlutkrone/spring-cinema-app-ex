# 인증 관련 컴포넌트

인증(로그인, 회원가입 등)과 관련된 컴포넌트입니다.

## 개요

현재 인증 컴포넌트는 별도의 독립 컴포넌트보다는 페이지 레벨에서 구현되어 있습니다.  
라우트 보호 및 인증 상태 관리는 `@/stores/authStore`를 통해 처리됩니다.

## authStore 연동

인증 상태 관리는 Zustand 기반 `authStore`를 사용합니다:

```typescript
import { useAuthStore } from '@/stores/authStore';

// 컴포넌트 내에서 인증 상태 확인
function MyComponent() {
  const { isAuthenticated, accessToken, clearAuth } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // 인증된 사용자만 접근 가능한 컨텐츠
  return <div>Protected Content</div>;
}
```

### authStore 주요 메서드

- `isAuthenticated`: 인증 여부 (boolean)
- `accessToken`: JWT 액세스 토큰 (string | null)
- `setAuth(accessToken: string)`: 인증 토큰 설정
- `clearAuth()`: 인증 정보 제거 (로그아웃)

## 암호화된 로그인/회원가입

민감한 데이터(비밀번호 등)는 **Hybrid Encryption (RSA + AES-GCM)**을 사용하여 암호화됩니다:

```typescript
import { encryptPayload } from '@/utils/hybridEncryption';
import { authApi } from '@/api/auth';

// 로그인 시
const publicKey = await authApi.getPublicKey(); // 서버 공개키 가져오기
const encrypted = await encryptPayload(publicKey, {
  username: 'user@example.com',
  password: 'myPassword123'
});
const response = await authApi.login(encrypted);
```

자세한 내용은 `@/utils/hybridEncryption`를 참조하세요.

## 라우트 보호

라우트 보호는 React Router의 조건부 렌더링으로 구현:

```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

function ProtectedPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <div>Protected Page Content</div>;
}
```

## 관리자 권한 확인

관리자 전용 페이지는 `useIsAdmin` 훅을 사용:

```typescript
import { useIsAdmin } from '@/hooks/useIsAdmin';

function AdminPage() {
  const isAdmin = useIsAdmin();
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <div>Admin Dashboard</div>;
}
```

## 컴포넌트 목록 (예정)

향후 개발 예정인 재사용 가능한 컴포넌트:

- **LoginForm**: 로그인 폼 컴포넌트
- **SignUpForm**: 회원가입 폼 컴포넌트
- **ProtectedRoute**: 인증이 필요한 라우트 보호 컴포넌트
- **AuthGuard**: 인증 가드 컴포넌트

## 관련 파일

- `@/stores/authStore`: 인증 상태 관리 Zustand 스토어
- `@/utils/hybridEncryption`: RSA + AES 하이브리드 암호화
- `@/utils/jwt`: JWT 토큰 파싱 및 role 확인
- `@/hooks/useIsAdmin`: 관리자 권한 확인 훅
- `@/api/auth`: 인증 관련 API 호출
