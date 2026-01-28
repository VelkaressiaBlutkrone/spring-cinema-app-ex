# 설정 가이드

## TypeScript Import Path Alias 설정

TypeScript에서 `@/` alias를 사용하여 import 경로를 간소화할 수 있습니다.

### 설정 방법

#### 1. TypeScript 설정 (`tsconfig.app.json`)

`tsconfig.app.json` 파일의 `compilerOptions`에 다음 설정 추가:

```json
{
  "compilerOptions": {
    // ... 기타 설정

    /* Path alias */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**설명:**

- `baseUrl: "."`: 프로젝트 루트를 기준으로 설정
- `paths: { "@/*": ["./src/*"] }`: `@/`로 시작하는 import를 `./src/`로 매핑

#### 2. Vite 설정 (`vite.config.ts`)

Vite에서도 동일한 alias를 설정해야 런타임에서 정상 작동합니다:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**설명:**

- `path` 모듈을 import하여 경로를 절대 경로로 변환
- `resolve.alias`에 `'@': path.resolve(__dirname, './src')` 설정

#### 3. Import 경로 변경 예시

**변경 전 (상대 경로):**

```typescript
import { ProductResponse } from '../../types/product.types';
import { getProducts } from '../services/api/productApi';
import { formatDate } from '../../utils/dateUtils';
```

**변경 후 (Path alias):**

```typescript
import { ProductResponse } from '@/types/product.types';
import { getProducts } from '@/services/api/productApi';
import { formatDate } from '@/utils/dateUtils';
```

### 주의 사항

1. **같은 폴더 내 파일**: 같은 폴더 내의 파일은 `./`를 사용하는 것이 일반적입니다.

   ```typescript
   // ✅ 같은 폴더 내
   import { Header } from './Header';
   import { Modal } from './Modal';

   // ✅ 다른 폴더로 이동
   import { ProductResponse } from '@/types/product.types';
   ```

2. **IDE 자동완성**: IDE(VS Code 등)에서 TypeScript 서버를 재시작하면 자동완성이 정상 작동합니다.

   - `Ctrl + Shift + P` → "TypeScript: Restart TS Server"

3. **빌드 확인**: 설정 후 빌드가 정상적으로 되는지 확인:

   ```bash
   npm run build
   ```

### 장점

- **가독성 향상**: 상대 경로(`../../`)보다 명확하고 읽기 쉬움
- **리팩토링 안정성**: 파일을 이동해도 import 경로 수정이 적음
- **일관성**: 프로젝트 전반에서 일관된 import 스타일 유지

### 문제 해결

Path alias가 작동하지 않는 경우:

1. **TypeScript 서버 재시작**

   - `Ctrl + Shift + P` → "TypeScript: Restart TS Server"

2. **Vite 개발 서버 재시작**

   ```bash
   # Ctrl+C로 중지 후
   npm run dev
   ```

3. **캐시 삭제**

   ```powershell
   Remove-Item -Recurse -Force node_modules\.vite
   npm run dev
   ```

4. **설정 확인**

   - `tsconfig.app.json`에 `baseUrl`과 `paths` 설정이 있는지 확인
   - `vite.config.ts`에 `resolve.alias` 설정이 있는지 확인
