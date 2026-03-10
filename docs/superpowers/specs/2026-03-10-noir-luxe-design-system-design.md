# Noir Luxe Design System — Cinema Frontend Renewal

**Date:** 2026-03-10
**Scope:** User-facing frontend only (Admin theme excluded)
**Approach:** Token-First Cascade — design tokens first, then components, then pages

---

## 1. Design Direction

**Cinematic Noir Luxe** — deep black + amber gold accent, grain texture, serif-forward typography, restrained decoration. Translates the physical ambience of a luxury cinema into digital form. Weight through whitespace, elegance through restraint.

---

## 2. Color System

### Backgrounds (4-tier depth)

| Token | Hex | Usage |
|-------|-----|-------|
| `noir-bg` | `#06060A` | Root background, deepest layer |
| `noir-surface` | `#0D0D0D` | Cards, sections, content containers |
| `noir-elevated` | `#161616` | Modals, overlays, elevated surfaces |
| `noir-hover` | `#1E1E1E` | Hover/active states on surfaces |

### Amber Warm Accent Scale

| Token | Value | Usage |
|-------|-------|-------|
| `amber` | `#E8A849` | Primary accent, CTA, active indicators |
| `amber-hover` | `#D4963E` | Button hover state |
| `amber-ghost` | `rgba(232,168,73, 0.15)` | Ghost button background, tags |
| `amber-subtle` | `rgba(232,168,73, 0.06)` | Subtle highlights, card tints |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `danger` | `#C44040` | Errors, reserved seats, destructive actions |
| `success` | `#4A9E6E` | Available seats, success states |
| `info` | `#5B7DB8` | My hold seats, informational |
| `warning` | `#D49248` | Warnings, caution states (warmer orange-amber, distinct from amber-hover) |
| `blocked` | `#3A3A3A` | Blocked/disabled seats, inactive elements |
| `cancelled` | `#6B6B6B` | Cancelled items, greyed-out states |

### Seat Status → Color Mapping

| Seat Status | Token | Visual |
|-------------|-------|--------|
| `AVAILABLE` | `success` | `#4A9E6E` solid |
| `HOLD` (mine) | `info` | `#5B7DB8` + glow ring |
| `HOLD` (other) | `amber` | `#E8A849` solid |
| `RESERVED` | `danger` | `#C44040` solid |
| `PAYMENT_PENDING` | `warning` | `#D49248` solid |
| `CANCELLED` | `cancelled` | `#6B6B6B` solid |
| `BLOCKED` | `blocked` | `#3A3A3A` + dashed border |
| `DISABLED` | `blocked` | `#3A3A3A` 50% opacity |

### Text Hierarchy

| Level | Value | Usage |
|-------|-------|-------|
| Primary | `#F5F0E8` | Headings, important text (cream white) |
| Secondary | `rgba(245,240,232, 0.6)` | Body text, descriptions |
| Muted | `rgba(245,240,232, 0.35)` | Meta info, timestamps, captions |
| Accent | `#E8A849` | Labels, category tags, active states |

### Border & Glass (replacing glassmorphism)

| Element | Value |
|---------|-------|
| Default border | `rgba(232,168,73, 0.08)` |
| Hover border | `rgba(232,168,73, 0.2)` |
| Hover glow | `box-shadow: 0 4px 32px rgba(232,168,73, 0.06)` |
| Divider line | `rgba(232,168,73, 0.1)` |

---

## 3. Typography

### Font Pairing

| Role | Font | Weights |
|------|------|---------|
| **Display** | Cormorant Garamond | 300 (light), 400 (regular), 600 (semibold), 300i (light italic) |
| **Body** | Sora | 300 (light), 400 (regular), 500 (medium), 600 (semibold) |

### Type Scale (Desktop → Mobile)

Desktop-first values. Mobile (< 768px) uses the smaller size via `clamp()`.

| Element | Font | Desktop | Mobile | Weight | Extra |
|---------|------|---------|--------|--------|-------|
| Hero title | Cormorant | 56px | 36px | 600 | `clamp(36px, 5vw, 56px)` |
| Hero subtitle | Cormorant | 40px | 24px | 300 italic | amber 60%, `clamp(24px, 3.5vw, 40px)` |
| Section title | Cormorant | 28px | 22px | 400 | — |
| Card title | Cormorant | 20px | 18px | 600 | — |
| Body | Sora | 14px | 13px | 300 | line-height 1.7 |
| Label | Sora | 10px | 9px | 500 | letter-spacing 3px, uppercase |
| Button | Sora | 11px | 10px | 600 | letter-spacing 3px, uppercase |
| Meta | Sora | 12px | 11px | 300 | muted opacity |

### Replaces

- `Bebas Neue` → `Cormorant Garamond` (display)
- `Roboto` → `Sora` (body)

---

## 4. Component Design

### Buttons (NeonButton → NoirButton)

- **border-radius: 0** (sharp edges, no rounding)
- **letter-spacing: 3px**, uppercase, Sora font
- 4 variants:
  - **Primary:** `bg-amber`, `color-noir-bg`, hover adds amber glow shadow
  - **Ghost:** transparent, amber border 0.3 opacity, hover brightens border + subtle glow
  - **Danger:** transparent, danger border 0.3 opacity, hover brightens + red glow
  - **Subtle:** `bg rgba(245,240,232, 0.04)`, muted text, hover brightens

### Cards (GlassCard → NoirCard)

- **border-radius: 2px** (near-sharp)
- `bg-noir-surface`, border `amber-subtle` opacity
- Grain texture overlay (fractal noise SVG, 3% opacity)
- Hover: border brightens to 0.2, amber glow shadow appears
- No scale transform on hover — light only feedback
- Poster area: dark gradient overlay from bottom

### Navigation Bar

- Sticky, `bg rgba(6,6,10, 0.85)` with `backdrop-filter: blur(12px)`
- Bottom border: `rgba(232,168,73, 0.06)`
- Logo: Cormorant Garamond, 18-22px, semibold
- Links: Sora 10-11px, letter-spacing 2px, uppercase, muted
- Active link: amber color + 1px amber underline with `box-shadow: 0 0 8px rgba(232,168,73, 0.4)`
- User avatar: circular, amber-ghost background with amber border

### Modal

- Backdrop: `rgba(6,6,10, 0.8)` + `backdrop-filter: blur(8px)`
- Container: `bg-noir-surface`, border `rgba(232,168,73, 0.1)`, border-radius 2px
- Grain overlay
- Shadow: `0 8px 48px rgba(0,0,0,0.6), 0 0 1px rgba(232,168,73, 0.2)`
- Header: Sora label (amber, uppercase) + Cormorant title
- Footer: amber divider line above buttons

### Toast Notifications

- `bg-noir-surface`, semantic border color at 0.3 opacity
- Left 3px color bar (full semantic color)
- border-radius: 2px
- Sora 13px body text in semantic color
- No icons — color bar is the visual indicator

### Pagination

- Sora, muted text, amber active state
- Minimal — number + prev/next only

### Loading Spinner

- Amber border spinner replacing neon-blue
- Thin line style (2px border)

### Empty State

- Cormorant title + Sora description
- Amber accent for optional CTA

### Form Inputs (Login/Signup pages)

- `bg-noir-elevated` (#161616), border `rgba(232,168,73, 0.08)`, border-radius 0
- Text: `#F5F0E8`, placeholder: `rgba(245,240,232, 0.25)`
- Focus: border `rgba(232,168,73, 0.3)` + `box-shadow: 0 0 0 1px rgba(232,168,73, 0.15)`
- Height: 44px minimum (touch target)
- Sora 14px, font-weight 300
- Label above input: Sora 10px, letter-spacing 2px, uppercase, amber 50% opacity

### Links

- Default: `#E8A849` (amber)
- Hover: `#D4963E` (amber-hover) + underline
- Visited: same as default (no purple)

---

## 5. Animation System — Cinematic Orchestration

### Easing Curves

| Name | Cubic Bezier | Character |
|------|-------------|-----------|
| `filmEnter` | `[0.0, 0.0, 0.2, 1.0]` | Slow start → natural settle. Curtain rise. |
| `filmExit` | `[0.4, 0.0, 1.0, 1.0]` | Quick departure. Scene cut decisiveness. |
| `filmAccent` | `[0.16, 1.0, 0.3, 1.0]` | Overshoot spring. Seat selection feedback. |
| `filmDramatic` | `[0.0, 0.0, 0.0, 1.0]` | Extreme slow start → explosive arrival. Hero text. |

### Page Entry — "Opening Credits"

```
0ms    — background fade in (600ms, filmDramatic)
200ms  — top label text fade + slideUp (400ms, filmEnter)
400ms  — main title char-by-char stagger (50ms gap, 600ms each, filmDramatic)
700ms  — divider line expand left→right (500ms, filmEnter)
900ms  — body/meta fade in (400ms, filmEnter)
1100ms — CTA buttons fade + subtle scaleIn (300ms, filmEnter)
```

### Page Transition — "Scene Cut"

- Exit: opacity 1→0, y: 0→-12, 250ms filmExit
- Enter: 50ms delay, then Opening Credits sequence

### Modal — "Spotlight"

- Open: backdrop blur 0→8 (300ms), modal scale 0.97→1 + fade (350ms at 100ms delay), inner content stagger 100ms
- Close: modal scale 1→0.98 + fade (200ms), backdrop fade (200ms at 100ms delay)

### Card Hover — "Projector Focus"

- Border color transition 300ms
- Box shadow amber glow 400ms
- No scale transform — light-based feedback only

### Seat Selection — "Curtain Call"

- Select: color transition 200ms, amber glow ring pulse scale 1→1.3→1 (400ms filmAccent), info slideUp at 100ms
- Release: glow fade 200ms, color revert 200ms

### Kinetic Typography — "Title Sequence"

- Hero title: char-by-char opacity 0→1 + y 8→0, 50ms stagger, filmDramatic curve
- Italic subtitle: full fade, slightly delayed timing

### Principles

- **No bounce/elastic** — films don't bounce
- **Longer durations** — 300-700ms (up from 200-400ms)
- **Wider stagger gaps** — 100-200ms (up from 30-50ms)
- **No hover scale** — replaced by light/opacity feedback
- **prefers-reduced-motion** — all sequences collapse to instant fade

---

## 6. Visual Effects

### Replaces lightning-dark (cursor-tracking neon glow)

New effect: **Projector Ambience** — static atmospheric layers:

1. **Projector light leak** — radial gradient from top-center, `rgba(232,168,73, 0.05)`, ellipse shape, 400px wide
2. **Side vignette** — radial gradient darkening edges, `rgba(6,6,10, 0.4)` at periphery
3. **Grain texture** — CSS pseudo-element (`::after`) on containers, using inline SVG `feTurbulence` as `background-image` (baseFrequency 0.65, numOctaves 3, stitchTiles), 3% opacity, `pointer-events: none`. Applied per-component on NoirCard and Modal, plus one full-page overlay on MainLayout
4. **Bottom fog** — linear gradient from bottom, `rgba(6,6,10, 0.95)` fading to transparent

### Poster Overlay

- Gradient from bottom: `rgba(6,6,10, 0.7)` → transparent at 50%
- Hover: opacity reduces to show more poster

### Hero Text Glow (replaces neon text-shadow)

```css
text-shadow: 0 0 20px rgba(232,168,73, 0.15), 0 4px 12px rgba(0,0,0, 0.5);
```

### Stat Glow (replaces stat-glow)

```css
text-shadow: 0 0 16px rgba(232,168,73, 0.2);
```

### Screen Indicator (seat selection page)

- Horizontal line with amber gradient: `transparent → 0.4 → 0.6 → 0.4 → transparent`
- `box-shadow: 0 0 16px rgba(232,168,73, 0.2)` for projector beam effect

---

## 7. Page Layouts

### HomePage

- **Hero:** Full-width, projector ambience background. Cormorant large title + italic subtitle. Amber divider. Sora body. Primary + Ghost CTA buttons. Right-side stats column (Cormorant numbers + Sora labels).
- **Upcoming section:** Amber label + Cormorant section title. Horizontal scroll NoirCards. Right fade edge (linear-gradient mask from `noir-bg` to transparent, 80px wide). Scroll-snap behavior preserved from current implementation.
- **Recent reservations:** List with NoirCard styling or CTA to browse.

### MoviesPage

- Horizontal scroll grid with NoirCards (poster + title + meta)
- Modal detail view with Opening Credits entry animation
- Schedule list with amber time labels

### SeatSelectPage

- Amber glow screen indicator at top
- Seat grid with semantic color coding (Success/Info/Warning/Danger/Blocked)
- My Hold seats get subtle glow ring (`box-shadow`)
- Bottom summary bar: selected seat info (Cormorant) + hold timer (Sora amber) + CTA

### PaymentPage

- NoirCard sections for reservation info
- Payment method buttons (Ghost variant, active gets amber border)
- Confirmation CTA (Primary button)

### MyPage

- Tab navigation with amber underline active indicator
- Profile/Holds/Reservations tabs with fade transitions
- NoirCard list items

---

## 8. Files Affected

All paths below are relative to `frontend/`.

### Core Design System
- `src/index.css` — all color tokens, font declarations, utility classes, keyframes, effects
- `src/lib/animations.ts` — all Framer Motion variants and transitions
- `src/lib/transitions.ts` — page/modal transition configs

### Components
- `src/components/common/NeonButton.tsx` → rename & restyle to NoirButton
- `src/components/common/GlassCard.tsx` → rename & restyle to NoirCard
- `src/components/common/NavigationBar.tsx` — colors, fonts, effects
- `src/components/common/ui/Modal.tsx` — backdrop, border, grain, shadow
- `src/components/common/ui/ConfirmDialog.tsx` — variant colors
- `src/components/common/ui/Toast.tsx` — color bar, border, text colors
- `src/components/common/ui/LoadingSpinner.tsx` — amber border
- `src/components/common/ui/EmptyState.tsx` — typography, colors
- `src/components/common/ui/Pagination.tsx` — amber active state

### Booking Components
- `src/components/booking/SeatMap.tsx` — seat status colors, hover effects, screen indicator
- `src/components/booking/SeatPreview3D.tsx` — perspective colors, glow effects
- `src/components/booking/HoldTimer.tsx` — amber/danger color states

### Pages
- `src/pages/HomePage.tsx` — hero section, projector ambience, stats, typography
- `src/pages/MoviesPage.tsx` — card styling, modal entry animation
- `src/pages/SeatSelectPage.tsx` — summary bar, layout adjustments
- `src/pages/PaymentPage.tsx` — method buttons, card styling
- `src/pages/MyPage.tsx` — tab navigation styling
- `src/pages/LoginPage.tsx` — form inputs, NoirCard, NoirButton
- `src/pages/SignupPage.tsx` — form inputs, NoirCard, NoirButton
- `src/pages/NotFoundPage.tsx` — typography, colors
- `src/pages/ReservationsPage.tsx` — NoirCard list, colors (if exists)
- `src/pages/ReservationDetailPage.tsx` — NoirCard, typography (if exists)

### Sub-components (within pages)
- `src/components/mypage/ProfileTab.tsx` — form styling, colors
- `src/components/mypage/HoldsTab.tsx` — list styling, colors
- `src/components/mypage/ReservationsTab.tsx` — list styling, colors
- `src/components/payment/PaymentSuccess.tsx` — success state styling
- `src/components/movie/*` — any movie-specific sub-components (if exists)

### Barrel Exports (update renames)
- `src/components/common/index.ts` — NeonButton → NoirButton, GlassCard → NoirCard exports
- `src/components/common/ui/index.ts` — if exists, update exports

### Layout
- `src/layouts/MainLayout.tsx` — lightning-dark → projector ambience
- `src/components/common/PageTransition.tsx` — transition config updates

### Static
- `index.html` — Google Fonts link update (Cormorant Garamond + Sora)

### Rename Strategy

Rename NeonButton → NoirButton and GlassCard → NoirCard in a single pass: rename files, update all import references across the codebase, and update barrel exports. No backward-compatibility aliases — clean break.

---

## 9. Out of Scope

- Admin theme (stays as current light theme)
- Backend API changes
- Flutter mobile app
- New features or functionality changes
- Accessibility improvements beyond current level (prefers-reduced-motion maintained)
