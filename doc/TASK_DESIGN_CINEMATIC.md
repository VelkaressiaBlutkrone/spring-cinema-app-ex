# 웹 및 앱 디자인 개선 — Cinematic & Immersive (세부 작업 계획)

## 개요

- **목표**: 영화관 예매 시스템에 시네마틱하고 몰입감 있는 디자인 적용
- **범위**: 웹(React) + 앱(Flutter) 전반에 일관된 비주얼 및 인터랙션 경험 제공
- **참조**: [TASK.md](TASK.md) > "웹 및 앱 디자인 개선" 섹션, [RULE.md](RULE.md) 12항 프론트엔드 규칙
- **예상 소요**: 6-10일 (웹·앱 병렬 진행 시 단축 가능)
- **전제**: Step 1-21 완료 상태, 리팩토링(Phase 1-3) 적용 완료

---

## 현재 구현 상태

### 이미 완료된 항목

| 항목 | 웹(React) | 앱(Flutter) |
|------|-----------|-------------|
| 다크 모드 기본 | `#0a0a0a` 배경, CSS 변수 | `CinemaTheme.dark`, `CinemaColors` |
| 글래스모피즘 UI | `GlassCard` (Tailwind `backdrop-blur-xl`) | `GlassCard` (`BackdropFilter` + `ImageFilter.blur`) |
| 포인트 컬러·그라데이션 | CSS 변수 (`--color-cinema-*`), `.gradient-cinema-cta` | `CinemaColors.neon*`, `NeonButton` 그라데이션 |
| 수평 스크롤 영화 목록 | `scroll-snap-x`, 가로 스크롤 | `ListView.builder` 수평 |
| 좌석 bouncy 애니메이션 | `@keyframes seat-bounce` (CSS) | 기본 애니메이션 |
| 좌석 SVG 렌더링 | `SeatMap.tsx` SVG 기반 | 커스텀 위젯 기반 |

### 미구현 항목 (이 문서의 작업 범위)

| 항목 | 웹 | 앱 | 우선순위 |
|------|----|----|---------|
| 페이지 전환 애니메이션 | 없음 | 없음 | 높음 |
| 카드·리스트 진입 애니메이션 | 없음 | 없음 | 높음 |
| 버튼·카드 호버/터치 피드백 강화 | 기본 `hover:opacity-90` | 기본 | 높음 |
| 히어로 영상 배경 재생 | 없음 | 해당 없음 | 중간 |
| 스크롤 기반 인터랙션 | 없음 | 없음 | 중간 |
| Lightning Dark (인터랙션 반응형) | 없음 | 없음 | 중간 |
| 3D 시트 뷰 / 2.5D 시뮬레이션 | Three.js 미설치 | 없음 | 낮음 |
| 키네틱 타이포그래피 | 없음 | 없음 | 낮음 |
| 모핑(Morphing) 전환 효과 | 없음 | 없음 | 낮음 |

---

## Phase 1: 애니메이션 인프라 구축 ✅

### 목표

- 웹/앱 양쪽에 애니메이션 라이브러리 도입
- 공통 애니메이션 유틸리티·상수 정의

### 1.1 웹(React) — Framer Motion 도입

#### 작업 내용

- [x] `framer-motion` 패키지 설치
- [x] `frontend/src/lib/animations.ts` — 공통 애니메이션 variants 정의
  - `fadeIn`: opacity 0→1 (300ms ease-out)
  - `slideUp`: y:20→0 + opacity (400ms)
  - `slideInLeft` / `slideInRight`: x:±30→0 (400ms)
  - `scaleIn`: scale 0.95→1 + opacity (300ms)
  - `staggerChildren`: 자식 요소 순차 진입 (50ms 간격)
- [x] `frontend/src/lib/transitions.ts` — 페이지 전환 variants 정의
  - `pageTransition`: opacity + y 오프셋 (exitBeforeEnter)
  - `modalTransition`: scale + backdrop-filter 진입

#### 파일 구조

```
frontend/src/lib/
├── animations.ts      # 공통 motion variants
└── transitions.ts     # 페이지·모달 전환 정의
```

#### 체크리스트

- [x] `framer-motion` 설치 및 import 정상 동작
- [x] 공통 variants로 테스트 컴포넌트 애니메이션 확인
- [x] 번들 사이즈 증가량 확인 (tree-shaking 적용)

### 1.2 앱(Flutter) — flutter_animate 도입

#### 작업 내용

- [x] `pubspec.yaml`에 `flutter_animate: ^4.5.0` 추가
- [x] `mobile/lib/theme/cinema_animations.dart` — 공통 애니메이션 정의
  - `CinemaAnimations.fadeIn` (300ms)
  - `CinemaAnimations.slideUp` (400ms, offset: 20)
  - `CinemaAnimations.scaleIn` (300ms, begin: 0.95)
  - `CinemaAnimations.staggerDelay` (50ms 간격)
  - `CinemaAnimations.defaultCurve` = `Curves.easeOutCubic`

#### 파일 구조

```
mobile/lib/theme/
├── cinema_theme.dart       # 기존 테마
├── cinema_spacing.dart     # 기존 스페이싱
└── cinema_animations.dart  # 신규 — 애니메이션 상수·유틸
```

#### 체크리스트

- [x] `flutter_animate` 패키지 설치 및 import 정상 동작
- [x] `CinemaAnimations` 상수로 위젯 애니메이션 적용 확인
- [x] Hot reload 시 애니메이션 재생 정상 동작

### 예상 소요 시간

0.5일

---

## Phase 2: 페이지 전환 및 라우트 애니메이션 ✅

### 목표

- 화면 전환 시 부드러운 fade/slide 애니메이션 적용
- 웹과 앱 모두 일관된 전환 경험 제공

### 2.1 웹(React) — 라우트 전환 애니메이션

#### 작업 내용

- [x] `AnimatePresence` + `motion.div`를 라우트 래핑
  - `frontend/src/components/common/PageTransition.tsx` 생성
  - `MainLayout`에 `AnimatePresence mode="wait"` + location key 적용
- [x] 전환 효과 정의
  - 일반 페이지 전환: fade + slideUp (300ms) — `MainLayout`
  - 관리자 페이지: fadeIn (300ms) — `AdminLayout`
  - 뒤로 가기: exit 애니메이션 (opacity + y:-8)
- [x] `MainLayout` / `AdminLayout`에 `AnimatePresence` 적용

#### 체크리스트

- [x] 페이지 이동 시 fade+slide 전환 애니메이션 재생
- [x] 브라우저 뒤로 가기에서도 애니메이션 동작
- [x] SPA 라우팅 성능 저하 없음 확인 (exitBeforeEnter lazy)

### 2.2 앱(Flutter) — go_router 전환 커스텀

#### 작업 내용

- [x] `mobile/lib/routes/app_router.dart`에 `pageBuilder` 커스텀
  - `CustomTransitionPage` 사용
  - fade + slideUp 전환 (300ms, `CinemaAnimations.defaultCurve`)
- [x] 로그인/회원가입 화면: slideUp 전환 (모달 느낌, 400ms)
- [x] 메인 탭 간 전환: 즉시 전환 (탭 전환이므로 애니메이션 불필요)

#### 체크리스트

- [x] 화면 전환 시 부드러운 애니메이션 재생
- [x] 뒤로 가기 제스처 시 reverse 애니메이션 동작
- [x] 탭 전환은 즉시 전환 (불필요한 애니메이션 없음)

### 예상 소요 시간

1일

---

## Phase 3: 컴포넌트 진입 애니메이션 (Stagger + Entrance) ✅

### 목표

- 카드, 리스트 아이템, 통계 등 UI 요소에 순차 진입 애니메이션 적용
- 스크롤 시 뷰포트 진입 감지 → 애니메이션 트리거

### 3.1 웹(React) — 컴포넌트 진입 효과

#### 작업 내용

- [x] 홈 페이지 (`HomePage.tsx`)
  - 히어로 섹션: fadeIn (즉시)
  - 통계 카드: stagger slideUp (50ms 간격)
  - 상영 중 영화 목록: stagger slideInLeft
- [x] 영화 목록 페이지 (`MoviesPage.tsx`)
  - 영화 카드 그리드: stagger scaleIn (30ms 간격)
- [x] 예매 내역 페이지 (`ReservationsPage.tsx`)
  - 예매 카드 리스트: stagger slideUp
- [x] 마이페이지 (`MyPage.tsx`)
  - 탭 전환 시 content fadeIn (AnimatePresence)
- [x] 좌석 선택 페이지 (`SeatSelectPage.tsx`)
  - 선택된 좌석 바: AnimatePresence slideUp from bottom

#### 체크리스트

- [x] 페이지 첫 로드 시 요소들이 순차적으로 나타남
- [x] 성능 영향 최소화 (transform + opacity만 사용, layout 변경 없음)

### 3.2 앱(Flutter) — 컴포넌트 진입 효과

#### 작업 내용

- [x] 홈 화면 (`CinemaHomeScreen`)
  - `CinemaHomeHero`: fadeIn + slideY (300ms)
  - `CinemaHomeStats`: slideY + fadeIn (300ms)
  - `CinemaHomeUpcoming`: slideX + fadeIn (400ms)
  - `CinemaHomeRecent`: slideY + fadeIn (300ms)
- [x] 영화 목록 화면 (`MoviesScreen`)
  - 영화 카드: `.animate()` 체이닝, stagger delay index * 50ms
- [x] 예매 내역 화면 (`ReservationsScreen`)
  - 예매 카드: stagger slideY + fadeIn
- [x] 마이페이지 탭
  - 탭 전환 시 AnimatedSwitcher fade 전환
- [x] 좌석 선택 화면 (`SeatSelectScreen`)
  - 하단 결제 버튼: AnimatedSwitcher fade + slideUp

#### 체크리스트

- [x] 화면 진입 시 위젯이 순차적으로 나타남
- [x] 스크롤 시 신규 아이템에 진입 애니메이션 적용
- [x] 성능 영향 최소화 (transform + opacity만 사용)

### 예상 소요 시간

2일 (웹 1일 + 앱 1일, 병렬 진행 가능)

---

## Phase 4: 호버·터치 피드백 강화 ✅

### 목표

- 카드, 버튼, 포스터 등 인터랙티브 요소의 호버/터치 반응 강화
- 시네마틱한 글로우·스케일·쉐도우 효과 추가

### 4.1 웹(React) — 호버 효과 강화

#### 작업 내용

- [x] GlassCard 호버
  - border-color 밝아짐 (glass-border → neonBlue/30)
  - 그림자 강화 (neonBlue glow)
  - `transition-all duration-300`, `motion-reduce:transition-none`
- [x] NeonButton 호버 강화
  - glow shadow 확대 (0.4→0.6 alpha, 28px blur)
  - 미세 y 이동 (-2px, `hover:-translate-y-0.5`)
  - active 시 scale 0.97
  - `motion-reduce` 대응
- [x] 좌석 호버
  - AVAILABLE 좌석: scale(1.12) + brightness(1.25) + neonBlue glow ring
  - 선택 불가 좌석: `cursor: not-allowed`, `opacity-70`
  - CSS `.seat-hover` 클래스로 transition 적용

#### 체크리스트

- [x] 모든 인터랙티브 요소에 호버 피드백 존재
- [x] transition이 부드러움 (200-300ms)
- [x] 접근성: `prefers-reduced-motion` 미디어 쿼리 대응

### 4.2 앱(Flutter) — 터치 피드백 강화

#### 작업 내용

- [x] GlassCard 터치
  - `AnimatedContainer`로 border/shadow 변화 (200ms)
  - press: border neonBlue/40, shadow 강화, release: 원래 상태
  - `onTap` prop 추가로 터치 가능 여부 제어
- [x] NeonButton 터치
  - `AnimatedScale` press 시 0.96 + glow alpha 0.4→0.6
  - `HapticFeedback.lightImpact()` on tap
  - `StatefulWidget`으로 전환
- [x] 좌석 터치
  - `_SeatTile` StatefulWidget 분리
  - `AnimatedScale` 1.15 on press + neonBlue glow shadow
  - `HapticFeedback.selectionClick()` on tap

#### 체크리스트

- [x] 모든 터치 가능 요소에 피드백 존재
- [x] 애니메이션 duration: 150-200ms
- [x] haptic feedback: 좌석(selectionClick) + 버튼(lightImpact)

### 예상 소요 시간

1.5일

---

## Phase 5: 히어로 영상 및 비주얼 강화 ✅

### 목표

- 웹 메인 페이지에 히어로 영상 배경 재생
- 포스터·텍스트에 시네마틱 시각 효과 추가

### 5.1 웹(React) — 히어로 영상 배경

#### 작업 내용

- [x] 메인 페이지 히어로 섹션에 배경 영상 재생
  - `<video autoPlay muted loop playsInline>` (opacity 40%)
  - 영상 위에 다크 그라데이션 오버레이 (from-cinema-bg/90)
  - 영상 없으면 기존 그라데이션 fallback 유지
- [x] 포스터 이미지 그라데이션 오버레이
  - `.poster-overlay`: 하단→상단 다크 그라데이션
  - `group:hover` 시 오버레이 opacity 0.6→0.3
- [x] 텍스트 글로우 효과
  - `.hero-title`: 네온 블루 text-shadow (20px + 60px)
  - `.stat-glow`: 통계 숫자 미세 글로우 (8px)
  - `prefers-reduced-motion` 시 글로우 제거

#### 체크리스트

- [x] 영상 자동 재생 (muted, inline, loop)
- [x] 저성능/영상 없을 시 fallback 그라데이션 배경
- [x] 텍스트 글로우가 가독성 해치지 않음

### 5.2 앱(Flutter) — 비주얼 강화

#### 작업 내용

- [x] 홈 화면 히어로 섹션 강화
  - `ShaderMask` 그라데이션 텍스트 (white→neonBlue)
  - 다중 `Shadow` 글로우 (24px + 60px)
- [x] 포스터 카드 강화
  - Upcoming 포스터: 하단 다크 그라데이션 `DecoratedBox`
  - Movies 리스트: `GlassCard.onTap` press 시 네온 border
- [x] 텍스트 효과
  - 통계 숫자: neonBlue Shadow (8px) 추가

#### 체크리스트

- [x] 히어로 ShaderMask 그라데이션이 과하지 않음
- [x] 포스터 오버레이 가독성 보장
- [x] 성능 영향 최소 (Shadow, DecoratedBox만 사용)

### 예상 소요 시간

1일

---

## Phase 6: 스크롤 기반 인터랙션 및 Lightning Dark ✅

### 목표

- 스크롤 위치에 따른 시각적 반응 구현
- 인터랙션 반응형 다크 모드 (Lightning Dark) 효과

### 6.1 웹(React) — 스크롤 인터랙션

#### 작업 내용

- [x] Framer Motion `useScroll` + `useTransform` 활용
  - 히어로 섹션: 스크롤 시 parallax (배경 Y 0%→30%, opacity 1→0)
  - 영화 제목: 스크롤에 따라 opacity 변화
- [x] 헤더/네비게이션 바
  - 스크롤 다운 시 배경 blur 강화 + glass 효과 (threshold: 20px)
  - 스크롤 업 시 투명하게 복원
  - passive scroll listener로 성능 최적화
- [x] 무한 스크롤 섹션
  - 새 아이템 로드 시 fadeIn 애니메이션 (Phase 3 stagger로 이미 적용)

#### 체크리스트

- [x] 스크롤 시 부드러운 parallax 효과 (jank 없음)
- [x] 스크롤 이벤트 throttle 적용 (requestAnimationFrame)
- [x] 모바일 웹에서도 스크롤 인터랙션 자연스러움

### 6.2 Lightning Dark 효과 (웹)

#### 작업 내용

- [x] 커서 위치 주변 미세 글로우 효과
  - `mousemove` 이벤트 → radial gradient 업데이트
  - CSS `background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), ...)` 활용
  - 배경에 미세한 빛 확산 (neonBlue 0.03 opacity)
- [x] 성능 최적화
  - `will-change: background` 설정
  - `requestAnimationFrame`으로 업데이트 제한

#### 체크리스트

- [x] 커서 이동 시 미세 빛 효과 확인
- [x] GPU 가속 적용 (CSS transform/opacity 기반)
- [x] `prefers-reduced-motion` 시 비활성화

### 6.3 앱(Flutter) — 스크롤 인터랙션

#### 작업 내용

- [x] `SliverAppBar` + `CustomScrollView` 활용
  - 스크롤 시 히어로 영역 축소 (`expandedHeight: 200`, `pinned: true`)
  - `BouncingScrollPhysics`로 자연스러운 바운스
- [x] 리스트 아이템 스크롤 진입 애니메이션
  - Phase 3에서 `flutter_animate` stagger fadeIn + slideY 이미 적용

#### 체크리스트

- [x] 스크롤 기반 효과가 60fps 유지
- [x] overscroll 시 자연스러운 바운스 물리

### 예상 소요 시간

1.5일

---

## Phase 7: 3D 시트 뷰 및 고급 효과 (선택적) ✅

### 목표

- 좌석 위치에서의 화면 시야를 미리 확인할 수 있는 3D/2.5D 시각화
- 모핑 전환 효과, 키네틱 타이포그래피 등 고급 인터랙션

### 7.1 웹(React) — 3D 시트 뷰

#### 작업 내용

- [x] 구현 방식 결정
  - **옵션 B 채택**: CSS 3D transform 기반 2.5D 시뮬레이션 (경량, 추가 의존성 없음)
- [x] 2.5D 시뮬레이션 (`SeatPreview3D.tsx`)
  - 좌석 선택 시 해당 위치의 화면 각도·거리 시각화
  - CSS `perspective` + framer-motion `rotateX`/`rotateY`/`translateZ` 활용
  - 화면(스크린) 표현: 그라데이션 사각형 (white glow)
  - 선택 좌석 강조: 네온 블루 글로우 마커 (scale 150%)
- [x] 전환 애니메이션
  - 좌석 맵 ↔ 3D 뷰 전환: AnimatePresence opacity (500ms)
  - 시야각 변경: 600ms easeOutQuad 전환

#### 체크리스트

- [x] 좌석 선택 시 3D/2.5D 뷰 전환 동작
- [x] 뷰 각도가 좌석 위치에 따라 현실적으로 변화
- [x] 모바일 웹에서도 동작 (터치 지원)
- [x] fallback: `prefers-reduced-motion` 시 perspective 비활성화

### 7.2 앱(Flutter) — 2.5D 시트 뷰

#### 작업 내용

- [x] `Transform` 위젯 기반 2.5D 시뮬레이션 (`seat_preview_3d.dart`)
  - `Matrix4.identity()..setEntry(3, 2, 0.001)..rotateX(angle)..rotateY(angle)`
  - 좌석 위치에 따른 시야 각도 계산 (rowRatio → rotateX, colRatio → rotateY)
- [x] 극장 스크린: `Container` + white gradient + glow shadow
- [x] 좌석 맵 ↔ 3D 뷰 전환: `AnimatedSwitcher` (500ms) + 토글 버튼

### 7.3 모핑(Morphing) 전환 효과

#### 작업 내용

- [x] 웹: 영화 목록 → 상세 모달 전환 시 포스터 모핑
  - Framer Motion `layoutId` (`poster-{id}`, `title-{id}`) + `LayoutGroup`
  - 모달 내 포스터가 목록 포스터에서 확대 전환
- [x] 앱: `Hero` 위젯으로 화면 간 공유 요소 전환
  - 영화 포스터: 목록 (`MoviesScreen`) → 상세 (`MovieDetailScreen`) Hero 애니메이션
  - `movie-poster-{id}` tag으로 매칭

### 7.4 키네틱 타이포그래피

#### 작업 내용

- [x] 웹: 히어로 제목 글자 단위 stagger 애니메이션
  - `split('')` + `motion.span` per character (80ms delay 간격)
  - fadeIn + slideUp (y:20→0, 400ms)
- [x] 앱: 히어로 제목 진입 시 글자 단위 순차 등장
  - `split('')` + `flutter_animate` per character (80ms delay 간격)
  - fadeIn + slideY (0.5→0, 400ms)

#### 체크리스트

- [x] 3D 뷰가 직관적이고 이해하기 쉬움
- [x] 모핑 전환이 자연스러움 (500ms 이내)
- [x] 키네틱 타이포가 가독성을 해치지 않음
- [x] 모든 고급 효과에 fallback/비활성화 옵션 존재

### 예상 소요 시간

2-3일

---

## 적용 범위 및 우선순위 요약

| Phase | 내용 | 우선순위 | 예상 소요 |
|-------|------|---------|----------|
| Phase 1 | 애니메이션 인프라 구축 | 필수 | 0.5일 |
| Phase 2 | 페이지 전환 애니메이션 | 높음 | 1일 |
| Phase 3 | 컴포넌트 진입 애니메이션 | 높음 | 2일 |
| Phase 4 | 호버·터치 피드백 강화 | 높음 | 1.5일 |
| Phase 5 | 히어로 영상 및 비주얼 강화 | 중간 | 1일 |
| Phase 6 | 스크롤 인터랙션 + Lightning Dark | 중간 | 1.5일 |
| Phase 7 | 3D 시트 뷰 + 고급 효과 | 낮음 (선택) | 2-3일 |
| **합계** | | | **9.5-10.5일** |

---

## 의존성 추가 계획

### 웹(React) — package.json

```json
{
  "dependencies": {
    "framer-motion": "^12.0.0"
  }
}
```

Phase 7 선택 시 추가:
```json
{
  "dependencies": {
    "@react-three/fiber": "^9.0.0",
    "@react-three/drei": "^10.0.0",
    "three": "^0.170.0"
  }
}
```

### 앱(Flutter) — pubspec.yaml

```yaml
dependencies:
  flutter_animate: ^4.5.0
```

---

## 접근성 및 성능 원칙

### 접근성 (A11y)

- `prefers-reduced-motion: reduce` 미디어 쿼리 대응 (웹)
- `MediaQuery.disableAnimations` 대응 (Flutter)
- 애니메이션이 콘텐츠 접근을 방해하지 않음
- 모든 인터랙티브 요소에 적절한 `aria-label` / `Semantics` 유지

### 성능 원칙

- **GPU 가속**: transform, opacity만 애니메이션 (layout 변경 금지)
- **지연 로딩**: 뷰포트 밖 요소는 애니메이션 대기 상태
- **프레임 예산**: 모든 애니메이션 60fps 유지 (16.67ms 이내)
- **번들 사이즈**: framer-motion tree-shaking, flutter_animate 경량

---

## RULE.md 준수 사항

| RULE.md 규칙 | 이 작업에서의 적용 |
|-------------|-----------------|
| 12.1 서버 상태 기준 | 애니메이션은 UI 표현만 변경, 서버 상태 로직 불변 |
| 12.2 좌석 상태별 시각 분리 | 기존 색상 코드 유지, 애니메이션은 추가 피드백만 |
| 12.2 HOLD 타이머 서버 기준 | 타이머 로직 변경 없음, UI 표현만 강화 |
| 12.3 Canvas/SVG 렌더링 | 기존 SVG 좌석 맵 유지, 3D 뷰는 별도 모드 |
| 9.0 보안 | 애니메이션 관련 보안 이슈 없음 (UI only) |

---

## 참고 파일 경로

### 웹(React)

| 파일 | 역할 |
|------|------|
| [index.css](../frontend/src/index.css) | CSS 변수, 기존 애니메이션 |
| [GlassCard.tsx](../frontend/src/components/common/GlassCard.tsx) | 글래스모피즘 카드 |
| [NeonButton.tsx](../frontend/src/components/common/NeonButton.tsx) | 네온 글로우 버튼 |
| [SeatMap.tsx](../frontend/src/components/booking/SeatMap.tsx) | SVG 좌석 맵 |
| [tailwind.config.js](../frontend/tailwind.config.js) | Tailwind 설정 |
| [routes/index.tsx](../frontend/src/routes/index.tsx) | 라우트 설정 |

### 앱(Flutter)

| 파일 | 역할 |
|------|------|
| [cinema_theme.dart](../mobile/lib/theme/cinema_theme.dart) | 테마·색상 정의 |
| [cinema_spacing.dart](../mobile/lib/theme/cinema_spacing.dart) | 스페이싱 상수 |
| [glass_card.dart](../mobile/lib/widgets/glass_card.dart) | 글래스모피즘 카드 |
| [neon_button.dart](../mobile/lib/widgets/neon_button.dart) | 네온 버튼 |
| [app_router.dart](../mobile/lib/routes/app_router.dart) | go_router 설정 |
| [pubspec.yaml](../mobile/pubspec.yaml) | 의존성 |
