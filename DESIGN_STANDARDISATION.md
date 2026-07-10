# Design Standardisation — Progress Tracker

> Tracking the phased rollout of design system standardisation across the reward-chart app.

## Phase Summary

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Foundation — Design Tokens & Utilities | ⬜ Not Started |
| 2 | Extend UI Component Library | ⬜ Not Started |
| 3 | Delete Showcase Files | ⬜ Not Started |
| 4 | Fix Animation Imports | ⬜ Not Started |
| 5 | Migrate Core Components | ⬜ Not Started |
| 6 | Migrate Secondary Components | ⬜ Not Started |
| 7 | Clean Up Theme System | ⬜ Not Started |

---

## Phase 1: Foundation — Design Tokens & Utilities
**Status:** ✅ Completed

**Scope:**
- Consolidate card classes (`duo-card` / `card-panel`) into single standard
- Add semantic colour tokens (`--color-text-primary`, `--color-text-muted`, etc.)
- Standardise neutral colours to `stone` palette
- Add `.modal-overlay` utility class
- Leave `[data-theme="playful_pop"]` rules untouched
- **Mobile utilities:**
  - Add `.touch-target` utility ensuring min 44×44px hit area
  - Add `.safe-area-bottom` utility for bottom padding (`env(safe-area-inset-bottom)`)
  - Add smooth scroll / overscroll behaviour on main viewport containers
  - Ensure base font size is readable on mobile (min 14px body text)

**Files:** `index.css`

---

## Phase 2: Extend UI Component Library
**Status:** ✅ Completed

**Scope:**
- Typography: add `h3`, `h4`, `caption`, `badge` variants
- Button: add `icon-sm` size, standardise colours to `stone`
- New `Card` component
- New `Modal` component
- New `Input` component
- New `BottomTabBar` component (shared mobile navigation)
- New `BoardingPassCard` component (extracted from ChildDashboard)

**Files:** `Typography.tsx`, `Button.tsx`, `Card.tsx` (new), `Modal.tsx` (new), `Input.tsx` (new), `BottomTabBar.tsx` (new), `BoardingPassCard.tsx` (new)

---

## Phase 3: Delete Showcase Files
**Status:** ✅ Completed

**Scope:**
- Delete 10 showcase files
- Remove showcase imports and `?showcase=` routes from `App.tsx`

**Files to delete:** `ButtonShowcase.tsx`, `TypographyShowcase.tsx`, `TaskCardShowcase.tsx`, `RewardCardShowcase.tsx`, `PotsShowcase.tsx`, `PlayerSelectionShowcase.tsx`, `IosTabBarShowcase.tsx`, `ChildCardShowcase.tsx`, `WellDoneShowcase.tsx`, `TabsShowcase.tsx`  
**Files to modify:** `App.tsx`

---

## Phase 4: Fix Animation Imports
**Status:** ✅ Completed

**Scope:**
- Change all `from 'framer-motion'` → `from 'motion/react'`

**Files:** `BadgesModal.tsx`, `ChildHomeTab.tsx`, `SettingsTab.tsx`, `TargetsTab.tsx`, `Tooltip.tsx`

---

## Phase 5: Migrate Core Components
**Status:** ⬜ Not Started

**Scope:**
- **ChildDashboard:**
  - Replace inline ticket markup with `<BoardingPassCard>`
  - Replace inline bottom tab bar with `<BottomTabBar>`
  - Add desktop sidebar nav matching parent dashboard (`lg:col-span-3`), move content to right (`lg:col-span-9`)
  - Replace 16 raw `<button>` with `<Button>`, adopt `<Typography>`, `<Card>`, `<Modal>`, `<Input>`, standardise colours
  - **Mobile:** Ensure all icon buttons meet 44px touch target, review mobile padding/spacing
- **ParentDashboard:**
  - Remove border from main content area (`card-panel` class)
  - Replace plain child cards with `<BoardingPassCard>`
  - Replace inline bottom tab bar with `<BottomTabBar>`
  - Replace 22 raw `<button>` with `<Button>`, adopt `<Typography>`, `<Card>`, `<Modal>`, `<Input>`, standardise colours
  - **Mobile:** Ensure all interactive elements meet 44px touch target, review modal sizing on mobile viewports

**Files:** `ChildDashboard.tsx`, `ParentDashboard.tsx`

---

## Phase 6: Migrate Secondary Components
**Status:** ⬜ Not Started

**Scope:**
- Standardise colour palette and adopt UI components across: AuthPage, LandingPage, LockScreen, ChildHomeTab, BadgesModal, LegalModal, all Onboarding steps
- **Mobile:** Ensure onboarding steps are full-width on mobile, inputs have adequate size/padding for touch

**Files:** `AuthPage.tsx`, `LandingPage.tsx`, `LockScreen.tsx`, `ChildHomeTab.tsx`, `BadgesModal.tsx`, `LegalModal.tsx`, `OnboardingWizard.tsx`, `StepCreateAccount.tsx`, `StepChildrenSetup.tsx`, `StepParentDetails.tsx`, `StepTasksSelection.tsx`, `StepRewardsSelection.tsx`, `StepHandover.tsx`

---

## Phase 7: Clean Up Theme System
**Status:** ⬜ Not Started

**Scope:**
- Simplify `THEME_PRESETS` class strings where values now come from CSS tokens
- Align remaining `slate`/`gray` references to `stone`

**Files:** `theme.ts`

---

## Completion Log

_Entries will be added below as each phase is completed._

- **Phase 1: Foundation — Design Tokens & Utilities**: Completed. Updated `index.css` with mobile utilities (`.touch-target`, `.safe-area-bottom`, `.modal-overlay`), standardised neutral colors to the `stone` palette, consolidated card classes to `card-panel`, and added input-field variants.
- **Phase 2: Extend UI Component Library**: Completed. Added variants to `Typography` and `Button`. Created new `Card`, `Modal`, `Input`, `BottomTabBar`, and `BoardingPassCard` components.
- **Phase 3: Delete Showcase Files**: Completed. Deleted 10 showcase files and removed all showcase imports/routes from `App.tsx`. Net -2162 lines.
- **Phase 4: Fix Animation Imports**: Completed. Migrated 5 files from `framer-motion` to `motion/react`: `BadgesModal.tsx`, `ChildHomeTab.tsx`, `SettingsTab.tsx`, `TargetsTab.tsx`, `Tooltip.tsx`.

# Standardise App Design System

The app has grown organically and now has significant styling inconsistencies across components. This plan takes a phased approach to unify the design language using the existing `ui/` component library and Tailwind v4 design tokens.

> [!NOTE]
> Each phase will be committed separately, and completion will be documented in the walkthrough as we go.

---

## Decisions

| Question | Decision |
|---|---|
| Colour palette | Standardise on **stone** — remove all `slate`, `gray`, `zinc` usage |
| Typography gaps | **Add variants**: `h3`, `h4`, `caption`, `badge` |
| Showcase files | **Delete** all 8 `*Showcase.tsx` files and their imports |
| Playful Pop theme | **Keep** — leave `playful_pop` CSS alone |
| THEME_PRESETS object | **Keep** — retain in `theme.ts` |
| Migration approach | **Phased** — full migration, one phase at a time |
| Child selection UI | **Keep** the boarding pass / ticket design — extract as shared component and reuse in ParentDashboard |
| Mobile optimisation | **Mobile-first** — this is a Capacitor iOS app, design mobile-first and ensure all screens feel native on phone; desktop is secondary |
| Parent dashboard border | **Remove** the `card-panel` class from the main content wrapper (`<main>` line 703) — content area should be borderless, not a white card |
| Child dashboard desktop nav | **Add sidebar** to child dashboard on desktop (`lg:`) matching parent dashboard layout — left sidebar with tab navigation, right column for content; mobile keeps floating bottom tab bar |

---

## Current State (Audit Findings)

### 1. **Colour Palette Fragmentation**
The design tokens in `index.css` define a clean OKLCH palette (`--color-primary`, `--color-danger`, etc.), but components use **3+ different colour systems** interchangeably:
- **Stone** palette (`text-stone-600`, `bg-stone-100`) — used in ~70% of components
- **Slate** palette (`text-slate-400`, `bg-slate-800`) — used in SettingsTab, ChildAvatar, Tooltip
- **Gray** palette (`text-gray-500`, `bg-gray-200`) — used in Onboarding steps, ParentDashboard borders
- **Hardcoded hex values** (`#0033A0`, `#FDF9F1`, `#D4AF37`, `#FDF6CD`) — scattered through ChildDashboard

### 2. **Button Inconsistency**
| Component | `<Button>` | Raw `<button>` |
|---|---|---|
| ParentDashboard | 27 | 22 |
| ChildDashboard | **0** | 16 |
| SettingsTab | 11 | 0 |

> [!IMPORTANT]  
> **ChildDashboard (2,974 lines, 182KB)** does not use the `<Button>` component at all.

### 3. **Typography Inconsistency**
| Component | `<Typography>` | Raw `<h1-4>`, `<p>`, `<span>` |
|---|---|---|
| ParentDashboard | **0** uses | 141 raw elements |
| ChildDashboard | 19 uses | 116 raw elements |
| SettingsTab | **0** uses | 35 raw elements |
| LandingPage | 2 uses | 30 raw elements |

### 4. **Card Pattern Duplication**
Three overlapping card utility classes:
- `.duo-card` — defined in `index.css` (border-2, rounded-3xl)
- `.card-panel` — defined in `index.css` (border-1, rounded-3xl, shadow-sm)
- `.dashboard-card` — no CSS definition, used only as a playful_pop theme hook

### 5. **Animation Import Split**
- `from 'motion/react'` — 11 files
- `from 'framer-motion'` — 5 files (BadgesModal, ChildHomeTab, SettingsTab, TargetsTab, Tooltip)

### 6. **Input Field Inconsistency**
`.input-field` utility exists but ParentDashboard uses lengthy inline classes instead.

### 7. **Mobile App Gaps**
The app runs as a Capacitor iOS app but has several mobile-specific issues:
- **Touch targets**: Some icon buttons are only `p-2` (~32px) — Apple HIG recommends minimum 44×44px
- **Bottom tab bar duplication**: Both ParentDashboard and ChildDashboard duplicate nearly identical bottom nav bar code (~40 lines each) instead of sharing a component
- **Modals on mobile**: All modals use centered cards (`max-w-sm` / `max-w-md`) — on phone screens these should be full-width bottom sheets or full-screen for complex forms
- **Font sizes**: Some labels use `text-[8px]` / `text-[9px]` which can be hard to read on mobile
- **Spacing**: Some panels use `p-2` on mobile which is cramped; inconsistent `px-4` vs `px-2` padding across screens
- **Scrolling**: Main content areas lack `-webkit-overflow-scrolling: touch` or `overscroll-behavior` for native-feeling scroll

---

## Proposed Changes

### Phase 1: Foundation — Design Tokens & Utilities

#### [MODIFY] [index.css](file:///Users/mdias9/myprojects/reward-chart/src/index.css)
- Consolidate card classes: keep `card-panel` as the single standard card class, remove or alias `duo-card`
- Add `.input-field` variants if needed (e.g. `.input-field-sm`)
- Standardise all neutral colours to the `stone` palette in the `@theme` block
- Add semantic tokens for common values (e.g. `--color-text-primary`, `--color-text-muted`, `--color-text-subtle`)
- Add modal overlay utility class `.modal-overlay`
- Leave all `[data-theme="playful_pop"]` rules untouched
- **Mobile utilities:**
  - Add `.touch-target` utility ensuring min 44×44px hit area
  - Add `.safe-area-bottom` utility for bottom padding (`env(safe-area-inset-bottom)`)
  - Add smooth scroll / overscroll behaviour on main viewport containers
  - Ensure base font size is readable on mobile (min 14px body text)

---

### Phase 2: Extend UI Component Library

#### [MODIFY] [Typography.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/ui/Typography.tsx)
- Add missing variants: `h3`, `h4`, `caption`, `badge`
- Ensure all variants use the standardised `stone` palette

#### [MODIFY] [Button.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/ui/Button.tsx)
- Review and tighten variant definitions
- Add `icon-sm` size for compact icon buttons (used heavily in ChildDashboard)
- Standardise colour references from `slate`/`gray` → `stone`

#### [NEW] [Card.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/ui/Card.tsx)
- Create a `Card` component wrapping the `card-panel` class with optional props for padding, border emphasis, etc.
- Include the `dashboard-card` class for playful_pop theme hook compatibility

#### [NEW] [Modal.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/ui/Modal.tsx)
- Create a `Modal` component that standardises the modal overlay + card pattern used repeatedly across ParentDashboard and ChildDashboard

#### [NEW] [Input.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/ui/Input.tsx)
- Create an `Input` component wrapping the `.input-field` class with label, helper text, and error state support

#### [NEW] [BottomTabBar.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/ui/BottomTabBar.tsx)
- Extract the duplicated mobile bottom navigation bar used by both dashboards into a shared component
- Props: `tabs` array (id, label, icon, badge?), `activeTab`, `onTabChange`, `layoutId` (for the animated pill)
- Enforces 44px minimum touch targets, proper safe-area bottom padding
- `lg:hidden` — only visible on mobile

#### [NEW] [BoardingPassCard.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/BoardingPassCard.tsx)
- Extract the "airline ticket" child selection card from [ChildDashboard.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/ChildDashboard.tsx) (lines ~1460–1578) into a standalone reusable component
- Props: `child`, `onClick`, `isLoading` (for skeleton state)
- Preserves the exact current design: blue header bar, passenger name, Flight/Gate/Seat fields, barcode, tear-off stub with boarding time/zone/class
- Will be used in **both** ChildDashboard and ParentDashboard for consistent child selection

---

### Phase 3: Delete Showcase Files

#### [DELETE] [ButtonShowcase.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/ButtonShowcase.tsx)
#### [DELETE] [TypographyShowcase.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/TypographyShowcase.tsx)
#### [DELETE] [TaskCardShowcase.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/TaskCardShowcase.tsx)
#### [DELETE] [RewardCardShowcase.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/RewardCardShowcase.tsx)
#### [DELETE] [PotsShowcase.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/PotsShowcase.tsx)
#### [DELETE] [PlayerSelectionShowcase.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/PlayerSelectionShowcase.tsx)
#### [DELETE] [IosTabBarShowcase.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/IosTabBarShowcase.tsx)
#### [DELETE] [ChildCardShowcase.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/ChildCardShowcase.tsx)
#### [DELETE] [WellDoneShowcase.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/WellDoneShowcase.tsx)
#### [DELETE] [TabsShowcase.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/TabsShowcase.tsx)

#### [MODIFY] [App.tsx](file:///Users/mdias9/myprojects/reward-chart/src/App.tsx)
- Remove all showcase imports (lines 14, 24–32)
- Remove all `?showcase=` route blocks (lines 37–75)

---

### Phase 4: Fix Animation Imports

#### [MODIFY] [BadgesModal.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/BadgesModal.tsx)
#### [MODIFY] [ChildHomeTab.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/ChildHomeTab.tsx)
#### [MODIFY] [SettingsTab.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/SettingsTab.tsx)
#### [MODIFY] [TargetsTab.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/TargetsTab.tsx)
#### [MODIFY] [Tooltip.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/ui/Tooltip.tsx)
- Change all `from 'framer-motion'` imports to `from 'motion/react'` for consistency

---

### Phase 5: Migrate Core Components

#### [MODIFY] [ChildDashboard.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/ChildDashboard.tsx)
- Replace inline ticket/boarding pass markup (lines ~1376–1578) with `<BoardingPassCard>` component
- Replace inline bottom tab bar with `<BottomTabBar>` component
- **Desktop layout:** Add `hidden lg:flex lg:flex-col lg:col-span-3` sidebar with the 5 child tabs (Home, Tasks, Prizes, Pet, Pots) matching the parent sidebar style — active item = dark pill, inactive = ghost; content renders in `lg:col-span-9` to the right
- **Desktop layout:** Change the 12-col companion/content split to use the new sidebar instead; companion panel moves into the main content area alongside the active tab
- **Mobile:** Keep the existing floating bottom tab bar (`lg:hidden`)
- Replace 16 raw `<button>` elements with `<Button>` component
- Replace hardcoded hex colours with design tokens
- Use `<Typography>` for headings and labels where raw `<h>` / `<span>` elements exist
- Use `<Card>` for card patterns
- Use `<Modal>` for modal patterns
- Use `<Input>` for form inputs
- Standardise all `slate`/`gray` → `stone`
- **Mobile:** Ensure all icon buttons meet 44px touch target, review mobile padding/spacing

#### [MODIFY] [ParentDashboard.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/ParentDashboard.tsx)
- **Remove border from main content area:** strip `card-panel` from `<main className="lg:col-span-9 card-panel ...">` (line 703) — content area should be transparent/borderless
- **Replace the plain child cards** (lines ~1063–1240) with `<BoardingPassCard>` component, adding parent-specific actions (edit, delete, adjustments, history) below or overlaid on the card
- Replace inline bottom tab bar with `<BottomTabBar>` component
- Replace 22 remaining raw `<button>` elements with `<Button>` component
- Replace raw text elements with `<Typography>` where appropriate
- Standardise all card renderings to use `<Card>`
- Replace inline modal patterns with `<Modal>`
- Replace inline input classes with `<Input>` or `.input-field`
- Unify colour usage from `slate`/`gray` → `stone`
- **Mobile:** Ensure all interactive elements meet 44px touch target, review modal sizing on mobile viewports

---

### Phase 6: Migrate Secondary Components

#### [MODIFY] [AuthPage.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/AuthPage.tsx)
- Standardise colour palette usage to `stone`

#### [MODIFY] [LandingPage.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/LandingPage.tsx)
- Replace raw text elements with `<Typography>`
- Standardise colour palette

#### [MODIFY] [LockScreen.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/LockScreen.tsx)
- Standardise colour palette

#### [MODIFY] [ChildHomeTab.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/ChildHomeTab.tsx)
- Use `<Card>` for card patterns, `<Typography>` for text

#### [MODIFY] [BadgesModal.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/BadgesModal.tsx)
- Use `<Modal>` wrapper, standardise colours

#### [MODIFY] [LegalModal.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/LegalModal.tsx)
- Use `<Modal>` wrapper

#### Onboarding Files
#### [MODIFY] [OnboardingWizard.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/Onboarding/OnboardingWizard.tsx)
#### [MODIFY] [StepCreateAccount.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/Onboarding/StepCreateAccount.tsx)
#### [MODIFY] [StepChildrenSetup.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/Onboarding/StepChildrenSetup.tsx)
#### [MODIFY] [StepParentDetails.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/Onboarding/StepParentDetails.tsx)
#### [MODIFY] [StepTasksSelection.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/Onboarding/StepTasksSelection.tsx)
#### [MODIFY] [StepRewardsSelection.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/Onboarding/StepRewardsSelection.tsx)
#### [MODIFY] [StepHandover.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/Onboarding/StepHandover.tsx)
- Standardise to `stone` palette, use `<Input>`, `<Card>`, `<Button>` components
- **Mobile:** Ensure onboarding steps are full-width on mobile, inputs have adequate size/padding for touch

---

### Phase 7: Clean Up Theme System

#### [MODIFY] [theme.ts](file:///Users/mdias9/myprojects/reward-chart/src/utils/theme.ts)
- Keep `THEME_PRESETS` but simplify class strings where values now come from CSS tokens
- Remove duplicated colour/class strings that overlap with what `index.css` tokens provide
- Align any remaining `slate`/`gray` references to `stone`

---

## Verification Plan

### Automated Tests
- `npm run lint` (TypeScript type checking) after each phase
- `npm run build` to verify no broken imports or missing references

### Manual Verification
- Run `npm run dev` and visually inspect each screen after every phase:
  - Landing page, Auth page, Onboarding flow
  - Parent dashboard (all tabs: approvals, children, tasks, rewards, settings)
  - Child dashboard (home, companion, tasks, rewards, pots tabs)
  - Lock screen, modals, overlays
- Verify playful_pop theme still works

### Mobile-Specific Verification
- Test at **375px width** (iPhone SE) and **390px** (iPhone 14/15) viewport sizes
- Verify all buttons/interactive elements are ≥44×44px touch targets
- Verify bottom tab bars have proper safe-area padding
- Verify modals are usable on small screens (not clipped, scrollable if needed)
- Verify text is readable — no text smaller than 11px on mobile
- Verify boarding pass cards scale correctly on narrow screens
- Check iOS Capacitor build if possible after Phase 5
