# Noir Luxe Design System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current "Neon Glassmorphism" design system with "Cinematic Noir Luxe" — deep black + amber gold, Cormorant Garamond + Sora typography, cinematic orchestration animations.

**Architecture:** Token-First Cascade — update CSS design tokens and animation configs first (causing the entire app to shift), then rename/restyle core components, then refine individual pages. Admin theme is excluded.

**Tech Stack:** React 19, Tailwind CSS 4, Framer Motion 12, TypeScript, Vite

**Spec:** `docs/superpowers/specs/2026-03-10-noir-luxe-design-system-design.md`

**Verification:** No test framework. Run `npm run dev` and visually verify at `http://localhost:5173`. Check for build errors with `npm run build`.

---

## Chunk 1: Foundation — Tokens, Fonts, Animations

### Task 1: Update Google Fonts in index.html

**Files:**
- Modify: `frontend/index.html`

- [ ] **Step 1: Replace font links**

Replace the current Google Fonts `<link>` tags (Bebas Neue + Roboto) with Cormorant Garamond + Sora:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Sora:wght@300;400;500;600&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Commit**

```bash
git add frontend/index.html
git commit -m "chore: update Google Fonts to Cormorant Garamond + Sora"
```

---

### Task 2: Replace CSS design tokens in index.css

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Replace @theme block**

Replace the entire `@theme { ... }` block with Noir Luxe tokens:

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

- [ ] **Step 2: Replace @layer base block**

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

- [ ] **Step 3: Replace @layer utilities block**

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

- [ ] **Step 4: Replace all visual effect classes**

Replace the entire set of custom CSS (scroll-snap, seat-bounce, seat-hover, hero-title, stat-glow, poster-overlay, lightning-dark, reduced-motion) with the Noir Luxe versions:

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

- [ ] **Step 5: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build succeeds. There will be unused CSS variable warnings (old `cinema-*` references in components not yet updated) but no build failures.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/index.css
git commit -m "feat: replace design tokens with Noir Luxe palette and effects"
```

---

### Task 3: Rewrite animation system

**Files:**
- Modify: `frontend/src/lib/animations.ts`
- Modify: `frontend/src/lib/transitions.ts`

- [ ] **Step 1: Replace animations.ts**

Replace entire file content with cinematic orchestration variants:

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

- [ ] **Step 2: Replace transitions.ts**

Replace entire file content:

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

- [ ] **Step 3: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/animations.ts frontend/src/lib/transitions.ts
git commit -m "feat: rewrite animation system with cinematic orchestration curves"
```

---

## Chunk 2: Core Components — Rename & Restyle

### Task 4: Rename and restyle NeonButton → NoirButton

**Files:**
- Rename: `frontend/src/components/common/NeonButton.tsx` → `frontend/src/components/common/NoirButton.tsx`
- Modify: `frontend/src/components/common/index.ts`
- Modify: All 12 consumer files (imports only in this task)

- [ ] **Step 1: Create NoirButton.tsx with new design**

Create `frontend/src/components/common/NoirButton.tsx` with the Noir Luxe button design. The component should support 4 variants: `primary`, `ghost`, `danger`, `subtle`. Keep the same prop interface (`variant`, `className`, `children`, `...rest`). Style using Tailwind classes with noir tokens. border-radius: 0, letter-spacing tracking-[3px], uppercase, Sora font.

Read the current `NeonButton.tsx` first to match the prop interface exactly, then write the new file.

- [ ] **Step 2: Delete old NeonButton.tsx**

```bash
rm frontend/src/components/common/NeonButton.tsx
```

- [ ] **Step 3: Update barrel export**

In `frontend/src/components/common/index.ts`, replace:
```
export { NeonButton } from '@/components/common/NeonButton';
```
with:
```
export { NoirButton } from '@/components/common/NoirButton';
```

- [ ] **Step 4: Update all 12 import references**

In each of these files, replace `import { NeonButton }` with `import { NoirButton }` and update the path. Also replace all `<NeonButton` JSX usages with `<NoirButton`:

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

- [ ] **Step 5: Verify build**

```bash
cd frontend && npm run build
```

Expected: Build succeeds with no import errors.

- [ ] **Step 6: Commit**

```bash
git add -A frontend/src/components/common/NeonButton.tsx frontend/src/components/common/NoirButton.tsx frontend/src/components/common/index.ts frontend/src/pages/ frontend/src/components/mypage/ frontend/src/components/payment/
git commit -m "feat: rename NeonButton to NoirButton with Noir Luxe styling"
```

---

### Task 5: Rename and restyle GlassCard → NoirCard

**Files:**
- Rename: `frontend/src/components/common/GlassCard.tsx` → `frontend/src/components/common/NoirCard.tsx`
- Modify: `frontend/src/components/common/index.ts`
- Modify: All 12 consumer files

- [ ] **Step 1: Create NoirCard.tsx with new design**

Create `frontend/src/components/common/NoirCard.tsx`. Style: `bg-noir-surface`, border `noir-border`, border-radius `rounded-sm` (2px), grain-overlay class, hover border brightens + amber glow. No scale on hover. Keep same prop interface as GlassCard.

Read current `GlassCard.tsx` first to match props.

- [ ] **Step 2: Delete old GlassCard.tsx**

```bash
rm frontend/src/components/common/GlassCard.tsx
```

- [ ] **Step 3: Update barrel export**

In `frontend/src/components/common/index.ts`, replace:
```
export { GlassCard } from '@/components/common/GlassCard';
```
with:
```
export { NoirCard } from '@/components/common/NoirCard';
```

- [ ] **Step 4: Update all 12 import references**

Same files as Task 4. Replace `GlassCard` → `NoirCard` in imports and JSX usage.

- [ ] **Step 5: Verify build**

```bash
cd frontend && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add -A frontend/src/components/common/GlassCard.tsx frontend/src/components/common/NoirCard.tsx frontend/src/components/common/index.ts frontend/src/pages/ frontend/src/components/mypage/ frontend/src/components/payment/
git commit -m "feat: rename GlassCard to NoirCard with Noir Luxe styling"
```

---

### Task 6: Restyle NavigationBar

**Files:**
- Modify: `frontend/src/components/common/NavigationBar.tsx`

- [ ] **Step 1: Update NavigationBar styling**

Read current file, then update all Tailwind classes to Noir Luxe tokens:
- Background: `bg-noir-bg/85 backdrop-blur-xl`
- Border: `border-b border-noir-border`
- Logo: `font-display text-noir-text` (Cormorant via font-display)
- Links: `text-noir-text-muted uppercase tracking-[2px] text-[10px]`
- Active link: `text-amber` with amber underline + glow
- Replace all `cinema-*` class references with `noir-*` equivalents

- [ ] **Step 2: Verify visually**

```bash
cd frontend && npm run dev
```

Check navigation at `http://localhost:5173`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/common/NavigationBar.tsx
git commit -m "feat: restyle NavigationBar with Noir Luxe theme"
```

---

### Task 7: Restyle common UI components

**Files:**
- Modify: `frontend/src/components/common/ui/Modal.tsx`
- Modify: `frontend/src/components/common/ui/ConfirmDialog.tsx`
- Modify: `frontend/src/components/common/ui/Toast.tsx`
- Modify: `frontend/src/components/common/ui/LoadingSpinner.tsx`
- Modify: `frontend/src/components/common/ui/EmptyState.tsx`
- Modify: `frontend/src/components/common/ui/Pagination.tsx`

- [ ] **Step 1: Update Modal.tsx**

Read current file, then update:
- Backdrop: `bg-noir-bg/80 backdrop-blur-lg`
- Container: `bg-noir-surface border border-noir-border rounded-sm grain-overlay`
- Shadow: `shadow-[0_8px_48px_rgba(0,0,0,0.6),0_0_1px_rgba(232,168,73,0.2)]`
- Replace all `cinema-*` classes

- [ ] **Step 2: Update ConfirmDialog.tsx**

Read current file, then update:
- Replace gradient buttons with NoirButton danger/subtle variants
- Replace all `cinema-*` and hardcoded color classes
- Divider: `border-noir-divider`

- [ ] **Step 3: Update Toast.tsx**

Read current file, then update:
- Background: `bg-noir-surface`
- Add left 3px color bar per type (success: `noir-success`, error: `noir-danger`, warning: `noir-warning`, info: `noir-info`)
- Border: semantic color at 0.3 opacity
- Text: semantic color
- border-radius: `rounded-sm`

- [ ] **Step 4: Update LoadingSpinner.tsx**

Replace neon-blue border with amber: `border-amber`

- [ ] **Step 5: Update EmptyState.tsx**

- Title: `font-display text-noir-text`
- Description: `text-noir-text-secondary`
- CTA: amber accent

- [ ] **Step 6: Update Pagination.tsx**

- Active page: `text-amber` or `bg-amber text-noir-bg`
- Inactive: `text-noir-text-muted`
- Replace all `cinema-*` classes

- [ ] **Step 7: Verify build**

```bash
cd frontend && npm run build
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/common/ui/
git commit -m "feat: restyle Modal, Toast, ConfirmDialog, and other UI components"
```

---

## Chunk 3: Layout & Booking Components

### Task 8: Update MainLayout with Projector Ambience

**Files:**
- Modify: `frontend/src/layouts/MainLayout.tsx`
- Modify: `frontend/src/components/common/PageTransition.tsx`

- [ ] **Step 1: Update MainLayout.tsx**

Read current file, then:
- Replace `lightning-dark` class with `projector-ambience`
- Remove mouse-tracking JavaScript (the `onMouseMove` handler that sets `--mouse-x`/`--mouse-y`)
- Update background: `bg-noir-bg`
- Keep Outlet + NavigationBar structure

- [ ] **Step 2: Update PageTransition.tsx**

Verify it imports from `@/lib/transitions` — the transitions.ts was already updated in Task 3, so this should work automatically. Just verify the import path is correct.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/layouts/MainLayout.tsx frontend/src/components/common/PageTransition.tsx
git commit -m "feat: replace lightning-dark with projector ambience in MainLayout"
```

---

### Task 9: Restyle SeatMap with Noir Luxe colors

**Files:**
- Modify: `frontend/src/components/booking/SeatMap.tsx`

- [ ] **Step 1: Update seat status colors**

Read current file, then replace the color mapping for seat statuses:

| Status | Old Color | New Color |
|--------|-----------|-----------|
| AVAILABLE | `#22c55e` | `#4a9e6e` |
| HOLD (mine) | `#3b82f6` | `#5b7db8` |
| HOLD (other) | `#f59e0b` | `#e8a849` |
| RESERVED | `#ef4444` | `#c44040` |
| PAYMENT_PENDING | `#eab308` | `#d49248` |
| CANCELLED | `#9ca3af` | `#6b6b6b` |
| BLOCKED | `#4b5563` | `#3a3a3a` |
| DISABLED | `#d1d5db` | `#3a3a3a` at 50% opacity |

- [ ] **Step 2: Update hover/glow effects**

Replace neon-blue glow with amber glow in SVG filter/styles. Update the legend section colors.

- [ ] **Step 3: Update screen indicator**

Replace the screen representation with amber gradient line:
```
background: linear-gradient(90deg, transparent, rgba(232,168,73,0.4), rgba(232,168,73,0.6), rgba(232,168,73,0.4), transparent)
```
Add glow: `box-shadow: 0 0 16px rgba(232,168,73,0.2)`

- [ ] **Step 4: Replace all remaining cinema-* classes**

Search for any `cinema-` references and replace with `noir-` equivalents.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/booking/SeatMap.tsx
git commit -m "feat: restyle SeatMap with Noir Luxe seat colors and amber glow"
```

---

### Task 10: Restyle SeatPreview3D and HoldTimer

**Files:**
- Modify: `frontend/src/components/booking/SeatPreview3D.tsx`
- Modify: `frontend/src/components/booking/HoldTimer.tsx`

- [ ] **Step 1: Update SeatPreview3D.tsx**

Read current file, then:
- Replace screen glow from white/blue to amber
- Update seat colors to match Task 9 mapping
- Replace background colors with noir tokens
- Update text colors to `noir-text` / `noir-text-muted`

- [ ] **Step 2: Update HoldTimer.tsx**

Read current file, then:
- Normal state: `text-amber`
- Warning state (≤60s): `text-noir-danger`
- Replace all `cinema-*` classes

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/booking/
git commit -m "feat: restyle SeatPreview3D and HoldTimer for Noir Luxe"
```

---

## Chunk 4: Pages — Token Migration & Typography

### Task 11: Restyle HomePage

**Files:**
- Modify: `frontend/src/pages/HomePage.tsx`

- [ ] **Step 1: Update hero section**

Read current file, then:
- Replace title font: `font-display` stays (now points to Cormorant Garamond)
- Title size: `text-[clamp(36px,5vw,56px)]`
- Add italic subtitle with amber 60% opacity
- Replace `gradient-cinema-hero` → `gradient-noir-hero`
- Add amber divider line between title and body
- Update CTA buttons to NoirButton (already renamed in Task 4)
- Replace all `cinema-*` color classes with `noir-*`

- [ ] **Step 2: Update stats section**

- Numbers: `font-display text-noir-text stat-glow`
- Labels: `text-noir-text-muted uppercase tracking-[3px]`

- [ ] **Step 3: Update upcoming movies section**

- Section label: `text-amber/50 uppercase tracking-[4px]`
- Section title: `font-display text-noir-text`
- Card hover: remove `hover:scale-[1.03]`, add border glow transition
- Fade edge: `bg-gradient-to-l from-noir-bg to-transparent`

- [ ] **Step 4: Replace all remaining cinema-* classes**

Search and replace any remaining `cinema-` references.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/HomePage.tsx
git commit -m "feat: restyle HomePage hero, stats, and upcoming sections"
```

---

### Task 12: Restyle MoviesPage

**Files:**
- Modify: `frontend/src/pages/MoviesPage.tsx`

- [ ] **Step 1: Update movie cards and modal**

Read current file, then:
- Replace all `cinema-*` classes with `noir-*`
- Card: NoirCard styling (already renamed)
- Remove hover scale, add border glow transition
- Modal: use `grain-overlay` class
- Typography: font-display for titles, Sora for meta
- Schedule labels: amber accent

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/MoviesPage.tsx
git commit -m "feat: restyle MoviesPage with Noir Luxe theme"
```

---

### Task 13: Restyle SeatSelectPage

**Files:**
- Modify: `frontend/src/pages/SeatSelectPage.tsx`

- [ ] **Step 1: Update page layout**

Read current file, then:
- Replace all `cinema-*` classes
- Summary bar: `bg-noir-surface border-noir-border rounded-sm`
- Selected seats: `font-display text-noir-text`
- Hold timer label: `text-amber`
- CTA: NoirButton primary

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/SeatSelectPage.tsx
git commit -m "feat: restyle SeatSelectPage for Noir Luxe"
```

---

### Task 14: Restyle PaymentPage

**Files:**
- Modify: `frontend/src/pages/PaymentPage.tsx`

- [ ] **Step 1: Update payment UI**

Read current file, then:
- Replace all `cinema-*` classes
- Payment method buttons: NoirButton ghost variant, active gets amber border
- Section cards: NoirCard
- Confirmation CTA: NoirButton primary

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/PaymentPage.tsx
git commit -m "feat: restyle PaymentPage for Noir Luxe"
```

---

### Task 15: Restyle MyPage and sub-tabs

**Files:**
- Modify: `frontend/src/pages/MyPage.tsx`
- Modify: `frontend/src/components/mypage/ProfileTab.tsx`
- Modify: `frontend/src/components/mypage/HoldsTab.tsx`
- Modify: `frontend/src/components/mypage/ReservationsTab.tsx`

- [ ] **Step 1: Update MyPage.tsx**

Read current file, then:
- Tab navigation: amber underline active indicator
- Replace all `cinema-*` classes

- [ ] **Step 2: Update ProfileTab.tsx**

- Form inputs: `bg-noir-elevated border-noir-border rounded-none`
- Focus: `focus:border-amber/30 focus:ring-1 focus:ring-amber/15`
- Labels: `text-amber/50 uppercase tracking-[2px] text-[10px]`

- [ ] **Step 3: Update HoldsTab.tsx**

- Replace `cinema-*` classes, NoirCard/NoirButton already renamed

- [ ] **Step 4: Update ReservationsTab.tsx**

- Same pattern: replace `cinema-*` classes

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/MyPage.tsx frontend/src/components/mypage/
git commit -m "feat: restyle MyPage and sub-tabs for Noir Luxe"
```

---

### Task 16: Restyle auth and remaining pages

**Files:**
- Modify: `frontend/src/pages/LoginPage.tsx`
- Modify: `frontend/src/pages/SignupPage.tsx`
- Modify: `frontend/src/pages/NotFoundPage.tsx`
- Modify: `frontend/src/pages/ReservationsPage.tsx`
- Modify: `frontend/src/pages/ReservationDetailPage.tsx`
- Modify: `frontend/src/components/payment/PaymentSuccess.tsx`

- [ ] **Step 1: Update LoginPage.tsx**

Read current file, then:
- Form inputs: noir input styling (bg-noir-elevated, border-noir-border, focus amber)
- Card: NoirCard (already renamed)
- Button: NoirButton (already renamed)
- Replace all `cinema-*` classes
- Title: `font-display`

- [ ] **Step 2: Update SignupPage.tsx**

Same pattern as LoginPage.

- [ ] **Step 3: Update NotFoundPage.tsx**

- Replace `cinema-neon-red` with `text-amber`
- Update card/button (already renamed)

- [ ] **Step 4: Update ReservationsPage.tsx**

- Replace all `cinema-*` classes
- List items: noir styling

- [ ] **Step 5: Update ReservationDetailPage.tsx**

- Replace all `cinema-*` classes
- Detail sections: NoirCard

- [ ] **Step 6: Update PaymentSuccess.tsx**

- Replace all `cinema-*` classes
- Success icon/state: `text-noir-success`

- [ ] **Step 7: Verify full build**

```bash
cd frontend && npm run build
```

Expected: Clean build with zero warnings about undefined CSS classes.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/LoginPage.tsx frontend/src/pages/SignupPage.tsx frontend/src/pages/NotFoundPage.tsx frontend/src/pages/ReservationsPage.tsx frontend/src/pages/ReservationDetailPage.tsx frontend/src/components/payment/PaymentSuccess.tsx
git commit -m "feat: restyle auth, reservations, and payment success pages"
```

---

## Chunk 5: Final Verification & Cleanup

### Task 17: Search and destroy remaining cinema-* references

**Files:**
- Potentially any file in `frontend/src/` (excluding admin pages)

- [ ] **Step 1: Global search for remaining cinema- references in user-facing code**

```bash
cd frontend && grep -r "cinema-" src/ --include="*.tsx" --include="*.ts" --include="*.css" | grep -v "cinema-admin" | grep -v "node_modules"
```

Any remaining `cinema-` references (excluding `cinema-admin-*` tokens used by admin theme) must be replaced with their `noir-` equivalents.

- [ ] **Step 2: Fix any remaining references**

Update each file found in Step 1.

- [ ] **Step 3: Global search for old component names**

```bash
cd frontend && grep -r "NeonButton\|GlassCard\|gradient-cinema\|lightning-dark" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
```

Any remaining old names must be updated.

- [ ] **Step 4: Fix any remaining references**

Update each file found in Step 3.

- [ ] **Step 5: Full build + dev server verification**

```bash
cd frontend && npm run build && npm run dev
```

Navigate through all pages:
- `/` (HomePage)
- `/movies` (MoviesPage)
- `/login` (LoginPage)
- `/signup` (SignupPage)
- `/my` (MyPage)
- `/reservations` (ReservationsPage)

Verify: dark noir backgrounds, amber accents, Cormorant Garamond headings, Sora body text, grain textures, projector ambience glow, no neon blue remnants.

- [ ] **Step 6: Commit**

```bash
git add -A frontend/src/
git commit -m "fix: remove all remaining legacy cinema theme references"
```

---

### Task 18: Final commit — update README if referenced

**Files:**
- Modify: `frontend/src/components/common/README.md` (if it references NeonButton/GlassCard)

- [ ] **Step 1: Check and update README**

```bash
grep -l "NeonButton\|GlassCard\|neon\|glass" frontend/src/components/common/README.md frontend/src/components/booking/README.md frontend/src/components/payment/README.md 2>/dev/null
```

Update any documentation that references old component names or the old design system.

- [ ] **Step 2: Final commit**

```bash
git add -A frontend/src/
git commit -m "docs: update component documentation for Noir Luxe design system"
```

---

## Summary

| Chunk | Tasks | Focus |
|-------|-------|-------|
| 1 | Tasks 1-3 | Foundation: fonts, tokens, animations |
| 2 | Tasks 4-7 | Core components: NoirButton, NoirCard, NavBar, UI components |
| 3 | Tasks 8-10 | Layout + booking: MainLayout, SeatMap, SeatPreview3D |
| 4 | Tasks 11-16 | All pages: HomePage through auth pages |
| 5 | Tasks 17-18 | Cleanup: remove legacy references, verify |

**Total: 18 tasks, ~60-80 files modified**

**Dependencies:**
- Task 1-3 must complete before Tasks 4+
- Tasks 4-5 (rename) must complete before Tasks 6+ (pages reference new names)
- Tasks 6-10 are independent of each other
- Tasks 11-16 are independent of each other
- Task 17 depends on all prior tasks
