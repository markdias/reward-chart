# Phased Checklist: Quest Sync Token Economy

> [!IMPORTANT]
> This checklist is a live document. Each sub-phase will be marked as `[/]` when we start working on it, and `[x]` once it has been fully implemented, tested, and verified.
> Check this file at any time to monitor current progress or pick up where we left off.

We will build and verify this hybrid board-game experience in **5 distinct phases**. At the end of each phase, we will pause for verification and testing before moving to the next.

- `[x]` **Phase 1: Printable Assets Page**
  - `[x]` **Phase 1a:** Create the basic modal framework [PrintAssetsModal.tsx](file:///Users/mdias9/myprojects/reward-chart/src/components/PrintAssetsModal.tsx) and connect opening buttons to the Parent Dashboard.
  - `[x]` **Phase 1b:** Implement the printable **Quest Coins Sheet** layout (renders gold coins with values 1, 5, 10, 20, 50, cutting lines).

  - `[x]` **Phase 1c:** Implement the printable **Fridge Companion evolution sheet** (renders current pet illustration, stage name, level, no XP bar).


  - `[x]` **Phase 1d:** Implement the printable **Foldable Pots Wallet** craft sheet (folding pockets layout, colors, and Feed Pet QR Code).

  - **Testing 🧪:** Verify print layout responsiveness, print preview styling, and verify cut margins.

- `[x]` **Phase 2: Trading Card Rewards & QR Codes**
  - `[x]` **Phase 2a:** Set up dynamic QR Code generation using a clean inline generator or web API.
  - `[x]` **Phase 2b:** Design the printable **Preset Reward Card** template (trading-card layout, coin slots, and custom QR code).
  - `[x]` **Phase 2c:** Design the printable **Blank Reward Card** template (write-in title/cost lines, coin slots, and generic `rewardId=blank` QR code).
  - `[x]` **Phase 2d:** Add printing buttons for specific rewards in the Rewards list.
  - **Testing 🧪:** Print one specific reward and one blank reward, confirming card borders and QR codes display clearly.

- `[x]` **Phase 3: QR Scanner Integration**
  - `[x]` **Phase 3a:** Implement the toggle switcher header in `ScanChartModal` (**[Scan Chore Chart]** vs. **[Redeem Reward Card]**).
  - `[x]` **Phase 3b:** Add a canvas-based QR-code scanning parser that reads video/image stream frames.
  - `[x]` **Phase 3c:** Connect camera inputs and permissions for the new QR mode.
  - **Testing 🧪:** Toggle scanner to reward mode, verify camera starts, and confirm it decodes QR codes from screen or paper.

- `[x]` **Phase 4: Redemption Logic & Balance Verification**
  - `[x]` **Phase 4a:** Implement balance verification checks in database and state (insufficient balance handling).
  - `[x]` **Phase 4b:** Create the **Write-in Reward Form** popup in `ScanChartModal` for `rewardId=blank` scans.
  - `[x]` **Phase 4c:** Connect Supabase database mutations (deduct child coins, log `RewardRedemption`).
  - `[x]` **Phase 4d:** Add success sound triggers and overlay celebrations (confetti).
  - **Testing 🧪:** Scan a blank card (verify form prompts), scan with sufficient coins (verify points subtracted), scan with insufficient coins (verify error).

- `[ ]` **Phase 5: Starter Pack Signpost & Polish**
  - `[ ]` **Phase 5a:** Build the **Starter Pack Shipping Form** onboarding modal for subscribed parents.
  - `[ ]` **Phase 5b:** Add webhook hooks for auto-fulfillment.
  - `[ ]` **Phase 5c:** Final visual alignment, transitions, and UX polish.
  - **Testing 🧪:** End-to-end user verification (print coins/blank card -> fill with paper coins -> scan to redeem).
