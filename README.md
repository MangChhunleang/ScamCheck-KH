# ScamCheck KH (ស្កែមឆែក ខេអេច)

ScamCheck KH is a mobile-first responsive full-stack web application designed to empower Cambodian users to identify, avoid, and navigate online scams. Operating with a "Khmer-First" design philosophy, it translates complex cybersecurity warning signs into clear, humble, and reassuring terms.

---

## Current Status: Production v1 Simplified Release
The application has been streamlined for **Production v1**, focusing strictly on core value propositions, extreme user-data privacy, ultimate ease of use, and robust API key safety. Highly technical, social, or unrequested secondary features have been removed or consolidated to offer a distraction-free, reassuring interface for normal Cambodian citizens.

---

## Core Features (Production v1)

1. **Text Scam Check (ស្កេនសារសង្ស័យ)**: Allows users to paste suspicious SMS, Telegram messages, investment pitches, or payment screenshots to assess threat risk.
2. **Link Safety Check (ពិនិត្យតំណភ្ជាប់)**: Parses hyperlinked domains to detect shortened URLs, fraudulent protocols, or spoofed banking/corporate URLs.
3. **Emergency Help (ជំនួយបន្ទាន់)**: Interactive categorized checklists advising users on critical, immediate action steps if they shared OTPs, sent money, clicked suspicious links, or were hacked.
4. **Scam Type Library (បណ្ណាល័យប្រភេទបោកប្រាស់)**: Mobile-optimized, scannable educational lessons detailing common tactics like Investment Scams, Fake Jobs, and Bank Phishing.
5. **Integrated Evidence Checklist**: A localized evidence checklist built directly into the Emergency details page, indicating what screenshots, chat histories, and transaction IDs to preserve.
6. **Bilingual Toggle**: Seamless Khmer/English language selector to reach all segments of Cambodian users.

### Simplified/Removed for Production v1
To maximize security and user clarity, the following features have been removed or consolidated:
* **Evidence Helper Page**: Replaced by a lightweight, embedded evidence checklist directly inside the relevant Emergency detail pages.
* **History Page**: Removed to prevent storing past inputs locally or on shared public profiles.
* **Report Scam Page**: Removed to focus purely on citizen warning, rather than law enforcement intake.
* **Save as Image / Share Card**: Removed along with the heavy `html2canvas` client library to ensure zero private text gets serialized into shared image assets.
* **Public Firestore Stats**: Denied public reads/lists to ensure maximum data protection.

---

## Tech Stack

- **Frontend**: React 18+, Vite, TypeScript, Tailwind CSS, Lucide React, Framer Motion.
- **Backend Server**: Node.js & Express (TypeScript compiled via tsx in dev, and esbuild into a bundled single CommonJS file inside `dist/server.cjs` for production).
- **Database**: Firebase Firestore (secure, administrator-only backend audit logs).
- **AI Processing**: Google Gemini API via the official `@google/genai` TypeScript SDK (used purely to generate reassuring explanations; threat assessments are strictly deterministic and rule-based).

---

## Privacy Engineering & Sanitization Design

ScamCheck KH is built around an **absolute zero raw user data leakage** architecture:
- **Redaction Prior to Storage/AI**: A robust client-side and server-side regex engine (`sanitizeText`) automatically scans all pasted texts, feedback comments, and inputs. It replaces sensitive fields using specific placeholders:
  - `[REDACTED_OTP]` for one-time passwords
  - `[REDACTED_PASSWORD]` for system credentials
  - `[REDACTED_PIN]` for 4-6 digit codes
  - `[REDACTED_PHONE]` for Cambodian and international phone numbers
  - `[REDACTED_EMAIL]` for email addresses
  - `[REDACTED_ID]` for national IDs or passports
  - `[REDACTED_BANK_INFO]` for bank accounts, cards, or transaction records
- **Zero Raw Data sent to Gemini**: The server-side Gemini system instruction receives only the pre-sanitized string. Raw user input never leaves the Node.js server container.
- **Database Anonymization**: All statistics and feedback logs saved to Firestore do not store raw sensitive parameters. All items are verified as sanitized.

---

## Firestore Production Security Rules

Our `firestore.rules` enforces maximum security using a strict schema check and validation blueprint:
- **`lessons`**: Public read-only (`allow read: if true;`), writable only by authenticated system Administrators (`allow write: if isAdmin();`).
- **`reports`**: Create-only for admin logs, read/write restricted to system Administrators (`allow read, write: if isAdmin();`).
- **`feedback`**: Anyone can create verified feedback documents, but normal users can never list or read them.
- **`scamChecks`**: Immutability is strictly enforced. Anyone can write sanitized scam check statistics, but normal users cannot list or read all checks.
- **`feedbackStats`**: Completely closed and disabled (`allow read, write: if false;`) to avoid any potential metric manipulation.

---

## Environment Variables

Create a `.env` file in the root directory to configure the production server:

```env
# Google Gemini API key for generating diagnostic explanations (Server-only secret)
GEMINI_API_KEY=your_gemini_api_key_here

# Mode
NODE_ENV=production
```

---

## How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file containing your `GEMINI_API_KEY`.

### 3. Run Development Server
```bash
npm run dev
```
The server will start on port `3000`. Open `http://localhost:3000` in your web browser.

---

## How to Build & Bundle

To compile both the React single-page application and the Express server for production:

```bash
npm run build
```
This script triggers:
1. `vite build` - Compiles the React frontend into static assets inside `/dist`.
2. `esbuild server.ts --bundle` - Bundles the custom Express backend into a single self-contained CommonJS Node module at `dist/server.cjs` for lightning-fast container startups and zero module resolution issues.

### Run Standalone Production Build
To start the production web application:
```bash
npm run start
```

---

## Research Sources

The repository includes **`RESEARCH_SOURCES.md`**, a documentation file used to
track reliable Cambodian scam intelligence and to guide safe improvements to the
rule-based analyzer over time. It records:

- Official bank safety pages (NBC / Bakong / KHQR, ABA, ACLEDA)
- Police / anti-cybercrime warnings
- News-based scam trend examples
- Anonymized user report patterns
- An analyzer rule changes log

This file helps improve the rule-based analyzer **safely**: research notes are
converted into abstract scam patterns (keywords, urgency phrasing, formatting
hooks) — never copied as real private user data. It is documentation only and
does not change `src/analyzer.ts` by itself. New rules are added later, after
careful review and after adding safe test samples to
`src/testSamples/privateAlphaSamples.ts` (validated with `npm run test:alpha`).

---

## Documentation

| File | Purpose |
| :--- | :--- |
| [`RESEARCH_SOURCES.md`](./RESEARCH_SOURCES.md) | Reliable Cambodian scam sources, scam patterns, and the analyzer rule-changes log. |
| [`PRIVATE_ALPHA_CHECKLIST.md`](./PRIVATE_ALPHA_CHECKLIST.md) | Manual QA checklist for private alpha (checker, analyzer, privacy, admin, mobile). |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Step-by-step private alpha deployment (Convex + frontend/server), env vars, smoke tests, troubleshooting. |
| [`RELEASE_NOTES.md`](./RELEASE_NOTES.md) | Private Alpha 0.1 release notes: features, analyzer coverage, privacy, known limitations, next ideas. |

---

## Disclaimer / លក្ខខណ្ឌប្រើប្រាស់
ឧបករណ៍នេះផ្តល់ការណែនាំសុវត្ថិភាពប៉ុណ្ណោះ មិនមែនជាសេចក្តីសម្រេចផ្លូវច្បាប់ ធនាគារ ឬប៉ូលីសទេ។ សូមផ្ទៀងផ្ទាត់ជាមួយប្រភពផ្លូវការជានិច្ច។
This tool gives safety guidance only. It is not a final legal, banking, or police decision. Always verify with official sources.
