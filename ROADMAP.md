# Quest Sync — Product Roadmap

## Current State
- Free tier with basic chore tracking
- Pro tier with extended features (multiple children, custom rewards, etc.)

---

## Roadmap

### ✅ Shipped
- Basic chore/task management
- Reward system
- Multiple children support
- Printable chore charts
- Authentication (Google Sign-In)
- Pro subscription tier

---

### 🔜 Near-Term (Next 1-3 Months)

#### General Polish & Stability
- Bug fixes and UX improvements from user feedback
- Performance optimisations

---

### 🚀 Future Features

#### AI Tier — Smart Chart Scanner
**Priority:** High  
**Monetisation:** New "Pro AI" subscription tier (above current Pro)

> Parent prints the weekly chore chart from the app, child completes tasks manually, parent takes a photo of the completed sheet — the app automatically reads the ticks and marks the correct tasks as done for that child.

**How it works:**
1. Parent taps "Scan Chart" (AI tier only)
2. Camera opens — parent photographs the completed paper chart
3. Image sent to **Gemini Vision API** with the child's task list as context
4. AI identifies which tasks are checked/ticked
5. Confirmation screen shown to parent before saving
6. Tasks marked as complete in the app

**Cost estimate:**
- Gemini Vision: < £0.10/user/year at ~52 scans
- Suggested AI tier price: +£1–2/month above Pro
- High margin, clear value proposition

**Technical work required:**
- [ ] Add "Pro AI" tier to subscription system (Stripe + DB)
- [ ] Gate "Scan Chart" feature behind AI tier
- [ ] Backend endpoint to receive image + child task list
- [ ] Gemini Vision API integration
- [ ] Confirmation/review UI before committing scanned results
- [ ] Printed chart format must remain consistent for reliable scanning

---

### 💡 Ideas Backlog (Unscheduled)

- Push notification reminders for incomplete tasks
- Streak tracking / gamification
- Parent dashboard with weekly summary emails
- Child-facing mobile app view
- In-app reward redemption tracking
