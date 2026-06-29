# ScamCheck KH — Private Alpha QA Checklist

Use this checklist before sharing the app with private alpha testers (real
Cambodian users). Test in both **Khmer (ខ្មែរ)** and **English** where relevant,
and on a real mobile phone if possible.

Legend: ☐ = to test · ✅ = passed · ❌ = failed (note the issue)

---

## 1. Scam Checker Tests
- ☐ Paste a suspicious message → "Check Safety" returns a result.
- ☐ Empty input shows a validation message (does not call the API).
- ☐ Very long input (> 2,500 chars) is rejected with a clear message.
- ☐ Result page shows: risk level, risk score (0–100), detected type, confidence.
- ☐ Khmer ↔ English toggle changes all result text.
- ☐ "Check Another" returns to the input screen.
- ☐ Link Safety section appears when the message contains a URL.
- ☐ Gemini explanation loads; if Gemini is down, the rule-based fallback still shows.

## 2. Analyzer Tests
- ☐ Bank/OTP message (OTP, PIN, password, ABA/ACLEDA/Bakong) → Bank / OTP Scam, High.
- ☐ Fake job (registration fee, pay first, salary guaranteed) → Fake Job Scam, High.
- ☐ Investment (guaranteed profit, double money, daily income) → Investment Scam, High.
- ☐ Shopping (cheap price, limited stock, delivery fee, pre-order) → Online Shopping Scam.
- ☐ KHQR/payment (payment screenshot, slip, already paid) → KHQR / Payment Scam.
- ☐ Suspicious link (bit.ly, tinyurl, t.me, click link) → Suspicious Link.
- ☐ Normal friendly message → Normal Safe Message, Low, score 0.
- ☐ Confidence is High for many matching signals, Low for weak/few signals.
- ☐ Run `npx tsx src/analyzer.examples.ts` → all examples pass.
- ☐ Gemini never changes the risk score, level, or detected type (explanation only).

## 2b. Analyzer QA Dataset (Private Alpha)
- ☐ Run `npm run test:alpha` → review the pass/fail summary.
- ☐ All samples in `src/testSamples/privateAlphaSamples.ts` pass (Total / Passed / Failed).
- ☐ Review every failed case printed at the bottom of the output.
- ☐ Check for FALSE POSITIVES (safe/normal messages flagged as risky).
- ☐ Check for FALSE NEGATIVES (real scams marked Normal/Low).
- ☐ Confirm the 5 safe/normal samples stay Normal Safe Message / Low.
- ☐ When tuning analyzer weights, change them carefully and re-run `npm run test:alpha`.
- ☐ After any analyzer change, re-run `npm run lint` and `npm run build`.
- ☐ The dataset uses only FAKE placeholder data — no real OTPs, accounts, phones, or IDs.

## 2c. Research Source Review
- ☐ Review `RESEARCH_SOURCES.md` before adding any new analyzer rules.
- ☐ Confirm each source is reliable (official bank, police/anti-cybercrime, reputable news, or anonymized user report).
- ☐ Extract scam PATTERNS only — never copy private data (OTP, PIN, password, account, phone, ID).
- ☐ Add safe Khmer AND English test samples to `src/testSamples/privateAlphaSamples.ts`.
- ☐ Run `npm run test:alpha` and review pass/fail.
- ☐ Run `npm run lint`.
- ☐ Run `npm run build`.
- ☐ Only after the above: implement the rule in `src/analyzer.ts` and record a row in the Analyzer Rule Changes Log.

## 3. Privacy Tests (CRITICAL)
- ☐ Paste a message containing a fake OTP (e.g. 123456) → it is NOT stored anywhere readable.
- ☐ Recent Checks preview shows redaction markers ([REDACTED_OTP], etc.), not raw secrets.
- ☐ Report description with OTP/PIN/password/ID/bank/card → stored as sanitized preview only.
- ☐ Feedback comment with sensitive data → stored sanitized.
- ☐ Confirm Convex `scamChecks`, `feedback`, `reports` never contain the full pasted message.
- ☐ Confirm phone numbers, emails, and card numbers are masked.
- ☐ localStorage (`scamcheck_kh_history`) contains ONLY:
      id, inputPreview, detectedType, riskLevel, riskScore, detectedSignals, createdAt.
- ☐ No full original message in localStorage.

## 4. Report Tests
- ☐ Submit a report with all fields → success screen appears.
- ☐ Missing scam type / platform / description → clear validation error.
- ☐ Privacy warning is visible ("Do not include OTP, password, PIN, ID...").
- ☐ Description over the limit is rejected.
- ☐ Optional contact field works and can be left blank.
- ☐ Submitted report appears in Admin → Reports.
- ☐ Offline / Convex unreachable → shows an error, form stays usable.

## 5. Feedback Tests
- ☐ "Correct" saves immediately and shows: "Thanks, your feedback was saved."
- ☐ "Not correct" reveals the optional comment box + "Submit Feedback".
- ☐ Submitting feedback shows the success message and locks the form.
- ☐ On save failure: shows "Could not save feedback. Please try again." and stays retryable.
- ☐ Feedback appears in Admin → Feedback.
- ☐ Khmer and English wording both correct.

## 6. Admin Reports Tests (`/admin/reports`)
- ☐ Wrong passcode → "Incorrect passcode."
- ☐ Correct passcode → reports load.
- ☐ Loading state shows "Loading reports...".
- ☐ Empty state shows "No reports yet.".
- ☐ Mark as reviewing / resolved updates the status badge (amber/navy/green).
- ☐ Delete removes the report (after confirm).
- ☐ Load failure shows "Could not load data. Please try again.".
- ☐ Action failure shows "Could not save. Please try again.".
- ☐ "Lock" returns to the passcode screen.

## 7. Admin Feedback Tests (`/admin/feedback`)
- ☐ Passcode gate works (session shared with /admin/reports).
- ☐ Loading state shows "Loading feedback...".
- ☐ Empty state shows "No feedback yet.".
- ☐ Each card shows: verdict, detected type, risk level, score, preview, comment, date.
- ☐ Correct vs Not-correct counts are accurate.

## 8. Admin Insights Tests (`/admin/insights`)
- ☐ Loading state shows "Loading insights...".
- ☐ Empty state shows "Not enough data yet.".
- ☐ Reports summary counts (total / new / reviewing / resolved) match reality.
- ☐ Feedback summary counts and incorrect % are correct.
- ☐ Most Common Scam Types (top 5) shown with counts.
- ☐ Most Common Warning Signals (top 10) shown with counts.
- ☐ Recent Incorrect Feedback (newest 10) shows preview + comment + date.
- ☐ Refresh re-fetches data.
- ☐ Sub-nav (Reports / Feedback / Insights) navigates correctly.

## 9. Mobile UI Tests (test at 375px, 390px, 414px)
- ☐ No horizontal scrolling on any page.
- ☐ Bottom navigation (5 items) fits without overlap; labels readable.
- ☐ Tap targets are at least ~44–48px.
- ☐ Khmer text wraps cleanly (no overflow / clipping).
- ☐ Result cards are not cramped; text is readable.
- ☐ Admin cards (mobile) are readable; tables become cards.
- ☐ Buttons and inputs are comfortably tappable.
- ☐ Language toggle reachable on mobile header.

## 9b. Mobile Responsive QA
Test the app at each width (DevTools device toolbar) and verify smoothness:
- ☐ Test at **320px**, **360px**, **375px**, **390px**, **414px**, **430px** (and 768px / desktop).
- ☐ Confirm NO horizontal scrolling on any page (body never scrolls sideways).
- ☐ Confirm the bottom nav does NOT cover page content (safe-area bottom padding applied).
- ☐ Confirm Khmer text wraps cleanly — no clipping, no overflow, comfortable line-height.
- ☐ Confirm the Result page is readable: risk card fits, badge/score don't overflow,
      warning-signal chips wrap, long scam-type names wrap, feedback section not cramped.
- ☐ Confirm long links/URLs on the Result page break instead of overflowing.
- ☐ Confirm admin pages use cards on mobile (no wide tables); previews/comments wrap.
- ☐ Confirm the admin sub-nav (Reports/Feedback/Insights) scrolls horizontally if tight.
- ☐ Confirm the Report form is usable: full-width inputs, wrapping platform chips,
      comfortable textarea, full-width submit, readable privacy warning.
- ☐ Confirm tap targets (nav, buttons, action icons) are easy to press (~44px+).
- ☐ Confirm focus rings are visible when tabbing with a keyboard.
- ☐ Confirm the form does not jump awkwardly after submitting feedback/report.

## 10. Accessibility Basics
- ☐ All form fields have associated labels.
- ☐ Icon-only buttons have aria-labels (delete, clear, refresh, nav).
- ☐ Visible focus ring on keyboard navigation (Tab).
- ☐ Color contrast is readable (risk colors, badges, body text).
- ☐ Disabled buttons are visibly disabled and not clickable.
- ☐ Active nav item is announced (aria-current).

## 11. Deployment / Env Checks
- ☐ `npm run lint` passes (tsc --noEmit, 0 errors).
- ☐ `npm run build` passes (vite build + server bundle).
- ☐ `npx convex dev --once` deploys functions with no schema errors.
- ☐ Frontend `.env`: `VITE_CONVEX_URL` set to the correct deployment.
- ☐ Convex server env: `ADMIN_PASSCODE` set (strong value) via `npx convex env set`.
- ☐ `GEMINI_API_KEY` set on the server (or fallback explanations verified).
- ☐ `VITE_ADMIN_PASSCODE` is NOT used for authorization (server-side only).
- ☐ Admin routes are NOT linked in the public bottom navigation.
- ☐ `.env.local` is git-ignored (no secrets committed).
- ☐ Admin pages reject access without the correct server passcode.

---

### Notes / Issues found
> Record any failures here with steps to reproduce, device, and width.
