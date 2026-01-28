# 빌드 관련 문제

## 백엔드 빌드 문제

### 문제: Gradle 컴파일 실패

**에러 메시지:**

```
Execution failed for task ':compileJava'
```

**해결 방법:**

#### 1. Gradle 캐시 정리

```bash
./gradlew clean
./gradlew build --refresh-dependencies
```

#### 2. QueryDSL 생성 확인

QueryDSL Q 클래스가 생성되지 않은 경우:

```bash
./gradlew clean
./gradlew compileJava
```

생성된 파일 확인: `build/generated/querydsl/`

#### 3. Java 버전 확인

`build.gradle`에서 Java 버전 확인:

```gradle
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}
```

시스템 Java 버전 확인:

```bash
java -version
```

---

### 문제: Spring Boot 4.0.2에서 spring-boot-starter-aop 찾을 수 없음

**에러 메시지:**

```
Could not find org.springframework.boot:spring-boot-starter-aop:.
```

**원인:**

- Spring Boot 4.0.2가 Maven Central에 아직 없을 수 있음
- Spring Milestone Repository가 필요함

**해결 방법:**

#### build.gradle 수정

```gradle
repositories {
    mavenCentral()
    // Spring Milestone Repository 추가
    maven { url 'https://repo.spring.io/milestone' }
}

dependencies {
    // AOP - Spring AOP + AspectJ 직접 추가
    implementation 'org.springframework:spring-aop'
    implementation 'org.aspectj:aspectjweaver'
}
```

---

## 프론트엔드 빌드 문제

### 문제: Vite 빌드 실패

**에러 메시지:**

```
Failed to resolve import
```

**해결 방법:**

#### 1. 의존성 재설치

```bash
cd front_end
rm -rf node_modules package-lock.json
npm install
```

#### 2. Vite 캐시 정리

```bash
cd front_end
rm -rf node_modules/.vite
npm run dev
```

#### 3. TypeScript 타입 확인

```bash
cd front_end
npm run build
```

타입 오류가 있으면 수정 후 재빌드

---

### 문제: Vite 개발 서버에서 의존성 해석 실패 (react-router-dom, clsx 등)

**에러 메시지:**

```
Could not resolve "react-router-dom"
Could not resolve "clsx"
```

**원인:**

- `package.json`에 선언은 되어 있으나 `node_modules`에 실제로 설치되지 않음
- `npm install`을 하지 않았거나, 중간에 의존성이 추가된 후 설치를 건너뜀

**해결 방법:**

프론트엔드 디렉토리에서 의존성 재설치:

```bash
cd frontend
npm install
```

또는 Windows PowerShell:

```powershell
cd frontend
npm install
```

그 후 개발 서버 재시작:

```bash
npm run dev
```

**참고:**

- 프로젝트 루트가 아닌 `frontend/` 디렉터리에서 실행해야 함
- `package-lock.json`이 있으면 버전이 고정되어 일관된 설치가 가능함

---

### 문제: CSS가 적용되지 않는 것처럼 보이는 현상 (Tailwind 미로드)

**증상:**

- 버튼·레이아웃 등 Tailwind 클래스가 적용되지 않은 것처럼 보임
- 개발자 도구에서 해당 클래스가 인식되지 않음

**원인:**

- Tailwind CSS를 불러오는 진입점이 없음
- `main.tsx`에서 전역 CSS를 import하지 않았거나, Tailwind용 CSS 파일이 없음

**해결 방법:**

#### 1. Tailwind 진입 CSS 파일 생성

`frontend/src/index.css` 파일을 만들고 다음을 추가:

```css
@import "tailwindcss";
```

(또는 사용 중인 Tailwind 버전에 맞게 `@tailwind base; @tailwind components; @tailwind utilities;` 등 사용)

#### 2. main.tsx에서 전역 CSS import

`frontend/src/main.tsx` 최상단에 추가:

```tsx
import '@/index.css';
```

그 후 개발 서버를 재시작하여 확인.

**참고:**

- Vite + Tailwind 4 구성에서는 `@import "tailwindcss";` 형태를 사용할 수 있음
- Tailwind 3 이하일 경우 `tailwind.config.js`와 `@tailwind` 디렉티브 조합 확인

---

### 문제: front_end에서 gradle 명령어 실행 오류

**에러 메시지:**

```
Project directory 'C:\workspace\spring-react-product-mng\front_end' is not part of the build defined by settings file 'C:\workspace\spring-react-product-mng\settings.gradle'.
```

**원인:**

- `front_end` 디렉토리는 npm 프로젝트이므로 Gradle 명령어를 사용할 수 없음
- Gradle은 백엔드 프로젝트용 빌드 도구
- `front_end`는 Vite/npm 기반 프론트엔드 프로젝트

**해결 방법:**

#### 1. 백엔드 빌드 (Gradle)

백엔드를 빌드하려면 **프로젝트 루트 디렉토리**에서 실행:

```bash
# 프로젝트 루트 디렉토리로 이동
cd C:\workspace\spring-react-product-mng

# Gradle 빌드 실행
.\gradlew clean build
```

#### 2. 프론트엔드 빌드 (npm)

프론트엔드를 빌드하려면 **front_end 디렉토리**에서 npm 명령어 사용:

```bash
# front_end 디렉토리로 이동
cd front_end

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

#### 3. 프로젝트 구조 확인

```
spring-react-product-mng/
├── build.gradle          # 백엔드 빌드 설정 (Gradle)
├── settings.gradle       # Gradle 프로젝트 설정
├── src/                  # 백엔드 소스 코드
│   └── main/java/...
└── front_end/            # 프론트엔드 프로젝트 (npm)
    ├── package.json      # npm 프로젝트 설정
    ├── vite.config.ts    # Vite 빌드 설정
    └── src/              # 프론트엔드 소스 코드
```

**참고:**

- 백엔드: Gradle 사용 (`build.gradle`, `settings.gradle`)
- 프론트엔드: npm/Vite 사용 (`package.json`, `vite.config.ts`)
- 각각 독립적인 빌드 시스템을 사용하므로 해당 디렉토리에서 올바른 명령어를 사용해야 함
