# Noir Luxe 디자인 시스템 구현 계획

> **에이전트 작업자 대상:** 필수: 이 계획을 구현하려면 superpowers:subagent-driven-development(서브에이전트 사용 가능 시) 또는 superpowers:executing-plans를 사용하세요. 각 단계는 체크박스(`- [ ]`) 구문을 사용하여 진행 상황을 추적합니다.

**목표:** 현재 "Neon Glassmorphism" 디자인 시스템을 "Cinematic Noir Luxe"로 교체 — 깊은 블랙 + 앰버 골드, Cormorant Garamond + Sora 타이포그래피, 시네마틱 오케스트레이션 애니메이션.

**아키텍처:** 토큰 우선 캐스케이드 — CSS 디자인 토큰과 애니메이션 설정을 먼저 업데이트하여 전체 앱이 전환되도록 한 다음, 핵심 컴포넌트의 이름을 변경/재스타일링하고, 마지막으로 개별 페이지를 다듬습니다. 관리자 테마는 제외됩니다.

**기술 스택:** React 19, Tailwind CSS 4, Framer Motion 12, TypeScript, Vite

**스펙:** `docs/superpowers/specs/2026-03-10-noir-luxe-design-system-design.md`

**검증:** 테스트 프레임워크 없음. `npm run dev`를 실행하고 `http://localhost:5173`에서 시각적으로 확인하세요. `npm run build`로 빌드 오류를 점검하세요.

---

## 청크 1: 기초 — 토큰, 폰트, 애니메이션

### 작업 1: index.html에서 Google Fonts 업데이트

**파일:**
- 수정: `frontend/index.html`

- [ ] **단계 1: 폰트 링크 교체**

현재 Google Fonts `<link>` 태그(Bebas Neue + Roboto)를 Cormorant Garamond + Sora로 교체:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Sora:wght@300;400;500;600&display=swap" rel="stylesheet">
```

- [ ] **단계 2: 커밋**

```bash
git add frontend/index.html
git commit -m "chore: update Google Fonts to Cormorant Garamond + Sora"
```

---

### 작업 2: index.css에서 CSS 디자인 토큰 교체

**파일:**
- 수정: `frontend/src/index.css`

- [ ] **단계 1: @theme 블록 교체**

전체 `@theme { ... }` 블록을 Noir Luxe 토큰으로 교체:

```css
@theme {
  /* Noir Luxe design tokens */
  --color-noir-bg: #06060a;
  --color-noir-surface: #0d0d0d;
  --color-noir-elevated: #161616;
  --color-noir-hover: #1e1e1e;

  --color-amber: #e8a849;
  --color-amber-hover: #d4963e;
  --color-amber-ghost: rgba(232, 168, 73, 0.15);
  --color-amber-subtle: rgba(232, 168, 73, 0.06);

  --color-noir-danger: #c44040;
  --color-noir-success: #4a9e6e;
  --color-noir-info: #5b7db8;
  --color-noir-warning: #d49248;
  --color-noir-blocked: #3a3a3a;
  --color-noir-cancelled: #6b6b6b;

  --color-noir-text: #f5f0e8;
  --color-noir-text-secondary: rgba(245, 240, 232, 0.6);
  --color-noir-text-muted: rgba(245, 240, 232, 0.35);

  --color-noir-border: rgba(232, 168, 73, 0.08);
  --color-noir-border-hover: rgba(232, 168, 73, 0.2);
  --color-noir-divider: rgba(232, 168, 73, 0.1);

  /* Admin theme tokens (unchanged) */
  --color-cinema-admin-bg: #f9fafb;
  --color-cinema-admin-surface: #ffffff;
  --color-cinema-admin-surface-alt: #f9fafb;
  --color-cinema-admin-text: #111827;
  --color-cinema-admin-secondary: #4b5563;
  --color-cinema-admin-muted: #6b7280;
  --color-cinema-admin-border: #e5e7eb;
  --color-cinema-admin-primary: #4f46e5;
  --color-cinema-admin-primary-hover: #4338ca;
  --color-cinema-admin-danger: #dc2626;
  --color-cinema-admin-separator: #d1d5db;

  --font-display: 'Cormorant Garamond', 'Georgia', serif;
  --font-sans: 'Sora', ui-sans-serif, system-ui, sans-serif;
}
```

- [ ] **단계 2: @layer base 블록 교체**

```css
@layer base {
  html {
    background-color: var(--color-noir-bg);
  }
  body {
    @apply antialiased;
    font-family: var(--font-sans);
    background-color: var(--color-noir-bg);
    color: var(--color-noir-text);
  }
}
```

- [ ] **단계 3: @layer utilities 블록 교체**

```css
@layer utilities {
  .font-display {
    font-family: var(--font-display);
  }
  .gradient-noir-cta {
    background: linear-gradient(135deg, #e8a849 0%, #d4963e 100%);
  }
  .gradient-noir-hero {
    background: linear-gradient(135deg, rgba(232, 168, 73, 0.08) 0%, rgba(6, 6, 10, 0.4) 50%, var(--color-noir-surface) 100%);
  }
}
```

- [ ] **단계 4: 모든 시각 효과 클래스 교체**

전체 커스텀 CSS 세트(scroll-snap, seat-bounce, seat-hover, hero-title, stat-glow, poster-overlay, lightning-dark, reduced-motion)를 Noir Luxe 버전으로 교체:

```css
/* Scroll snap (unchanged behavior) */
@layer components {
  .scroll-snap-x {
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }
  .scroll-snap-item {
    scroll-snap-align: start;
    scroll-snap-stop: normal;
  }
}

/* Grain texture overlay — reusable pseudo-element */
.grain-overlay {
  position: relative;
}
.grain-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.03;
  pointer-events: none;
  z-index: 1;
  background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E');
}

/* Seat selection bounce animation */
@keyframes seat-bounce {
  0% { transform: scale(1); }
  40% { transform: scale(1.2); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
.animate-seat-bounce {
  animation: seat-bounce 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Seat hover effect */
.seat-hover {
  transition: filter 200ms ease-out, transform 200ms ease-out;
  transform-box: fill-box;
  transform-origin: center;
}
.seat-hover:hover {
  filter: brightness(1.25) drop-shadow(0 0 6px rgba(232, 168, 73, 0.4));
  transform: scale(1.12);
}

/* Hero title amber glow */
.hero-title {
  text-shadow:
    0 0 20px rgba(232, 168, 73, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.5);
}

/* Stat number glow */
.stat-glow {
  text-shadow: 0 0 16px rgba(232, 168, 73, 0.2);
}

/* Poster dark gradient overlay */
.poster-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(6, 6, 10, 0.7) 0%, transparent 50%);
  opacity: 0.6;
  transition: opacity 300ms ease-out;
  pointer-events: none;
}
.group:hover .poster-overlay {
  opacity: 0.3;
}

/* Projector Ambience — replaces lightning-dark */
.projector-ambience {
  position: relative;
}
.projector-ambience::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(ellipse 400px 160px at 50% 0%, rgba(232, 168, 73, 0.05), transparent 70%),
    radial-gradient(ellipse at center, transparent 50%, rgba(6, 6, 10, 0.4) 100%);
}

/* prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .animate-seat-bounce {
    animation: none;
  }
  .seat-hover:hover {
    transform: none;
    filter: brightness(1.15);
  }
  .hero-title {
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }
  .projector-ambience::before {
    display: none;
  }
  [style*="perspective"] {
    perspective: none !important;
  }
}
```

- [ ] **단계 5: 빌드 검증**

```bash
cd frontend && npm run build
```

예상 결과: 빌드 성공. 아직 업데이트되지 않은 컴포넌트의 이전 `cinema-*` 참조로 인해 미사용 CSS 변수 경고가 있을 수 있지만, 빌드 실패는 없어야 합니다.

- [ ] **단계 6: 커밋**

```bash
git add frontend/src/index.css
git commit -m "feat: replace design tokens with Noir Luxe palette and effects"
```

---

### 작업 3: 애니메이션 시스템 재작성

**파일:**
- 수정: `frontend/src/lib/animations.ts`
- 수정: `frontend/src/lib/transitions.ts`

- [ ] **단계 1: animations.ts 교체**

전체 파일 내용을 시네마틱 오케스트레이션 배리언트로 교체:

```typescript
import type { Variants, Transition } from 'framer-motion';

// --- Film Easing Curves ---

export const filmEnter: number[] = [0.0, 0.0, 0.2, 1.0];
export const filmExit: number[] = [0.4, 0.0, 1.0, 1.0];
export const filmAccent: number[] = [0.16, 1.0, 0.3, 1.0];
export const filmDramatic: number[] = [0.0, 0.0, 0.0, 1.0];

// --- Default Transitions ---

export const defaultTransition: Transition = {
  duration: 0.4,
  ease: filmEnter,
};

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
};

// --- Single Element Variants ---

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: filmEnter },
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: filmEnter },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: filmEnter },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: filmEnter },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: filmEnter },
  },
};

// --- Container (Stagger) Variants ---

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// --- Opening Credits Sequence ---

export const openingCredits: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

export const openingCreditsChild: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: filmDramatic },
  },
};

// --- Hover & Tap Effects ---

export const cardHover = {
  transition: { duration: 0.4, ease: 'easeOut' },
};

export const cardTap = {
  scale: 0.99,
  transition: { duration: 0.15 },
};

export const buttonHover = {
  y: -1,
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

// --- Divider Expand ---

export const dividerExpand: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.5, ease: filmEnter },
  },
};
```

- [ ] **단계 2: transitions.ts 교체**

전체 파일 내용 교체:

```typescript
import type { Variants } from 'framer-motion';
import { filmEnter, filmExit } from './animations';

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: filmEnter },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.25, ease: filmExit },
  },
};

export const modalTransition: Variants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: filmEnter },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.2, ease: filmExit },
  },
};

export const backdropTransition: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const slideUpTransition: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: filmEnter },
  },
  exit: {
    opacity: 0,
    y: 16,
    transition: { duration: 0.2, ease: filmExit },
  },
};
```

- [ ] **단계 3: 빌드 검증**

```bash
cd frontend && npm run build
```

예상 결과: 빌드 성공.

- [ ] **단계 4: 커밋**

```bash
git add frontend/src/lib/animations.ts frontend/src/lib/transitions.ts
git commit -m "feat: rewrite animation system with cinematic orchestration curves"
```

---

## 청크 2: 핵심 컴포넌트 — 이름 변경 및 재스타일링

### 작업 4: NeonButton을 NoirButton으로 이름 변경 및 재스타일링

**파일:**
- 이름 변경: `frontend/src/components/common/NeonButton.tsx` → `frontend/src/components/common/NoirButton.tsx`
- 수정: `frontend/src/components/common/index.ts`
- 수정: 12개 소비자 파일 전체 (이 작업에서는 임포트만)

- [ ] **단계 1: 새 디자인으로 NoirButton.tsx 생성**

Noir Luxe 버튼 디자인으로 `frontend/src/components/common/NoirButton.tsx`를 생성합니다. 컴포넌트는 4가지 배리언트를 지원해야 합니다: `primary`, `ghost`, `danger`, `subtle`. 동일한 prop 인터페이스(`variant`, `className`, `children`, `...rest`)를 유지합니다. noir 토큰을 사용하여 Tailwind 클래스로 스타일링합니다. border-radius: 0, letter-spacing tracking-[3px], uppercase, Sora 폰트.

먼저 현재 `NeonButton.tsx`를 읽어 prop 인터페이스를 정확히 맞춘 다음, 새 파일을 작성합니다.

- [ ] **단계 2: 기존 NeonButton.tsx 삭제**

```bash
rm frontend/src/components/common/NeonButton.tsx
```

- [ ] **단계 3: 배럴 익스포트 업데이트**

`frontend/src/components/common/index.ts`에서 다음을 교체:
```
export { NeonButton } from '@/components/common/NeonButton';
```
다음으로 변경:
```
export { NoirButton } from '@/components/common/NoirButton';
```

- [ ] **단계 4: 12개 임포트 참조 전체 업데이트**

아래 각 파일에서 `import { NeonButton }`을 `import { NoirButton }`으로 교체하고 경로를 업데이트합니다. 또한 모든 `<NeonButton` JSX 사용을 `<NoirButton`으로 교체합니다:

1. `frontend/src/pages/HomePage.tsx`
2. `frontend/src/pages/LoginPage.tsx`
3. `frontend/src/pages/PaymentPage.tsx`
4. `frontend/src/pages/NotFoundPage.tsx`
5. `frontend/src/pages/SignupPage.tsx`
6. `frontend/src/pages/SeatSelectPage.tsx`
7. `frontend/src/pages/ReservationsPage.tsx`
8. `frontend/src/pages/ReservationDetailPage.tsx`
9. `frontend/src/components/payment/PaymentSuccess.tsx`
10. `frontend/src/components/mypage/HoldsTab.tsx`
11. `frontend/src/components/mypage/ProfileTab.tsx`
12. `frontend/src/components/mypage/ReservationsTab.tsx`

- [ ] **단계 5: 빌드 검증**

```bash
cd frontend && npm run build
```

예상 결과: 임포트 오류 없이 빌드 성공.

- [ ] **단계 6: 커밋**

```bash
git add -A frontend/src/components/common/NeonButton.tsx frontend/src/components/common/NoirButton.tsx frontend/src/components/common/index.ts frontend/src/pages/ frontend/src/components/mypage/ frontend/src/components/payment/
git commit -m "feat: rename NeonButton to NoirButton with Noir Luxe styling"
```

---

### 작업 5: GlassCard를 NoirCard로 이름 변경 및 재스타일링

**파일:**
- 이름 변경: `frontend/src/components/common/GlassCard.tsx` → `frontend/src/components/common/NoirCard.tsx`
- 수정: `frontend/src/components/common/index.ts`
- 수정: 12개 소비자 파일 전체

- [ ] **단계 1: 새 디자인으로 NoirCard.tsx 생성**

`frontend/src/components/common/NoirCard.tsx`를 생성합니다. 스타일: `bg-noir-surface`, 테두리 `noir-border`, 테두리 반경 `rounded-sm` (2px), grain-overlay 클래스, 호버 시 테두리 밝아짐 + 앰버 글로우. 호버 시 스케일 없음. GlassCard와 동일한 prop 인터페이스를 유지합니다.

먼저 현재 `GlassCard.tsx`를 읽어 props를 맞춥니다.

- [ ] **단계 2: 기존 GlassCard.tsx 삭제**

```bash
rm frontend/src/components/common/GlassCard.tsx
```

- [ ] **단계 3: 배럴 익스포트 업데이트**

`frontend/src/components/common/index.ts`에서 다음을 교체:
```
export { GlassCard } from '@/components/common/GlassCard';
```
다음으로 변경:
```
export { NoirCard } from '@/components/common/NoirCard';
```

- [ ] **단계 4: 12개 임포트 참조 전체 업데이트**

작업 4와 동일한 파일. 임포트 및 JSX 사용에서 `GlassCard` → `NoirCard`로 교체합니다.

- [ ] **단계 5: 빌드 검증**

```bash
cd frontend && npm run build
```

- [ ] **단계 6: 커밋**

```bash
git add -A frontend/src/components/common/GlassCard.tsx frontend/src/components/common/NoirCard.tsx frontend/src/components/common/index.ts frontend/src/pages/ frontend/src/components/mypage/ frontend/src/components/payment/
git commit -m "feat: rename GlassCard to NoirCard with Noir Luxe styling"
```

---

### 작업 6: NavigationBar 재스타일링

**파일:**
- 수정: `frontend/src/components/common/NavigationBar.tsx`

- [ ] **단계 1: NavigationBar 스타일링 업데이트**

현재 파일을 읽은 다음, 모든 Tailwind 클래스를 Noir Luxe 토큰으로 업데이트:
- 배경: `bg-noir-bg/85 backdrop-blur-xl`
- 테두리: `border-b border-noir-border`
- 로고: `font-display text-noir-text` (font-display를 통한 Cormorant)
- 링크: `text-noir-text-muted uppercase tracking-[2px] text-[10px]`
- 활성 링크: `text-amber` + 앰버 밑줄 + 글로우
- 모든 `cinema-*` 클래스 참조를 `noir-*` 동등 항목으로 교체

- [ ] **단계 2: 시각적 확인**

```bash
cd frontend && npm run dev
```

`http://localhost:5173`에서 내비게이션을 확인합니다.

- [ ] **단계 3: 커밋**

```bash
git add frontend/src/components/common/NavigationBar.tsx
git commit -m "feat: restyle NavigationBar with Noir Luxe theme"
```

---

### 작업 7: 공통 UI 컴포넌트 재스타일링

**파일:**
- 수정: `frontend/src/components/common/ui/Modal.tsx`
- 수정: `frontend/src/components/common/ui/ConfirmDialog.tsx`
- 수정: `frontend/src/components/common/ui/Toast.tsx`
- 수정: `frontend/src/components/common/ui/LoadingSpinner.tsx`
- 수정: `frontend/src/components/common/ui/EmptyState.tsx`
- 수정: `frontend/src/components/common/ui/Pagination.tsx`

- [ ] **단계 1: Modal.tsx 업데이트**

현재 파일을 읽은 다음 업데이트:
- 배경막: `bg-noir-bg/80 backdrop-blur-lg`
- 컨테이너: `bg-noir-surface border border-noir-border rounded-sm grain-overlay`
- 그림자: `shadow-[0_8px_48px_rgba(0,0,0,0.6),0_0_1px_rgba(232,168,73,0.2)]`
- 모든 `cinema-*` 클래스 교체

- [ ] **단계 2: ConfirmDialog.tsx 업데이트**

현재 파일을 읽은 다음 업데이트:
- 그라데이션 버튼을 NoirButton danger/subtle 배리언트로 교체
- 모든 `cinema-*` 및 하드코딩된 색상 클래스 교체
- 구분선: `border-noir-divider`

- [ ] **단계 3: Toast.tsx 업데이트**

현재 파일을 읽은 다음 업데이트:
- 배경: `bg-noir-surface`
- 유형별 왼쪽 3px 색상 바 추가 (성공: `noir-success`, 오류: `noir-danger`, 경고: `noir-warning`, 정보: `noir-info`)
- 테두리: 시맨틱 색상 0.3 불투명도
- 텍스트: 시맨틱 색상
- 테두리 반경: `rounded-sm`

- [ ] **단계 4: LoadingSpinner.tsx 업데이트**

네온 블루 테두리를 앰버로 교체: `border-amber`

- [ ] **단계 5: EmptyState.tsx 업데이트**

- 제목: `font-display text-noir-text`
- 설명: `text-noir-text-secondary`
- CTA: 앰버 강조

- [ ] **단계 6: Pagination.tsx 업데이트**

- 활성 페이지: `text-amber` 또는 `bg-amber text-noir-bg`
- 비활성: `text-noir-text-muted`
- 모든 `cinema-*` 클래스 교체

- [ ] **단계 7: 빌드 검증**

```bash
cd frontend && npm run build
```

- [ ] **단계 8: 커밋**

```bash
git add frontend/src/components/common/ui/
git commit -m "feat: restyle Modal, Toast, ConfirmDialog, and other UI components"
```

---

## 청크 3: 레이아웃 및 예매 컴포넌트

### 작업 8: MainLayout에 Projector Ambience 적용

**파일:**
- 수정: `frontend/src/layouts/MainLayout.tsx`
- 수정: `frontend/src/components/common/PageTransition.tsx`

- [ ] **단계 1: MainLayout.tsx 업데이트**

현재 파일을 읽은 다음:
- `lightning-dark` 클래스를 `projector-ambience`로 교체
- 마우스 추적 JavaScript(`--mouse-x`/`--mouse-y`를 설정하는 `onMouseMove` 핸들러) 제거
- 배경 업데이트: `bg-noir-bg`
- Outlet + NavigationBar 구조 유지

- [ ] **단계 2: PageTransition.tsx 업데이트**

`@/lib/transitions`에서 임포트하는지 확인 — transitions.ts는 작업 3에서 이미 업데이트되었으므로 자동으로 작동해야 합니다. 임포트 경로가 올바른지만 확인합니다.

- [ ] **단계 3: 커밋**

```bash
git add frontend/src/layouts/MainLayout.tsx frontend/src/components/common/PageTransition.tsx
git commit -m "feat: replace lightning-dark with projector ambience in MainLayout"
```

---

### 작업 9: SeatMap을 Noir Luxe 색상으로 재스타일링

**파일:**
- 수정: `frontend/src/components/booking/SeatMap.tsx`

- [ ] **단계 1: 좌석 상태 색상 업데이트**

현재 파일을 읽은 다음, 좌석 상태의 색상 매핑을 교체:

| 상태 | 이전 색상 | 새 색상 |
|--------|-----------|-----------|
| AVAILABLE | `#22c55e` | `#4a9e6e` |
| HOLD (내 좌석) | `#3b82f6` | `#5b7db8` |
| HOLD (다른 사람) | `#f59e0b` | `#e8a849` |
| RESERVED | `#ef4444` | `#c44040` |
| PAYMENT_PENDING | `#eab308` | `#d49248` |
| CANCELLED | `#9ca3af` | `#6b6b6b` |
| BLOCKED | `#4b5563` | `#3a3a3a` |
| DISABLED | `#d1d5db` | `#3a3a3a` 50% 불투명도 |

- [ ] **단계 2: 호버/글로우 효과 업데이트**

SVG 필터/스타일에서 네온 블루 글로우를 앰버 글로우로 교체합니다. 범례 섹션 색상을 업데이트합니다.

- [ ] **단계 3: 스크린 인디케이터 업데이트**

스크린 표현을 앰버 그라데이션 라인으로 교체:
```
background: linear-gradient(90deg, transparent, rgba(232,168,73,0.4), rgba(232,168,73,0.6), rgba(232,168,73,0.4), transparent)
```
글로우 추가: `box-shadow: 0 0 16px rgba(232,168,73,0.2)`

- [ ] **단계 4: 나머지 모든 cinema-* 클래스 교체**

`cinema-` 참조를 검색하고 `noir-` 동등 항목으로 교체합니다.

- [ ] **단계 5: 커밋**

```bash
git add frontend/src/components/booking/SeatMap.tsx
git commit -m "feat: restyle SeatMap with Noir Luxe seat colors and amber glow"
```

---

### 작업 10: SeatPreview3D 및 HoldTimer 재스타일링

**파일:**
- 수정: `frontend/src/components/booking/SeatPreview3D.tsx`
- 수정: `frontend/src/components/booking/HoldTimer.tsx`

- [ ] **단계 1: SeatPreview3D.tsx 업데이트**

현재 파일을 읽은 다음:
- 스크린 글로우를 화이트/블루에서 앰버로 교체
- 좌석 색상을 작업 9 매핑에 맞게 업데이트
- 배경 색상을 noir 토큰으로 교체
- 텍스트 색상을 `noir-text` / `noir-text-muted`로 업데이트

- [ ] **단계 2: HoldTimer.tsx 업데이트**

현재 파일을 읽은 다음:
- 일반 상태: `text-amber`
- 경고 상태 (60초 이하): `text-noir-danger`
- 모든 `cinema-*` 클래스 교체

- [ ] **단계 3: 커밋**

```bash
git add frontend/src/components/booking/
git commit -m "feat: restyle SeatPreview3D and HoldTimer for Noir Luxe"
```

---

## 청크 4: 페이지 — 토큰 마이그레이션 및 타이포그래피

### 작업 11: HomePage 재스타일링

**파일:**
- 수정: `frontend/src/pages/HomePage.tsx`

- [ ] **단계 1: 히어로 섹션 업데이트**

현재 파일을 읽은 다음:
- 제목 폰트 교체: `font-display` 유지 (이제 Cormorant Garamond를 가리킴)
- 제목 크기: `text-[clamp(36px,5vw,56px)]`
- 앰버 60% 불투명도의 이탤릭 부제목 추가
- `gradient-cinema-hero` → `gradient-noir-hero`로 교체
- 제목과 본문 사이에 앰버 구분선 추가
- CTA 버튼을 NoirButton으로 업데이트 (작업 4에서 이미 이름 변경됨)
- 모든 `cinema-*` 색상 클래스를 `noir-*`로 교체

- [ ] **단계 2: 통계 섹션 업데이트**

- 숫자: `font-display text-noir-text stat-glow`
- 레이블: `text-noir-text-muted uppercase tracking-[3px]`

- [ ] **단계 3: 개봉 예정 영화 섹션 업데이트**

- 섹션 레이블: `text-amber/50 uppercase tracking-[4px]`
- 섹션 제목: `font-display text-noir-text`
- 카드 호버: `hover:scale-[1.03]` 제거, 테두리 글로우 트랜지션 추가
- 페이드 엣지: `bg-gradient-to-l from-noir-bg to-transparent`

- [ ] **단계 4: 나머지 모든 cinema-* 클래스 교체**

남아있는 `cinema-` 참조를 검색하고 교체합니다.

- [ ] **단계 5: 커밋**

```bash
git add frontend/src/pages/HomePage.tsx
git commit -m "feat: restyle HomePage hero, stats, and upcoming sections"
```

---

### 작업 12: MoviesPage 재스타일링

**파일:**
- 수정: `frontend/src/pages/MoviesPage.tsx`

- [ ] **단계 1: 영화 카드 및 모달 업데이트**

현재 파일을 읽은 다음:
- 모든 `cinema-*` 클래스를 `noir-*`로 교체
- 카드: NoirCard 스타일링 (이미 이름 변경됨)
- 호버 스케일 제거, 테두리 글로우 트랜지션 추가
- 모달: `grain-overlay` 클래스 사용
- 타이포그래피: 제목에 font-display, 메타 정보에 Sora
- 상영 일정 레이블: 앰버 강조

- [ ] **단계 2: 커밋**

```bash
git add frontend/src/pages/MoviesPage.tsx
git commit -m "feat: restyle MoviesPage with Noir Luxe theme"
```

---

### 작업 13: SeatSelectPage 재스타일링

**파일:**
- 수정: `frontend/src/pages/SeatSelectPage.tsx`

- [ ] **단계 1: 페이지 레이아웃 업데이트**

현재 파일을 읽은 다음:
- 모든 `cinema-*` 클래스 교체
- 요약 바: `bg-noir-surface border-noir-border rounded-sm`
- 선택된 좌석: `font-display text-noir-text`
- 홀드 타이머 레이블: `text-amber`
- CTA: NoirButton primary

- [ ] **단계 2: 커밋**

```bash
git add frontend/src/pages/SeatSelectPage.tsx
git commit -m "feat: restyle SeatSelectPage for Noir Luxe"
```

---

### 작업 14: PaymentPage 재스타일링

**파일:**
- 수정: `frontend/src/pages/PaymentPage.tsx`

- [ ] **단계 1: 결제 UI 업데이트**

현재 파일을 읽은 다음:
- 모든 `cinema-*` 클래스 교체
- 결제 수단 버튼: NoirButton ghost 배리언트, 활성 시 앰버 테두리
- 섹션 카드: NoirCard
- 확인 CTA: NoirButton primary

- [ ] **단계 2: 커밋**

```bash
git add frontend/src/pages/PaymentPage.tsx
git commit -m "feat: restyle PaymentPage for Noir Luxe"
```

---

### 작업 15: MyPage 및 하위 탭 재스타일링

**파일:**
- 수정: `frontend/src/pages/MyPage.tsx`
- 수정: `frontend/src/components/mypage/ProfileTab.tsx`
- 수정: `frontend/src/components/mypage/HoldsTab.tsx`
- 수정: `frontend/src/components/mypage/ReservationsTab.tsx`

- [ ] **단계 1: MyPage.tsx 업데이트**

현재 파일을 읽은 다음:
- 탭 내비게이션: 앰버 밑줄 활성 인디케이터
- 모든 `cinema-*` 클래스 교체

- [ ] **단계 2: ProfileTab.tsx 업데이트**

- 폼 입력: `bg-noir-elevated border-noir-border rounded-none`
- 포커스: `focus:border-amber/30 focus:ring-1 focus:ring-amber/15`
- 레이블: `text-amber/50 uppercase tracking-[2px] text-[10px]`

- [ ] **단계 3: HoldsTab.tsx 업데이트**

- `cinema-*` 클래스 교체, NoirCard/NoirButton은 이미 이름 변경됨

- [ ] **단계 4: ReservationsTab.tsx 업데이트**

- 동일한 패턴: `cinema-*` 클래스 교체

- [ ] **단계 5: 커밋**

```bash
git add frontend/src/pages/MyPage.tsx frontend/src/components/mypage/
git commit -m "feat: restyle MyPage and sub-tabs for Noir Luxe"
```

---

### 작업 16: 인증 및 나머지 페이지 재스타일링

**파일:**
- 수정: `frontend/src/pages/LoginPage.tsx`
- 수정: `frontend/src/pages/SignupPage.tsx`
- 수정: `frontend/src/pages/NotFoundPage.tsx`
- 수정: `frontend/src/pages/ReservationsPage.tsx`
- 수정: `frontend/src/pages/ReservationDetailPage.tsx`
- 수정: `frontend/src/components/payment/PaymentSuccess.tsx`

- [ ] **단계 1: LoginPage.tsx 업데이트**

현재 파일을 읽은 다음:
- 폼 입력: noir 입력 스타일링 (bg-noir-elevated, border-noir-border, 포커스 시 앰버)
- 카드: NoirCard (이미 이름 변경됨)
- 버튼: NoirButton (이미 이름 변경됨)
- 모든 `cinema-*` 클래스 교체
- 제목: `font-display`

- [ ] **단계 2: SignupPage.tsx 업데이트**

LoginPage와 동일한 패턴.

- [ ] **단계 3: NotFoundPage.tsx 업데이트**

- `cinema-neon-red`를 `text-amber`로 교체
- 카드/버튼 업데이트 (이미 이름 변경됨)

- [ ] **단계 4: ReservationsPage.tsx 업데이트**

- 모든 `cinema-*` 클래스 교체
- 목록 항목: noir 스타일링

- [ ] **단계 5: ReservationDetailPage.tsx 업데이트**

- 모든 `cinema-*` 클래스 교체
- 상세 섹션: NoirCard

- [ ] **단계 6: PaymentSuccess.tsx 업데이트**

- 모든 `cinema-*` 클래스 교체
- 성공 아이콘/상태: `text-noir-success`

- [ ] **단계 7: 전체 빌드 검증**

```bash
cd frontend && npm run build
```

예상 결과: 정의되지 않은 CSS 클래스에 대한 경고 없이 깨끗하게 빌드 완료.

- [ ] **단계 8: 커밋**

```bash
git add frontend/src/pages/LoginPage.tsx frontend/src/pages/SignupPage.tsx frontend/src/pages/NotFoundPage.tsx frontend/src/pages/ReservationsPage.tsx frontend/src/pages/ReservationDetailPage.tsx frontend/src/components/payment/PaymentSuccess.tsx
git commit -m "feat: restyle auth, reservations, and payment success pages"
```

---

## 청크 5: 최종 검증 및 정리

### 작업 17: 남아있는 cinema-* 참조 검색 및 제거

**파일:**
- `frontend/src/` 내 모든 파일 대상 가능 (관리자 페이지 제외)

- [ ] **단계 1: 사용자 대면 코드에서 남아있는 cinema- 참조 전역 검색**

```bash
cd frontend && grep -r "cinema-" src/ --include="*.tsx" --include="*.ts" --include="*.css" | grep -v "cinema-admin" | grep -v "node_modules"
```

남아있는 `cinema-` 참조(관리자 테마에서 사용하는 `cinema-admin-*` 토큰 제외)는 모두 해당 `noir-` 동등 항목으로 교체해야 합니다.

- [ ] **단계 2: 남아있는 참조 수정**

단계 1에서 발견된 각 파일을 업데이트합니다.

- [ ] **단계 3: 이전 컴포넌트 이름 전역 검색**

```bash
cd frontend && grep -r "NeonButton\|GlassCard\|gradient-cinema\|lightning-dark" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
```

남아있는 이전 이름은 모두 업데이트해야 합니다.

- [ ] **단계 4: 남아있는 참조 수정**

단계 3에서 발견된 각 파일을 업데이트합니다.

- [ ] **단계 5: 전체 빌드 + 개발 서버 검증**

```bash
cd frontend && npm run build && npm run dev
```

모든 페이지를 탐색합니다:
- `/` (HomePage)
- `/movies` (MoviesPage)
- `/login` (LoginPage)
- `/signup` (SignupPage)
- `/my` (MyPage)
- `/reservations` (ReservationsPage)

확인 사항: 어두운 noir 배경, 앰버 강조, Cormorant Garamond 제목, Sora 본문 텍스트, 그레인 텍스처, 프로젝터 앰비언스 글로우, 네온 블루 잔재 없음.

- [ ] **단계 6: 커밋**

```bash
git add -A frontend/src/
git commit -m "fix: remove all remaining legacy cinema theme references"
```

---

### 작업 18: 최종 커밋 — 참조된 경우 README 업데이트

**파일:**
- 수정: `frontend/src/components/common/README.md` (NeonButton/GlassCard를 참조하는 경우)

- [ ] **단계 1: README 확인 및 업데이트**

```bash
grep -l "NeonButton\|GlassCard\|neon\|glass" frontend/src/components/common/README.md frontend/src/components/booking/README.md frontend/src/components/payment/README.md 2>/dev/null
```

이전 컴포넌트 이름이나 이전 디자인 시스템을 참조하는 문서를 업데이트합니다.

- [ ] **단계 2: 최종 커밋**

```bash
git add -A frontend/src/
git commit -m "docs: update component documentation for Noir Luxe design system"
```

---

## 요약

| 청크 | 작업 | 주요 내용 |
|-------|-------|-------|
| 1 | 작업 1-3 | 기초: 폰트, 토큰, 애니메이션 |
| 2 | 작업 4-7 | 핵심 컴포넌트: NoirButton, NoirCard, 내비게이션 바, UI 컴포넌트 |
| 3 | 작업 8-10 | 레이아웃 + 예매: MainLayout, SeatMap, SeatPreview3D |
| 4 | 작업 11-16 | 모든 페이지: HomePage부터 인증 페이지까지 |
| 5 | 작업 17-18 | 정리: 레거시 참조 제거, 검증 |

**총계: 18개 작업, 약 60-80개 파일 수정**

**의존성:**
- 작업 1-3이 작업 4+ 이전에 완료되어야 합니다
- 작업 4-5 (이름 변경)가 작업 6+ 이전에 완료되어야 합니다 (페이지에서 새 이름을 참조)
- 작업 6-10은 서로 독립적입니다
- 작업 11-16은 서로 독립적입니다
- 작업 17은 모든 이전 작업에 의존합니다
