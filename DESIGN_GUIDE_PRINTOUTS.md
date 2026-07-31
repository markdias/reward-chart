# Quest Sync — Printable Assets Design Guide

This design guide defines the layout, color palettes, visual hierarchies, and structural mechanics for the printed board-game components of Quest Sync. Use these specifications to generate premium, high-fidelity HTML/CSS printouts.

---

## 🎨 Core Design Tokens & Rules

1. **Board-Game Aesthetic:** All printed assets must feel like parts of a premium physical board game (e.g., thick borders, decorative corners, rich gradients, and clean card styling).
2. **Strictly Gold Coins:** Do not mix copper, silver, and gold. All coins are gold-colored, with numbers indicating value.
3. **Dashed Guidelines:** Any asset that needs to be cut out must have a subtle, light-grey dashed border (`border: 2px dashed #d1d5db`). For circular assets like coins, the cutting lines must follow the circular contours of the shape.
4. **Print Optimization:** Use vector components (pure CSS shapes and inline SVGs) for maximum sharpness when printed. Avoid low-resolution raster images. Set CSS page sizes to A4/Letter dynamically.


---

## 🪙 1. The Quest Coins Sheet

A single-page grid of round tokens that children cut out.

```
   +---------------+
   |   ( 1 )  ( 1 )| <-- Gold-Bronze (Small)
   |   ( 5 )  ( 5 )| <-- Gold-Silver (Medium)
   |   (10)   (10) | <-- Pure Gold (Large)
   +---------------+
```

### Dimensions & Grid
* **Coins per Page:** A dense grid of 30-40 coins per A4/Letter page.
* **Denomination Sizes:**
  * **1-Coin:** 32px diameter (small).
  * **5-Coin:** 40px diameter (medium).
  * **10-Coin:** 48px diameter (large).
  * **20-Coin:** 54px diameter (extra large).
  * **50-Coin:** 60px diameter (jumbo).

### Styling Specs
* **Color Palette:** High-vibrancy gold gradients (`linear-gradient(135deg, #fbbf24 0%, #d97706 100%)`).
* **Borders:** Double-ring border. Outer ring is deep gold (`#b45309`), inner ring is light yellow (`#fef08a`).
* **Value Typography:** Bold, heavy serif or geometric sans (e.g., `font-family: 'Anybody', sans-serif`, extra bold, centered).
* **Emblems (Watermarks):**
  * `1` Coin: Small star outline.
  * `5` Coin: Small paw print.
  * `10` Coin: Diamond gem.
  * `20` Coin: Crown.
  * `50` Coin: Treasure chest.

---

## 🦖 2. The Fridge Companion Evolution Sheet

A portrait poster celebrating the pet's current evolution. Acts as the physical avatar on the fridge.

```
+--------------------------------------+
|             COMPANION NAME           |
|            [Stage 3: Rexy]           |
|                                      |
|              [  Large  ]             |
|              [  Cute   ]             |
|              [  Pet    ]             |
|              [  Art    ]             |
|                                      |
|  Level: 5              Type: Forest  |
+--------------------------------------+
```

### Layout Structure
* **Page Layout:** Portrait, full-page A4.
* **Top Header:** Companion Name in bold lettering. Beneath it, the active stage name in a pill badge (e.g., *"Stage 2: Baby Dino"*).
* **Centerpiece:** Large, high-resolution companion SVG illustration.
* **Footer HUD:** Left: Companion Level (e.g., `Level 5`). Right: Pet Type (e.g., `Type: Earth` or `Type: Magic`).
* **Note:** No progress bars, XP slots, or feeding bowls are included on this sheet. Growth is tracked purely by replacing the sheet when leveling up.

### Styling Specs
* **Background:** Soft, radial background gradient matching the pet type:
  * Dino: Light mint to soft emerald green.
  * Unicorn: Pastel pink to lilac lavender.
  * Bunny: Cosmic blue to soft nebula purple.
* **Framing:** 12px double-lined border surrounding the sheet with ornate corner decorations to give it a "diploma" or "quest scroll" feel.

---

## 🗂️ 3. The Foldable Pots Wallet

A craft layout that folds and tapes into a four-pocket vertical wallet on the fridge.

```
       +-------+
       |   G   | <-- Tape tab (top)
  +----+-------+----+
  | L  | Gold  | R  | <-- Fold lines on left/right tabs
  +----+-------+----+
       |   S   | <-- Savings pocket
       +-------+
```

### Dimensions & Craft Layout
* **Layout:** Landscape A4.
* **Craft Lines:**
  * Solid lines represent **Fold Lines**.
  * Dotted lines represent **Cut Lines**.
  * Grey shaded areas represent **Glue/Tape Tabs**.
* **Pocket Structure:** When folded and taped, it forms a vertical grid of 4 card pockets (width 100px, depth 40px each).

### Labeled Pockets
1. 🪙 **Gold Pot (Spending):** Yellow theme (`#fef08a` / `#f59e0b`).
2. 🐷 **Savings Pot (Saving):** Green theme (`#bbf7d0` / `#10b981`).
3. 🥣 **Food Pot (Feeding):** Blue theme (`#bfdbfe` / `#3b82f6`). Features a clear **Feed Pet QR Code** on the pocket front.
4. 🎁 **Gifting Pot (Giving):** Pink theme (`#fbcfe8` / `#ec4899`).

---

## 🎟️ 4. The Reward Quest Cards

Trading-card sized vouchers that children work toward.

```
+--------------------------------------+
| 🍕 Pizza Party Quest                 |
| +----------------------------------+ |
| |        (10)           (5)        | | <-- Coin slots
| +----------------------------------+ |
| Cost: 15 Coins                       |
|                                [QR]  | <-- QR Code
+--------------------------------------+
```

### Dimensions & Types
* **Dimensions:** 2.5" x 3.5" (standard trading card). Fits 8 cards per page.
* **Preset Reward Cards:**
  * Displays reward title, cost, and icon.
  * **Coin Slots:** Dotted circle outlines showing the physical coin values needed to purchase the card (e.g., a circle for `10` and a circle for `5`).
  * **QR Code:** Specific payload encoding: `questsync://redeem?rewardId=REWARD_ID&childId=CHILD_ID&cost=COST`.
* **Blank Reward Cards:**
  * Displays write-in lines for **Reward Title** and **Cost**.
  * Generates 5 generic circular slot outlines.
  * **QR Code:** Blank write-in QR payload: `questsync://redeem?rewardId=blank&childId=CHILD_ID`.

### Styling Specs
* **Borders:** Heavy 3px solid border (`#374151`) with a neon accent rim to look like rare trading cards.
* **Gradients:** Subtle grid patterns on backgrounds to feel high-tech yet physical.
