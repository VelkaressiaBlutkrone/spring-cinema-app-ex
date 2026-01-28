# TypeScript/React 관련 문제

## 문제: JSX 태그에 'react/jsx-runtime' 모듈 경로가 필요하지만 찾을 수 없음

**에러 메시지:**

```
This JSX tag requires the module path 'react/jsx-runtime' to exist, but none could be found.
Make sure you have types for the appropriate package installed.
```

**원인:**

- TypeScript가 React의 JSX 런타임 타입을 찾지 못함
- `tsconfig.json`의 `types` 배열에 React 타입이 명시되지 않음
- `jsxImportSource` 설정이 누락됨

**해결 방법:**

### 1. tsconfig.app.json 수정

`front_end/tsconfig.app.json` 파일의 `compilerOptions`에 다음을 추가/수정:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "skipLibCheck": true
  }
}
```

**중요**: `types` 배열에 "react", "react-dom"을 명시적으로 추가하지 않아도 됩니다.
`skipLibCheck: true`가 설정되어 있으면 타입 체크를 건너뛰고,
`jsxImportSource: "react"`가 설정되어 있으면 React의 JSX 런타임을 올바르게 사용합니다.

### 2. node_modules 설치 확인 및 재설치

**먼저 node_modules가 설치되어 있는지 확인:**

```bash
cd front_end
ls node_modules  # Linux/Mac
dir node_modules  # Windows
```

**설치되어 있지 않거나 오류가 있는 경우 재설치:**

터미널에서 다음 명령어 실행:

```bash
cd front_end
rm -rf node_modules package-lock.json
npm install
```

또는 Windows PowerShell:

```powershell
cd front_end
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
npm install
```

**중요**: `@types/react`와 `@types/react-dom`이 제대로 설치되었는지 확인:

```bash
npm list @types/react @types/react-dom
```

설치되어 있지 않으면:

```bash
npm install --save-dev @types/react @types/react-dom
```

### 3. TypeScript 서버 재시작

VS Code나 IDE에서:

- `Ctrl + Shift + P` (또는 `Cmd + Shift + P` on Mac)
- "TypeScript: Restart TS Server" 실행

### 4. 확인 사항

- `package.json`에 `@types/react`와 `@types/react-dom`이 `devDependencies`에 포함되어 있는지 확인
- React 버전과 `@types/react` 버전이 호환되는지 확인 (React 19는 `@types/react@^19.2.5` 필요)

**해결 완료 확인:**

- IDE에서 JSX 구문 오류가 사라짐
- `npm run build` 또는 `npm run dev` 실행 시 오류 없이 빌드됨
- 브라우저에서 React 앱이 정상적으로 렌더링됨

**참고**:

- `vite/client` 타입 오류가 나타나더라도 `skipLibCheck: true` 설정으로 인해 실제 빌드에는 영향을 주지 않습니다.
- `node_modules`가 설치되어 있으면 이 오류는 발생하지 않습니다.

---

## 문제: TypeScript 모듈 export 오류 (런타임)

**에러 메시지:**

```
Uncaught SyntaxError: The requested module '/src/types/product.types.ts' does not provide an export named 'PagedProductResponse'
```

**원인:**

- Vite 개발 서버의 모듈 캐시 문제
- TypeScript 파일이 제대로 저장되지 않았을 수 있음
- 개발 서버가 변경사항을 인식하지 못함

**해결 방법:**

### 1. Vite 개발 서버 재시작

개발 서버를 중지하고 다시 시작:

```bash
cd front_end
# Ctrl+C로 서버 중지 후
npm run dev
```

### 2. Vite 캐시 삭제

```bash
cd front_end
rm -rf node_modules/.vite
npm run dev
```

또는 Windows PowerShell:

```powershell
cd front_end
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
```

### 3. 브라우저 캐시 삭제

- 개발자 도구 (F12) 열기
- 네트워크 탭에서 "Disable cache" 체크
- 페이지 새로고침 (Ctrl + Shift + R)

### 4. TypeScript 서버 재시작

VS Code나 IDE에서:

- `Ctrl + Shift + P` (또는 `Cmd + Shift + P` on Mac)
- "TypeScript: Restart TS Server" 실행

**참고:**

- 타입은 런타임에 존재하지 않으므로 TypeScript 컴파일 후에는 사라집니다
- 하지만 개발 서버에서 타입 정보를 확인하기 위해 Vite가 TypeScript 파일을 직접 처리합니다
- 캐시 문제로 인해 변경사항이 반영되지 않을 수 있습니다

---

## 문제: erasableSyntaxOnly로 인한 enum 사용 불가

**에러 메시지:**

```
This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
```

**원인:**

- `tsconfig.app.json`의 `erasableSyntaxOnly: true` 옵션이 enum 사용을 막음
- enum은 런타임 코드를 생성하므로 erasable syntax가 아님

**해결 방법:**

`tsconfig.app.json`에서 `erasableSyntaxOnly` 옵션 제거:

```json
{
  "compilerOptions": {
    // ... 기타 설정
    "erasableSyntaxOnly": true,  // 이 줄 제거
  }
}
```

**참고:**

- `erasableSyntaxOnly`는 타입만 허용하고 런타임 코드를 생성하는 구문(enum, namespace 등)을 차단합니다
- enum을 사용하려면 이 옵션을 제거해야 합니다

---

## 문제: verbatimModuleSyntax로 인한 타입 import 오류

**에러 메시지:**

```
'ProductRequest' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
```

**원인:**

- `tsconfig.app.json`의 `verbatimModuleSyntax: true` 옵션이 활성화되어 있음
- 타입만 사용하는 경우 `import type`을 사용해야 함
- `verbatimModuleSyntax`는 모듈 구문을 그대로 유지하여 타입과 값을 구분함

**해결 방법:**

### 타입만 import하는 경우 `import type` 사용

```typescript
// 변경 전 (오류 발생)
import { ProductRequest, ProductResponse, PagedProductResponse } from '@/types/product.types';
import { PaginationParams } from '@/types/common.types';

// 변경 후 (정상 작동)
import type { ProductRequest, ProductResponse, PagedProductResponse } from '@/types/product.types';
import type { PaginationParams } from '@/types/common.types';
```

### 타입과 값을 모두 사용하는 경우

enum이나 값도 함께 export하는 경우, 일반 import와 type import를 구분:

```typescript
// 타입만 사용
import type { ProductRequest, ProductResponse } from '@/types/product.types';

// 값도 사용 (enum 등)
import { ProductStatus } from '@/types/product.types';
```

**참고:**

- `verbatimModuleSyntax`는 TypeScript가 모듈 import/export 구문을 그대로 유지하도록 함
- 타입만 사용하는 경우 `import type`을 사용하면 런타임에 제거되어 번들 크기를 줄일 수 있음
- enum, class 등 런타임에 존재하는 값은 일반 `import` 사용

**적용 예시:**

- ✅ 타입만: `import type { ProductResponse } from '@/types/product.types';`
- ✅ 값도 사용: `import { ProductStatus } from '@/types/product.types';`
- ✅ 혼합:

  ```typescript
  import type { ProductRequest, ProductResponse } from '@/types/product.types';
  import { ProductStatus } from '@/types/product.types';
  ```
