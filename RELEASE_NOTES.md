# ScamCheck KH — Release Notes

**Version:** Private Alpha 0.1
**Date:** 2026-06-29

ScamCheck KH (ឆែកមុនពេលជឿ) is a Khmer-first public-safety tool that helps
Cambodian users check suspicious messages and links, learn about common scams,
and get safety guidance — without ever storing their private data.

---

## A. Completed features

- **Khmer-first scam checker** with a Khmer / English toggle.
- **Rule-based scam detection** (deterministic; the analyzer makes every decision).
- **Risk score** (0–100) and **risk level** (Low / Medium / High).
- **Detected scam type** classification.
- **Bilingual explanations** (Khmer + English) for reasons and safe next steps.
- **Gemini explanation support** (optional) — rewords explanations only; falls back
  to built-in bilingual text when no API key is configured.
- **Recent Checks** stored in `localStorage` with a **sanitized preview only**.
- **Report Scam** flow (sanitized before storage).
- **Feedback** flow (Correct / Not correct + optional comment, sanitized).
- **Convex backend** for reports, feedback, lessons, and admin queries.
- **Admin Reports** page (review, mark reviewing/resolved, delete).
- **Admin Feedback** page (review user feedback).
- **Admin Insights** page (summaries, top scam types, warning signals, recent incorrect feedback).
- **Server-side admin passcode protection** (`ADMIN_PASSCODE` verified in Convex).
- **Research source tracking** (`RESEARCH_SOURCES.md`) with an analyzer rule-changes log.
- **Private alpha analyzer QA dataset** + runner (`npm run test:alpha`).
- **Responsive mobile polish** (mobile-first layout, safe-area handling, no horizontal overflow).

---

## B. Analyzer coverage

The rule-based analyzer currently covers:

- Bank / OTP scams
- Fake job / task-commission scams
- Online shopping scams
- Investment scams
- Suspicious links (including shortened links and bank phishing hooks)
- Prize scams
- Account security scams
- Normal / safe messages (kept low risk)

**QA status:**
- `npm run test:alpha` passes the current private alpha dataset (33 samples).
- `npx tsx src/analyzer.examples.ts` analyzer example tests pass.

---

## C. Privacy protections

- Full pasted messages are **never stored** (not in Convex, not in localStorage).
- Stored previews are **sanitized** before saving.
- OTP, PIN, password, card, bank, and ID-like data are **masked**
  (e.g. `[REDACTED_OTP]`, `[REDACTED_PIN]`, `[REDACTED_BANK_INFO]`).
- Reports and feedback store only **safe summaries** (sanitized previews / comments).
- Research notes and user reports should be converted into **abstract patterns**,
  never copied as real private user data.

---

## D. Admin tools

- `/admin/reports` — review and manage submitted scam reports.
- `/admin/feedback` — review user feedback on results.
- `/admin/insights` — aggregated summaries to guide analyzer improvements.
- Protected by a **server-side `ADMIN_PASSCODE`** (verified inside Convex).
- Admin routes are **hidden from the public bottom navigation** (reachable by URL only).

---

## E. Known limitations

- Rule-based detection can still be wrong (false positives / false negatives).
- Gemini explanations are **guidance only**, not authoritative.
- The tool is **not** legal, banking, police, or official verification.
- The admin passcode is acceptable for **private alpha**, but **real admin
  authentication** should be added before public production.
- The analyzer needs **more real-world Cambodian testing**.
- **Image / screenshot scam detection is not included** yet (text and links only).
- The app should **never** ask users to paste real OTP, PIN, password, bank
  account, or ID data.

---

## F. Next improvement ideas

- Real admin authentication (Clerk + Convex, or Convex Auth) instead of a shared passcode.
- More verified Cambodian scam sources in `RESEARCH_SOURCES.md`.
- More Khmer scam patterns in the analyzer.
- Analyzer tuning driven by Admin Insights (incorrect-feedback review).
- A public beta landing page.
- An organization / training version later.

---

*This tool gives safety guidance only. It is not a final legal, banking, or police decision. Always verify with official sources.*
