# Noir Luxe 디자인 시스템 — 시네마 프론트엔드 리뉴얼

**날짜:** 2026-03-10
**범위:** 사용자 대상 프론트엔드만 해당 (관리자 테마 제외)
**접근 방식:** 토큰 우선 캐스케이드 — 디자인 토큰 먼저, 그 다음 컴포넌트, 그 다음 페이지

---

## 1. 디자인 방향

**시네마틱 누아르 럭스** — 깊은 블랙 + 앰버 골드 악센트, 그레인 텍스처, 세리프 중심 타이포그래피, 절제된 장식. 럭셔리 시네마의 물리적 분위기를 디지털 형태로 옮겨놓은 것. 여백을 통한 무게감, 절제를 통한 우아함.

---

## 2. 색상 시스템

### 배경 (4단계 깊이)

| 토큰 | 헥스값 | 용도 |
|-------|--------|------|
| `noir-bg` | `#06060A` | 루트 배경, 최하위 레이어 |
| `noir-surface` | `#0D0D0D` | 카드, 섹션, 콘텐츠 컨테이너 |
| `noir-elevated` | `#161616` | 모달, 오버레이, 상위 표면 |
| `noir-hover` | `#1E1E1E` | 표면 위의 호버/활성 상태 |

### 앰버 웜 악센트 스케일

| 토큰 | 값 | 용도 |
|-------|-----|------|
| `amber` | `#E8A849` | 주요 악센트, CTA, 활성 인디케이터 |
| `amber-hover` | `#D4963E` | 버튼 호버 상태 |
| `amber-ghost` | `rgba(232,168,73, 0.15)` | 고스트 버튼 배경, 태그 |
| `amber-subtle` | `rgba(232,168,73, 0.06)` | 은은한 하이라이트, 카드 틴트 |

### 시맨틱 색상

| 토큰 | 헥스값 | 용도 |
|-------|--------|------|
| `danger` | `#C44040` | 오류, 예약된 좌석, 파괴적 작업 |
| `success` | `#4A9E6E` | 이용 가능 좌석, 성공 상태 |
| `info` | `#5B7DB8` | 내 홀드 좌석, 정보성 |
| `warning` | `#D49248` | 경고, 주의 상태 (amber-hover와 구별되는 따뜻한 오렌지-앰버) |
| `blocked` | `#3A3A3A` | 차단/비활성 좌석, 비활성 요소 |
| `cancelled` | `#6B6B6B` | 취소된 항목, 회색 처리 상태 |

### 좌석 상태 → 색상 매핑

| 좌석 상태 | 토큰 | 시각적 표현 |
|-----------|-------|-------------|
| `AVAILABLE` | `success` | `#4A9E6E` 솔리드 |
| `HOLD` (내 것) | `info` | `#5B7DB8` + 글로우 링 |
| `HOLD` (타인) | `amber` | `#E8A849` 솔리드 |
| `RESERVED` | `danger` | `#C44040` 솔리드 |
| `PAYMENT_PENDING` | `warning` | `#D49248` 솔리드 |
| `CANCELLED` | `cancelled` | `#6B6B6B` 솔리드 |
| `BLOCKED` | `blocked` | `#3A3A3A` + 점선 테두리 |
| `DISABLED` | `blocked` | `#3A3A3A` 50% 불투명도 |

### 텍스트 계층 구조

| 레벨 | 값 | 용도 |
|-------|-----|------|
| 기본 | `#F5F0E8` | 제목, 중요 텍스트 (크림 화이트) |
| 보조 | `rgba(245,240,232, 0.6)` | 본문 텍스트, 설명 |
| 희미한 | `rgba(245,240,232, 0.35)` | 메타 정보, 타임스탬프, 캡션 |
| 악센트 | `#E8A849` | 라벨, 카테고리 태그, 활성 상태 |

### 테두리 및 글래스 (글래스모피즘 대체)

| 요소 | 값 |
|------|-----|
| 기본 테두리 | `rgba(232,168,73, 0.08)` |
| 호버 테두리 | `rgba(232,168,73, 0.2)` |
| 호버 글로우 | `box-shadow: 0 4px 32px rgba(232,168,73, 0.06)` |
| 구분선 | `rgba(232,168,73, 0.1)` |

---

## 3. 타이포그래피

### 폰트 조합

| 역할 | 폰트 | 두께 |
|------|-------|------|
| **디스플레이** | Cormorant Garamond | 300 (라이트), 400 (레귤러), 600 (세미볼드), 300i (라이트 이탤릭) |
| **본문** | Sora | 300 (라이트), 400 (레귤러), 500 (미디엄), 600 (세미볼드) |

### 타입 스케일 (데스크톱 → 모바일)

데스크톱 우선 값. 모바일 (< 768px)에서는 `clamp()`를 통해 더 작은 크기를 사용.

| 요소 | 폰트 | 데스크톱 | 모바일 | 두께 | 비고 |
|------|-------|----------|--------|------|------|
| 히어로 제목 | Cormorant | 56px | 36px | 600 | `clamp(36px, 5vw, 56px)` |
| 히어로 부제목 | Cormorant | 40px | 24px | 300 이탤릭 | 앰버 60%, `clamp(24px, 3.5vw, 40px)` |
| 섹션 제목 | Cormorant | 28px | 22px | 400 | — |
| 카드 제목 | Cormorant | 20px | 18px | 600 | — |
| 본문 | Sora | 14px | 13px | 300 | line-height 1.7 |
| 라벨 | Sora | 10px | 9px | 500 | letter-spacing 3px, 대문자 |
| 버튼 | Sora | 11px | 10px | 600 | letter-spacing 3px, 대문자 |
| 메타 | Sora | 12px | 11px | 300 | 희미한 불투명도 |

### 대체 항목

- `Bebas Neue` → `Cormorant Garamond` (디스플레이)
- `Roboto` → `Sora` (본문)

---

## 4. 컴포넌트 디자인

### 버튼 (NeonButton → NoirButton)

- **border-radius: 0** (날카로운 모서리, 라운딩 없음)
- **letter-spacing: 3px**, 대문자, Sora 폰트
- 4가지 변형:
  - **Primary:** `bg-amber`, `color-noir-bg`, 호버 시 앰버 글로우 그림자 추가
  - **Ghost:** 투명, 앰버 테두리 0.3 불투명도, 호버 시 테두리 밝아짐 + 은은한 글로우
  - **Danger:** 투명, danger 테두리 0.3 불투명도, 호버 시 밝아짐 + 레드 글로우
  - **Subtle:** `bg rgba(245,240,232, 0.04)`, 희미한 텍스트, 호버 시 밝아짐

### 카드 (GlassCard → NoirCard)

- **border-radius: 2px** (거의 날카로움)
- `bg-noir-surface`, 테두리 `amber-subtle` 불투명도
- 그레인 텍스처 오버레이 (프랙탈 노이즈 SVG, 3% 불투명도)
- 호버: 테두리 0.2로 밝아짐, 앰버 글로우 그림자 나타남
- 호버 시 스케일 변환 없음 — 빛 기반 피드백만
- 포스터 영역: 하단에서 어두운 그라데이션 오버레이

### 네비게이션 바

- 고정(Sticky), `bg rgba(6,6,10, 0.85)` + `backdrop-filter: blur(12px)`
- 하단 테두리: `rgba(232,168,73, 0.06)`
- 로고: Cormorant Garamond, 18-22px, 세미볼드
- 링크: Sora 10-11px, letter-spacing 2px, 대문자, 희미한
- 활성 링크: 앰버 색상 + 1px 앰버 밑줄 + `box-shadow: 0 0 8px rgba(232,168,73, 0.4)`
- 사용자 아바타: 원형, amber-ghost 배경 + 앰버 테두리

### 모달

- 백드롭: `rgba(6,6,10, 0.8)` + `backdrop-filter: blur(8px)`
- 컨테이너: `bg-noir-surface`, 테두리 `rgba(232,168,73, 0.1)`, border-radius 2px
- 그레인 오버레이
- 그림자: `0 8px 48px rgba(0,0,0,0.6), 0 0 1px rgba(232,168,73, 0.2)`
- 헤더: Sora 라벨 (앰버, 대문자) + Cormorant 제목
- 푸터: 버튼 위 앰버 구분선

### 토스트 알림

- `bg-noir-surface`, 시맨틱 테두리 색상 0.3 불투명도
- 왼쪽 3px 색상 바 (전체 시맨틱 색상)
- border-radius: 2px
- Sora 13px 본문 텍스트 시맨틱 색상
- 아이콘 없음 — 색상 바가 시각적 인디케이터

### 페이지네이션

- Sora, 희미한 텍스트, 앰버 활성 상태
- 최소한의 구성 — 번호 + 이전/다음만

### 로딩 스피너

- 네온 블루를 대체하는 앰버 테두리 스피너
- 얇은 선 스타일 (2px 테두리)

### 빈 상태

- Cormorant 제목 + Sora 설명
- 선택적 CTA에 앰버 악센트

### 폼 입력 (로그인/회원가입 페이지)

- `bg-noir-elevated` (#161616), 테두리 `rgba(232,168,73, 0.08)`, border-radius 0
- 텍스트: `#F5F0E8`, 플레이스홀더: `rgba(245,240,232, 0.25)`
- 포커스: 테두리 `rgba(232,168,73, 0.3)` + `box-shadow: 0 0 0 1px rgba(232,168,73, 0.15)`
- 높이: 최소 44px (터치 타겟)
- Sora 14px, font-weight 300
- 입력 위 라벨: Sora 10px, letter-spacing 2px, 대문자, 앰버 50% 불투명도

### 링크

- 기본: `#E8A849` (앰버)
- 호버: `#D4963E` (amber-hover) + 밑줄
- 방문 완료: 기본과 동일 (보라색 없음)

---

## 5. 애니메이션 시스템 — 시네마틱 오케스트레이션

### 이징 커브

| 이름 | 큐빅 베지어 | 특성 |
|------|-------------|------|
| `filmEnter` | `[0.0, 0.0, 0.2, 1.0]` | 느린 시작 → 자연스러운 안착. 커튼 올라감. |
| `filmExit` | `[0.4, 0.0, 1.0, 1.0]` | 빠른 퇴장. 장면 전환의 결단력. |
| `filmAccent` | `[0.16, 1.0, 0.3, 1.0]` | 오버슈트 스프링. 좌석 선택 피드백. |
| `filmDramatic` | `[0.0, 0.0, 0.0, 1.0]` | 극도로 느린 시작 → 폭발적 도착. 히어로 텍스트. |

### 페이지 진입 — "오프닝 크레딧"

```
0ms    — 배경 페이드 인 (600ms, filmDramatic)
200ms  — 상단 라벨 텍스트 페이드 + 위로 슬라이드 (400ms, filmEnter)
400ms  — 메인 제목 글자별 스태거 (50ms 간격, 각 600ms, filmDramatic)
700ms  — 구분선 왼쪽→오른쪽 확장 (500ms, filmEnter)
900ms  — 본문/메타 페이드 인 (400ms, filmEnter)
1100ms — CTA 버튼 페이드 + 은은한 스케일 인 (300ms, filmEnter)
```

### 페이지 전환 — "씬 컷"

- 퇴장: opacity 1→0, y: 0→-12, 250ms filmExit
- 진입: 50ms 딜레이, 이후 오프닝 크레딧 시퀀스

### 모달 — "스포트라이트"

- 열기: 백드롭 blur 0→8 (300ms), 모달 scale 0.97→1 + 페이드 (350ms, 100ms 딜레이), 내부 콘텐츠 100ms 스태거
- 닫기: 모달 scale 1→0.98 + 페이드 (200ms), 백드롭 페이드 (200ms, 100ms 딜레이)

### 카드 호버 — "프로젝터 포커스"

- 테두리 색상 전환 300ms
- 박스 그림자 앰버 글로우 400ms
- 스케일 변환 없음 — 빛 기반 피드백만

### 좌석 선택 — "커튼 콜"

- 선택: 색상 전환 200ms, 앰버 글로우 링 펄스 scale 1→1.3→1 (400ms filmAccent), 정보 100ms에 위로 슬라이드
- 해제: 글로우 페이드 200ms, 색상 복원 200ms

### 키네틱 타이포그래피 — "타이틀 시퀀스"

- 히어로 제목: 글자별 opacity 0→1 + y 8→0, 50ms 스태거, filmDramatic 커브
- 이탤릭 부제목: 전체 페이드, 약간 지연된 타이밍

### 원칙

- **바운스/탄성 없음** — 영화는 튀지 않는다
- **더 긴 지속 시간** — 300-700ms (기존 200-400ms에서 증가)
- **더 넓은 스태거 간격** — 100-200ms (기존 30-50ms에서 증가)
- **호버 스케일 없음** — 빛/불투명도 피드백으로 대체
- **prefers-reduced-motion** — 모든 시퀀스가 즉시 페이드로 축소

---

## 6. 시각 효과

### lightning-dark 대체 (커서 추적 네온 글로우)

새로운 효과: **프로젝터 앰비언스** — 정적 분위기 레이어:

1. **프로젝터 빛 번짐** — 상단 중앙에서의 방사형 그라데이션, `rgba(232,168,73, 0.05)`, 타원 형태, 400px 너비
2. **사이드 비네팅** — 가장자리를 어둡게 하는 방사형 그라데이션, 주변부 `rgba(6,6,10, 0.4)`
3. **그레인 텍스처** — 컨테이너의 CSS 의사 요소(`::after`), 인라인 SVG `feTurbulence`를 `background-image`로 사용 (baseFrequency 0.65, numOctaves 3, stitchTiles), 3% 불투명도, `pointer-events: none`. NoirCard와 Modal에 컴포넌트별 적용, MainLayout에 전체 페이지 오버레이 하나 추가
4. **하단 안개** — 하단에서의 선형 그라데이션, `rgba(6,6,10, 0.95)` 투명으로 페이드

### 포스터 오버레이

- 하단에서 그라데이션: `rgba(6,6,10, 0.7)` → 50%에서 투명
- 호버: 불투명도 감소로 포스터 더 많이 노출

### 히어로 텍스트 글로우 (네온 text-shadow 대체)

```css
text-shadow: 0 0 20px rgba(232,168,73, 0.15), 0 4px 12px rgba(0,0,0, 0.5);
```

### 통계 글로우 (stat-glow 대체)

```css
text-shadow: 0 0 16px rgba(232,168,73, 0.2);
```

### 스크린 인디케이터 (좌석 선택 페이지)

- 앰버 그라데이션의 수평선: `transparent → 0.4 → 0.6 → 0.4 → transparent`
- 프로젝터 빔 효과를 위한 `box-shadow: 0 0 16px rgba(232,168,73, 0.2)`

---

## 7. 페이지 레이아웃

### HomePage

- **히어로:** 전체 너비, 프로젝터 앰비언스 배경. Cormorant 큰 제목 + 이탤릭 부제목. 앰버 구분선. Sora 본문. Primary + Ghost CTA 버튼. 오른쪽 통계 컬럼 (Cormorant 숫자 + Sora 라벨).
- **상영 예정 섹션:** 앰버 라벨 + Cormorant 섹션 제목. 가로 스크롤 NoirCard. 오른쪽 페이드 가장자리 (`noir-bg`에서 투명으로의 linear-gradient 마스크, 80px 너비). 현재 구현의 scroll-snap 동작 유지.
- **최근 예약:** NoirCard 스타일링의 목록 또는 둘러보기 CTA.

### MoviesPage

- NoirCard가 포함된 가로 스크롤 그리드 (포스터 + 제목 + 메타)
- 오프닝 크레딧 진입 애니메이션이 있는 모달 상세 보기
- 앰버 시간 라벨이 있는 스케줄 목록

### SeatSelectPage

- 상단의 앰버 글로우 스크린 인디케이터
- 시맨틱 색상 코딩의 좌석 그리드 (Success/Info/Warning/Danger/Blocked)
- 내 홀드 좌석에 은은한 글로우 링 (`box-shadow`)
- 하단 요약 바: 선택된 좌석 정보 (Cormorant) + 홀드 타이머 (Sora 앰버) + CTA

### PaymentPage

- 예약 정보를 위한 NoirCard 섹션
- 결제 수단 버튼 (Ghost 변형, 활성 시 앰버 테두리)
- 확인 CTA (Primary 버튼)

### MyPage

- 앰버 밑줄 활성 인디케이터가 있는 탭 네비게이션
- 페이드 전환이 있는 프로필/홀드/예약 탭
- NoirCard 목록 항목

---

## 8. 영향받는 파일

아래 모든 경로는 `frontend/` 기준 상대 경로입니다.

### 핵심 디자인 시스템
- `src/index.css` — 모든 색상 토큰, 폰트 선언, 유틸리티 클래스, 키프레임, 효과
- `src/lib/animations.ts` — 모든 Framer Motion 변형 및 전환
- `src/lib/transitions.ts` — 페이지/모달 전환 설정

### 컴포넌트
- `src/components/common/NeonButton.tsx` → NoirButton으로 이름 변경 및 리스타일링
- `src/components/common/GlassCard.tsx` → NoirCard로 이름 변경 및 리스타일링
- `src/components/common/NavigationBar.tsx` — 색상, 폰트, 효과
- `src/components/common/ui/Modal.tsx` — 백드롭, 테두리, 그레인, 그림자
- `src/components/common/ui/ConfirmDialog.tsx` — 변형 색상
- `src/components/common/ui/Toast.tsx` — 색상 바, 테두리, 텍스트 색상
- `src/components/common/ui/LoadingSpinner.tsx` — 앰버 테두리
- `src/components/common/ui/EmptyState.tsx` — 타이포그래피, 색상
- `src/components/common/ui/Pagination.tsx` — 앰버 활성 상태

### 예약 컴포넌트
- `src/components/booking/SeatMap.tsx` — 좌석 상태 색상, 호버 효과, 스크린 인디케이터
- `src/components/booking/SeatPreview3D.tsx` — 원근 색상, 글로우 효과
- `src/components/booking/HoldTimer.tsx` — 앰버/danger 색상 상태

### 페이지
- `src/pages/HomePage.tsx` — 히어로 섹션, 프로젝터 앰비언스, 통계, 타이포그래피
- `src/pages/MoviesPage.tsx` — 카드 스타일링, 모달 진입 애니메이션
- `src/pages/SeatSelectPage.tsx` — 요약 바, 레이아웃 조정
- `src/pages/PaymentPage.tsx` — 결제 수단 버튼, 카드 스타일링
- `src/pages/MyPage.tsx` — 탭 네비게이션 스타일링
- `src/pages/LoginPage.tsx` — 폼 입력, NoirCard, NoirButton
- `src/pages/SignupPage.tsx` — 폼 입력, NoirCard, NoirButton
- `src/pages/NotFoundPage.tsx` — 타이포그래피, 색상
- `src/pages/ReservationsPage.tsx` — NoirCard 목록, 색상 (존재하는 경우)
- `src/pages/ReservationDetailPage.tsx` — NoirCard, 타이포그래피 (존재하는 경우)

### 하위 컴포넌트 (페이지 내)
- `src/components/mypage/ProfileTab.tsx` — 폼 스타일링, 색상
- `src/components/mypage/HoldsTab.tsx` — 목록 스타일링, 색상
- `src/components/mypage/ReservationsTab.tsx` — 목록 스타일링, 색상
- `src/components/payment/PaymentSuccess.tsx` — 성공 상태 스타일링
- `src/components/movie/*` — 영화 관련 하위 컴포넌트 (존재하는 경우)

### 배럴 내보내기 (이름 변경 업데이트)
- `src/components/common/index.ts` — NeonButton → NoirButton, GlassCard → NoirCard 내보내기
- `src/components/common/ui/index.ts` — 존재하는 경우, 내보내기 업데이트

### 레이아웃
- `src/layouts/MainLayout.tsx` — lightning-dark → 프로젝터 앰비언스
- `src/components/common/PageTransition.tsx` — 전환 설정 업데이트

### 정적 파일
- `index.html` — Google Fonts 링크 업데이트 (Cormorant Garamond + Sora)

### 이름 변경 전략

NeonButton → NoirButton 및 GlassCard → NoirCard를 단일 패스로 이름 변경: 파일 이름 변경, 코드베이스 전체의 모든 임포트 참조 업데이트, 배럴 내보내기 업데이트. 하위 호환성 별칭 없음 — 깔끔한 단절.

---

## 9. 범위 외

- 관리자 테마 (현재 라이트 테마 유지)
- 백엔드 API 변경
- Flutter 모바일 앱
- 새로운 기능 또는 기능 변경
- 현재 수준을 넘어서는 접근성 개선 (prefers-reduced-motion 유지)
