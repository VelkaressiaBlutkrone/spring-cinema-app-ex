# 유틸리티 함수

프로젝트 전반에서 사용되는 유틸리티 함수 모음입니다.

## 파일 목록

### dateUtils.ts

날짜 포맷팅 및 계산 유틸리티

**주요 함수**:

#### `formatDate(date: Date | string, format?: string): string`

날짜를 지정된 형식으로 포맷팅합니다.

**파라미터**:
- `date`: Date 객체 또는 ISO 8601 날짜 문자열
- `format`: 포맷 문자열 (기본값: `'YYYY-MM-DD'`)
  - `YYYY`: 연도 (4자리)
  - `MM`: 월 (2자리)
  - `DD`: 일 (2자리)
  - `HH`: 시간 (2자리, 24시간제)
  - `mm`: 분 (2자리)
  - `ss`: 초 (2자리)

**사용 예시**:
```typescript
import { formatDate } from '@/utils/dateUtils';

formatDate(new Date(), 'YYYY-MM-DD'); // "2026-01-29"
formatDate('2026-01-29T10:30:00Z', 'YYYY-MM-DD HH:mm'); // "2026-01-29 10:30"
formatDate(new Date(), 'MM/DD'); // "01/29"
```

---

#### `getRelativeTime(date: Date | string): string`

현재 시각 기준으로 상대적인 시간을 반환합니다.

**반환값**:
- 60초 미만: "방금 전"
- 60분 미만: "N분 전"
- 24시간 미만: "N시간 전"
- 7일 미만: "N일 전"
- 7일 이상: "YYYY-MM-DD"

**사용 예시**:
```typescript
import { getRelativeTime } from '@/utils/dateUtils';

getRelativeTime(new Date(Date.now() - 30000)); // "방금 전"
getRelativeTime(new Date(Date.now() - 120000)); // "2분 전"
getRelativeTime(new Date(Date.now() - 7200000)); // "2시간 전"
```

---

#### `isToday(date: Date | string): boolean`

주어진 날짜가 오늘인지 확인합니다.

**사용 예시**:
```typescript
import { isToday } from '@/utils/dateUtils';

isToday(new Date()); // true
isToday('2026-01-29T10:00:00Z'); // 오늘이면 true
```

---

#### `getWeekRange(date?: Date): { start: Date; end: Date }`

주어진 날짜가 속한 주의 시작일(일요일)과 종료일(토요일)을 반환합니다.

---

### errorHandler.ts

API 에러 메시지 처리 유틸리티

**주요 함수**:

#### `getErrorMessage(error: unknown): string`

에러 객체에서 사용자에게 표시할 메시지를 추출합니다.

**사용 예시**:
```typescript
import { getErrorMessage } from '@/utils/errorHandler';
import { useToast } from '@/hooks/useToast';

try {
  await moviesApi.getMovies();
} catch (error) {
  const message = getErrorMessage(error);
  showError(message);
}
```

**메시지 우선순위**:
1. 서버 응답의 `message` 필드
2. HTTP 상태 코드별 기본 메시지
   - 400: "잘못된 요청입니다."
   - 401: "인증이 필요합니다."
   - 403: "접근 권한이 없습니다."
   - 404: "요청한 데이터를 찾을 수 없습니다."
   - 500: "서버 오류가 발생했습니다."
3. 에러 객체의 `message`
4. "알 수 없는 오류가 발생했습니다."

---

#### `isNetworkError(error: unknown): boolean`

네트워크 에러인지 확인합니다.

---

#### `isRetryableError(error: unknown): boolean`

재시도 가능한 에러인지 확인합니다 (5xx 에러 또는 네트워크 에러).

---

### formatters.ts

숫자, 금액 등 포맷팅 유틸리티

**주요 함수**:

#### `formatNumber(value: number | null | undefined): string`

숫자를 천 단위 콤마로 포맷팅합니다.

**사용 예시**:
```typescript
import { formatNumber } from '@/utils/formatters';

formatNumber(1234567); // "1,234,567"
formatNumber(1000); // "1,000"
formatNumber(null); // "0"
```

---

#### `formatPrice(value: number | null | undefined): string`

숫자를 금액 형식으로 포맷팅합니다 (천 단위 콤마 + "원").

**사용 예시**:
```typescript
import { formatPrice } from '@/utils/formatters';

formatPrice(15000); // "15,000원"
formatPrice(0); // "0원"
```

---

#### `truncateText(text: string, maxLength: number): string`

텍스트를 최대 길이로 자르고 "..." 추가합니다.

**사용 예시**:
```typescript
import { truncateText } from '@/utils/formatters';

truncateText("아주 긴 텍스트입니다", 5); // "아주 긴 ..."
truncateText("짧은 텍스트", 10); // "짧은 텍스트"
```

---

### hybridEncryption.ts

RSA + AES-256-GCM 하이브리드 암호화 유틸리티  
클라이언트 → 서버 민감 데이터 암호화 (비밀번호, 개인정보 등)

**주요 함수**:

#### `encryptPayload(publicKeyPem: string, data: unknown): Promise<EncryptedPayload>`

데이터를 하이브리드 암호화합니다.

**암호화 프로세스**:
1. 랜덤 AES-256 키 생성
2. AES-GCM으로 데이터 암호화
3. RSA-OAEP로 AES 키 암호화
4. 암호화된 키, IV, 데이터를 Base64 인코딩하여 반환

**사용 예시**:
```typescript
import { encryptPayload } from '@/utils/hybridEncryption';
import { authApi } from '@/api/auth';

// 서버 공개키 가져오기
const publicKey = await authApi.getPublicKey();

// 로그인 데이터 암호화
const encrypted = await encryptPayload(publicKey, {
  loginId: 'user@example.com',
  password: 'myPassword123'
});

// 암호화된 데이터로 API 호출
const response = await authApi.login(encrypted);
```

**EncryptedPayload 타입**:
```typescript
interface EncryptedPayload {
  encryptedKey: string;   // RSA로 암호화된 AES 키 (Base64)
  iv: string;             // AES-GCM IV (Base64)
  encryptedData: string;  // AES-GCM으로 암호화된 데이터 (Base64)
}
```

**특징**:
- **RSA-OAEP**: 비대칭 암호화로 AES 키 보호
- **AES-256-GCM**: 대칭 암호화로 데이터 암호화 + 무결성 검증
- **브라우저 Web Crypto API** 사용 (표준 암호화)

---

### jwt.ts

JWT 토큰 파싱 및 검증 유틸리티 (클라이언트용)

**주요 함수**:

#### `parseJwtPayload(token: string | null): JwtPayload | null`

JWT 토큰에서 payload를 파싱합니다 (서명 검증 없음).

**반환 타입**:
```typescript
interface JwtPayload {
  sub?: string;   // Subject (사용자 ID)
  role?: string;  // 역할 (USER, ADMIN)
  exp?: number;   // 만료 시각 (Unix timestamp)
}
```

**사용 예시**:
```typescript
import { parseJwtPayload } from '@/utils/jwt';

const payload = parseJwtPayload(accessToken);
console.log(payload?.sub); // 사용자 ID
console.log(payload?.role); // "ADMIN" 또는 "USER"
```

---

#### `getRoleFromToken(token: string | null): string | null`

JWT 토큰에서 role을 추출합니다.

**사용 예시**:
```typescript
import { getRoleFromToken } from '@/utils/jwt';

const role = getRoleFromToken(accessToken);
if (role === 'ADMIN') {
  // 관리자 전용 기능
}
```

---

#### `isAdminFromToken(token: string | null): boolean`

JWT 토큰에서 ADMIN 권한 여부를 확인합니다.

**사용 예시**:
```typescript
import { isAdminFromToken } from '@/utils/jwt';

if (isAdminFromToken(accessToken)) {
  // 관리자 전용 페이지 접근 허용
} else {
  // 접근 거부
}
```

**주의사항**:
- 이 함수들은 클라이언트에서 UI 표시 목적으로만 사용됩니다.
- 실제 권한 검증은 서버에서 이루어집니다.
- 서명 검증을 수행하지 않으므로, 보안에 민감한 작업에는 사용하지 마세요.

---

## Import 경로

```typescript
// 개별 함수 import
import { formatDate, getRelativeTime } from '@/utils/dateUtils';
import { formatPrice, formatNumber } from '@/utils/formatters';
import { getErrorMessage } from '@/utils/errorHandler';
import { encryptPayload } from '@/utils/hybridEncryption';
import { isAdminFromToken, getRoleFromToken } from '@/utils/jwt';
```

또는 `@/utils` 인덱스에서 일괄 import:

```typescript
import {
  formatDate,
  formatPrice,
  getErrorMessage,
  encryptPayload,
  isAdminFromToken,
} from '@/utils';
```

## 관련 파일

- `@/utils/index.ts`: 모든 유틸리티 함수 재export
- `@/api/auth`: hybridEncryption 사용 예시
- `@/hooks/useIsAdmin`: jwt 유틸리티 사용 예시
- `@/components/common/ui/Toast`: errorHandler 사용 예시
