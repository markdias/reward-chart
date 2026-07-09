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
**Status:** ⬜ Not Started

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
**Status:** ⬜ Not Started

**Scope:**
- Delete 10 showcase files
- Remove showcase imports and `?showcase=` routes from `App.tsx`

**Files to delete:** `ButtonShowcase.tsx`, `TypographyShowcase.tsx`, `TaskCardShowcase.tsx`, `RewardCardShowcase.tsx`, `PotsShowcase.tsx`, `PlayerSelectionShowcase.tsx`, `IosTabBarShowcase.tsx`, `ChildCardShowcase.tsx`, `WellDoneShowcase.tsx`, `TabsShowcase.tsx`  
**Files to modify:** `App.tsx`

---

## Phase 4: Fix Animation Imports
**Status:** ⬜ Not Started

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
