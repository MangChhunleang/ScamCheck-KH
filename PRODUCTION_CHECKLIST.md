# ScamCheck KH - Production Deployment & Hardening Checklist

This checklist tracks the engineering, legal, security, and launch readiness states of the **ScamCheck KH** application.

---

## 1. Privacy & Sanitization Hardening
- [x] **Universal Regex Redaction**: Integrate `sanitizeText` engine into both client-side React components and server-side Express handlers.
- [x] **Comprehensive Placeholders**: Verify that redacted strings use standard production placeholders:
  - `[REDACTED_OTP]`
  - `[REDACTED_PASSWORD]`
  - `[REDACTED_PIN]`
  - `[REDACTED_PHONE]`
  - `[REDACTED_EMAIL]`
  - `[REDACTED_ID]`
  - `[REDACTED_BANK_INFO]`
- [x] **Gemini Safeguard**: Ensure only sanitized text previews (`sanitizedContent`) are sent to Gemini. No raw user-pasted content is sent to Gemini.
- [x] **Optional Field Sanitization**: In the Evidence Helper, verify that optional user-submitted parameters (`dateTime`, `amountSent`, `shortNote`, `incidentType`, `platform`) are fully run through `sanitizeText` before generating summaries.
- [x] **Copy/Share Sanitization**: Verify that result card summaries copied to clipboard or shared via Web Share API contain sanitized explanations and next steps.
- [x] **No ABA Details Suggestions**: Ensure the placeholder for amount sent uses generic examples like Khmer "ឧ. ១០០ ដុល្លារ" or English "e.g. $100" instead of prompting users for ABA bank info.

---

## 2. Firestore Production Security
- [x] **Global Default Deny**: Match `{document=**}` is set to block read/write operations by default.
- [x] **Validation Blueprints (Schemas)**: Implement schema enforcement for `scamChecks`, `reports`, `feedback`, and `lessons` collections inside security rules to prevent malformed injections.
- [x] **Immutability Enforcement**: Block update and delete permissions (`allow update, delete: if false;`) for normal users on critical collections.
- [x] **List Restriction**: Deny general listing (`allow list: if false;` or restricted filters) to prevent unauthorized querying of user feedback or scam check logs.
- [x] **Read Restrictions**: Prevent unauthorized reads of sensitive collections (`reports`, `feedback`).
- [x] **Lessons Read-Only**: Enforce that safety lessons are readable by all users but modifiable only by authenticated Administrators (`isAdmin()`).

---

## 3. Gemini SDK & API Key Safety
- [x] **No Client Keys**: Confirm no frontend environment variables prefixed with `VITE_` contain the Gemini API key or other sensitive credentials.
- [x] **No Direct SDK Imports**: Enforce that the `@google/genai` library is only imported and executed within the Node/Express server context (`server.ts`).
- [x] **Proxy Architecture**: Route all client-side checks exclusively through the backend `/api/check` proxy.
- [x] **Environment Variable Isolation**: Ensure `GEMINI_API_KEY` is loaded securely through process environment variables at runtime.

---

## 4. Error Handling & Stability
- [x] **Client Input Validation**: Enforce character limits (max 2500 characters) and check for empty strings in the browser.
- [x] **Backend Input Validation**: Enforce matching restrictions on `/api/check`:
  - `content` must be a non-empty string under 2500 characters.
  - `lang` parameter must be strictly validated as either `'km'` or `'en'`.
  - Return HTTP 400 Bad Request on validation failures.
- [x] **Iframe Compatibility**: Remove browser-blocking `window.alert` calls.
- [x] **Global React Toast Notifier**: Replace alerts with a lightweight, user-friendly CSS-animated toast notification overlay.
- [x] **Localized Khmer Error Messages**:
  - Empty Input: `"សូមបិទភ្ជាប់សារជាមុនសិន។"`
  - Too Long Text: `"សារវែងពេក។ សូមកាត់ឱ្យខ្លីជាងនេះ។"`
  - Network/API Failure: `"មិនអាចភ្ជាប់ទៅសេវាបានទេ។ សូមព្យាយាមម្តងទៀត។"`
  - Firestore Saving Warning: `"លទ្ធផលត្រូវបានបង្ហាញ ប៉ុន្តែមិនអាចរក្សាទុកបានទេ។"`
- [x] **Robust Deterministic Fallbacks**: In case of Gemini API outages, JSON parse failures, or quota limits, return high-fidelity rule-based results instantly in both languages using `getFallbackExplanations`.

---

## 5. Testing & Verification
- [x] **Linter Compliance**: Run `npm run lint` and verify there are no syntax errors, missing imports, or type definition warnings.
- [x] **Build Integrity**: Run `npm run build` to verify Webpack/Vite asset compilation and esbuild Node server bundling compile cleanly.
- [x] **Mobile Responsiveness**: Confirm that views render beautifully on small viewport devices (under 375px wide) using standard mobile layouts.

---

## 6. Deployment & Environment
- [x] **Host Routing**: Ensure the Express server binds strictly to host `0.0.0.0` and port `3000` for Google Cloud Run container ingress.
- [x] **Asset Bundler Integration**: Verify that static SPA files inside `/dist` are served correctly by Express in production mode.
- [x] **Nginx Reverse Proxy Ingress**: Verify that port 3000 is the exclusive entry point and there are no hardcoded host addresses.

---

## 7. Legal, Disclaimer, & Trust indicators
- [x] **Clear Legal Disclaimer**: Ensure that both Khmer and English disclaimer statements are highly visible in the results, falling back to:
  - Khmer: `"ឧបករណ៍នេះផ្តល់ការណែនាំសុវត្ថិភាពប៉ុណ្ណោះ មិនមែនជាសេចក្តីសម្រេចផ្លូវច្បាប់ ធនាគារ ឬប៉ូលីសទេ។ សូមផ្ទៀងផ្ទាត់ជាមួយប្រភពផ្លូវការជានិច្ច។"`
  - English: `"This tool gives safety guidance only. It is not a final legal, banking, or police decision. Always verify with official sources."`
- [x] **Trust message Banner**: Render the explicit safety assurance note in `/src/components/HomeView.tsx`:
  - Khmer: `"ScamCheck KH មិនស្នើសុំ OTP, Password, PIN ឬសិទ្ធិចូលប្រើគណនីធនាគាររបស់អ្នកទេ។"`
  - English: `"ScamCheck KH never requests your OTP, Password, PIN, or bank account credentials."`

---

## 8. Monitoring & Maintenance
- [ ] **Firestore Logs Auditor**: Regularly audit `/feedback` and `/reports` collections via administrative consoles to monitor scam trends.
- [ ] **Gemini Quota Tracker**: Ensure Google Cloud Console has alerts configured for Gemini API daily rate limits.

---

## 9. Launch Plan
1. **Database Seeding**: Populate the `lessons` collection with public safety tutorials.
2. **Key Provisioning**: Provision the Google Cloud Run environment variable `GEMINI_API_KEY`.
3. **Domain Mapping**: Point `scamcheck.kh` or equivalent secure domain to the Cloud Run ingress.
4. **Community Outreaches**: Distribute safety result card infographics across public Telegram channels.
