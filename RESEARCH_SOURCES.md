# ScamCheck KH — Research Sources & Pattern Tracking

> **Purpose / គោលបំណង**
>
> This file tracks reliable Cambodian scam information, real-world scam patterns,
> and analyzer rule changes over time. It is the single place to record where
> threat intelligence comes from and how it is turned into safe detection rules.
>
> **Research notes must be converted into safe, abstract patterns — never copied
> as real private user data.** Strip away victim names, real OTPs, real PINs, real
> passwords, real account numbers, real phone numbers, and real national IDs.
> Keep only the behavioral script, urgency phrasing, and formatting hooks.
>
> *(ឯកសារនេះប្រើសម្រាប់កត់ត្រាប្រភពព័ត៌មានបោកប្រាស់ដែលអាចទុកចិត្តបាន ទម្រង់នៃការបោកប្រាស់ និងប្រវត្តិនៃការផ្លាស់ប្តូរ Rule វិភាគ។ សូមបំប្លែងកំណត់ត្រាទៅជាទម្រង់សុវត្ថិភាព មិនមែនចម្លងទិន្នន័យឯកជនពិតប្រាកដឡើយ។)*

This file does **not** change the analyzer by itself. It is documentation only.
New rules are added to `src/analyzer.ts` later, after careful review and after
adding safe test samples to `src/testSamples/privateAlphaSamples.ts`.

---

## 🔄 Research & Rule Implementation Workflow

When new scam trends are identified, follow this pipeline to translate raw
intelligence into safe, high-performing analyzer rules:

1. **Collect Intelligence** — gather scam data from official channels, trusted
   media, or anonymized user submissions.
2. **Extract Patterns, Not Data** — remove all private victim data (names, real
   phone numbers, real transaction hashes, specific amounts). Focus only on the
   behavioral script, urgency phrases, and formatting hooks.
3. **Dual-Language Keyword Extraction** — isolate both Khmer and English
   keywords/phrases commonly used in the scam template.
4. **Assign Risk Weights**
   - `CRITICAL` — direct credential/OTP harvesting, impersonation of central
     bank infrastructure.
   - `HIGH` — urgent task-based lottery, unregistered loan links.
   - `MEDIUM` — suspicious unverified sweepstakes or high-yield messaging.
5. **Draft Safe Test Samples** — use explicitly fake placeholder data
   (e.g. `012-XXX-XXX`, `9999-9999-9999`, `user_test_otp`).
6. **Execute Validation Suite** — run `npm run test:alpha` locally to verify.
7. **Evaluate False Boundaries** — review potential false positives (blocking
   legitimate marketing text) and false negatives (missing minor layout
   variations) before merging the rule.

> **ខ្មែរ:** ប្រមូលព័ត៌មាន → ស្រង់យកតែ *ទម្រង់* មិនមែនទិន្នន័យបុគ្គល → ស្រង់ពាក្យគន្លឹះខ្មែរ និងអង់គ្លេស →
> កំណត់កម្រិតហានិភ័យ → បង្កើតទិន្នន័យតេស្តសុវត្ថិភាព (Placeholder) → ដំណើរការ `npm run test:alpha` →
> ពិនិត្យកំហុស False Positive/Negative មុនពេលបញ្ចូល Rule ជាស្ថាពរ។

---

## 🏛️ Official Bank Safety Pages

Use official banking advisories to understand which institutional workflows are
currently being cloned or targeted.

### National Bank of Cambodia (NBC) & Bakong / KHQR
- **Core Vectors:** Fraudulent apps on unofficial stores using the "Bakong" or
  "KHQR" logos to capture user keys; fake merchant QR codes pasted over
  legitimate vendor codes at physical points of sale.
- **Key Warnings:** Bakong will never ask for private recovery phrases or seed
  keys via SMS or messaging channels.
- *(ខ្មែរ: ប្រព័ន្ធបាគងមិនដែលសុំ Recovery Phrase/Seed Key តាម SMS ឬ Chat ឡើយ។ ប្រយ័ត្ន KHQR ក្លែងបិទពីលើ QR ពិត។)*

### ABA Bank
- **Core Vectors:** Phishing websites mimicking the ABA Internet Banking login;
  Telegram bots/channels offering fake loan approvals or "account verifications"
  under the ABA brand.
- **Key Warnings:** Be wary of links containing variations like `aba-verify` or
  `aba-kh`, and calls from non-verified numbers requesting the dynamic 4–6 digit
  OTP or app PIN.
- *(ខ្មែរ: កុំចុចលីងដែលមានពាក្យ `aba-verify`, `aba-kh`។ ABA មិនសុំ OTP ឬ PIN តាមទូរស័ព្ទឡើយ។)*

### ACLEDA Bank
- **Core Vectors:** Fake ACLEDA Mobile "update" notifications via SMS shortcodes
  or social media ads; calls from actors impersonating credit officers.
- **Key Warnings:** Official updates happen only via official app stores; agents
  never ask for PIN elements over voice calls.
- *(ខ្មែរ: ការ Update កម្មវិធីធ្វើតែតាម App Store ផ្លូវការ។ បុគ្គលិកមិនសុំលេខ PIN តាមទូរស័ព្ទឡើយ។)*

---

## 👮 Police / Anti-Cybercrime Warnings

Monitored via the **Anti-Cybercrime Department (Ministry of Interior)** and local
municipal police updates.

### High-Frequency Tactics
- **Impersonation of Public Officials:** Scammers call via WhatsApp/Telegram
  using official institutional seals, claiming the user is under investigation
  and forcing transfers to "safe accounts."
- **Fraudulent Job/Task Commissions:** Recruitment ads offering high pay for
  liking videos or rating products, transitioning into a "deposit matching trap"
  where the user must send capital to release "earned" commissions.
- **Unlicensed Micro-Lending Apps:** Instant collateral-free loan ads whose real
  harm is predatory hidden interest and aggressive contact-list harvesting used
  for extortion.

> **ខ្មែរ:** ល្បិចញឹកញាប់៖ បន្លំជាមន្ត្រីរាជការ → បង្ខំផ្ទេរលុយ; ការងារចុច Like យកកម្រៃ → បង្ខំដាក់ប្រាក់ដើមបន្ថែម;
> កម្ចីអនឡាញខុសច្បាប់ → លួចទាញយក Contact List ដើម្បីគំរាម។

---

## 📰 News-Based Trend Analysis

> *Use news reports only to understand macro trend shifts and emerging social
> engineering angles. Do not build rigid text rules from specific news
> narratives — scammers rotate their storytelling quickly.*
> *(ខ្មែរ: ប្រើព័ត៌មានដើម្បីយល់និន្នាការធំៗ មិនត្រូវបង្កើត Rule ផ្អែកលើសាច់រឿងជាក់លាក់ឡើយ។)*

- **Macro Trend A — Telegram Takeovers:** Accounts hijacked via malicious links
  or shared verification codes, then used to message the victim's contacts
  requesting urgent financial help.
- **Macro Trend B — Cross-Border Crypto/Investment Schemes:** High-yield networks
  promising guaranteed returns through unregulated digital asset platforms, often
  requiring initial deposits via popular local digital payment infrastructure.

---

## 🛡️ User Report Patterns (Anonymized)

> **CRITICAL:** No private data (real OTPs, PINs, passwords, national ID numbers,
> or real account numbers) may be recorded here. Translate real reports into
> abstract behavioral string patterns.
> *(ខ្មែរ: ដាច់ខាតមិនត្រូវកត់ទិន្នន័យឯកជនពិតប្រាកដ។ ត្រូវបំប្លែងទៅជាទម្រង់អក្សរសន្មត។)*

### Pattern 1 — The "Urgent Security Vulnerability" Push
- **Abstract Script:** "Your account has been accessed from an unknown device in
  [Location]. To prevent suspension, click this link immediately to verify your
  profile: `[Malicious URL Link]`."
- **Khmer Indicators:** គណនីរបស់អ្នកត្រូវបានចាក់សោ (account locked) / ផ្ទៀងផ្ទាត់ឥឡូវនេះ (verify now).

### Pattern 2 — The "Accidental Deposit Recovery" Trick
- **Abstract Script:** Actor claims money was transferred to the victim by
  mistake, sends a fake transaction screenshot, and requests the funds be
  returned via a specific unverified payment node.
- **Behavioral Footprint:** High pressure applied via voice calls immediately
  after the message is sent.

---

## 🔧 Analyzer Rule Changes Log

A chronological registry of every change to the rule-based engine. Add a row
only **after** the rule is implemented in `src/analyzer.ts` and a matching safe
test sample is added to `src/testSamples/privateAlphaSamples.ts`.

| Date | Status | Scam Type / Category | Keyword / Pattern (safe) | Reason for Addition | Source / Evidence | Risk Weight | Test Sample ID |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-06-29 | ✅ Implemented | Bank / OTP Scam · Account Security Scam · Suspicious Link | `aba-verify`, `acleda-update` (phishing link hooks) | Block phishing link naming that mimics local banks. Hook alone is suspicious, not proof; escalates with verify/OTP/urgency signals (Rule 3b). Bank name alone stays low risk. | Official bank advisories & phishing reports | `30` each + combination escalation (≥85 with OTP, ≥75 with verify/urgency, ≥50 link-only) | `research-bank-phish-001` |
| 2026-06-29 | ✅ Implemented | Fake Job Scam | `រកលុយប្រចាំថ្ងៃ`, `ដកលុយភ្លាមៗ` | Capture predatory wording in high-frequency fake employment / task-commission posts. | Anti-Cybercrime Dept warnings | `30` each | `research-fake-job-001` |

> **Privacy note:** No private data was used to create or test these rules. All
> test samples use placeholder text and a reserved `.example` domain — no real
> OTPs, PINs, passwords, account numbers, phone numbers, IDs, or live domains.
>
> **Implementation details:** The bank phishing hooks are added as `Suspicious
> Link` signals plus a dedicated combination override (Rule 3b in `analyzer.ts`):
> with OTP/PIN/password → `Bank / OTP Scam`; with account-verification/urgency →
> `Account Security Scam`; with the link as the only signal → `Suspicious Link`.
> A normal ABA/ACLEDA message (no hook) is unaffected — confirmed by test sample
> `safe-006`.

---

### How to add a new row
1. Confirm the source is reliable (official bank, police, reputable news, or
   anonymized user report).
2. Extract the safe pattern (no private data).
3. Add Khmer + English test samples to `privateAlphaSamples.ts`.
4. Implement the rule in `analyzer.ts` with an appropriate weight.
5. Run `npm run test:alpha`, then `npm run lint` and `npm run build`.
6. Record the change as a new row above with the date and evidence.
