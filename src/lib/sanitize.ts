/**
 * Shared sanitization utilities for ScamCheck KH.
 *
 * Used before storing ANY user content to Convex or localStorage, and before
 * sending text to Gemini. The goal: NEVER persist sensitive data.
 *
 * Redacts: card numbers, emails, labeled OTP/password/PIN, phone numbers,
 * ID numbers, bank account numbers, and standalone numeric secrets.
 */

/**
 * Core redaction. Masks all known sensitive patterns in a string.
 * Order matters: multi-group patterns (cards, phones) run before the generic
 * single-run digit rules so they are not partially consumed.
 */
export function maskSensitiveText(text: string): string {
  if (!text) return "";
  let s = text;

  // 1. Card numbers — 4 groups of 4 digits (spaces or dashes), e.g. 1234-5678-9012-3456
  s = s.replace(/\b(?:\d[ -]?){13,19}\b/g, (m) => {
    const digits = m.replace(/[ -]/g, "");
    return digits.length >= 13 && digits.length <= 19 ? "[REDACTED_CARD]" : m;
  });

  // 2. Email addresses
  s = s.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[REDACTED_EMAIL]");

  // 3. Passwords with labels (password: xxx, លេខសម្ងាត់ = xxx)
  s = s.replace(
    /(password|pass|លេខសម្ងាត់|សម្ងាត់)\s*[:=៖\-]\s*\S+/gi,
    (_, label) => `${label}: [REDACTED_PASSWORD]`
  );

  // 4. PIN with labels
  s = s.replace(/(pin)\s*[:=៖\-]\s*\S+/gi, (_, label) => `${label}: [REDACTED_PIN]`);

  // 5. OTP / code with labels
  s = s.replace(
    /(otp|code|កូដ|លេខកូដ)\s*[:=៖\-]\s*\S+/gi,
    (_, label) => `${label}: [REDACTED_OTP]`
  );

  // 6. Cambodian phone numbers (+855 / 0xx xxx xxx) and generic phone shapes
  s = s.replace(/(?:\+855|0)\s*\d{1,3}\s*\d{3,4}\s*\d{3,4}\b/g, "[REDACTED_PHONE]");
  s = s.replace(/\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "[REDACTED_PHONE]");

  // 7. Bank account numbers (11–18 contiguous digits) — before shorter rules
  s = s.replace(/\b\d{11,18}\b/g, "[REDACTED_BANK_INFO]");

  // 8. ID card numbers (9–10 digits)
  s = s.replace(/\b\d{9,10}\b/g, "[REDACTED_ID]");

  // 9. OTP / private codes (5–8 digits)
  s = s.replace(/\b\d{5,8}\b/g, "[REDACTED_OTP]");

  // 10. 4-digit PIN patterns
  s = s.replace(/\b\d{4}\b/g, "[REDACTED_PIN]");

  return s;
}

/**
 * Backward-compatible alias. Prefer maskSensitiveText in new code.
 */
export function sanitizeText(text: string): string {
  return maskSensitiveText(text);
}

/**
 * Creates a short, sanitized, safe-to-store preview of user text.
 * Masks sensitive data first, then truncates to maxLen characters.
 */
export function createSafePreview(text: string, maxLen = 120): string {
  const clean = maskSensitiveText(text).trim();
  return clean.length > maxLen ? clean.substring(0, maxLen).trimEnd() + "..." : clean;
}

/**
 * Backward-compatible alias for createSafePreview.
 */
export function sanitizeInputPreview(text: string, maxLen = 120): string {
  return createSafePreview(text, maxLen);
}

/**
 * Sanitizes an optional user feedback comment before storing.
 */
export function sanitizeFeedbackComment(text: string): string {
  return maskSensitiveText(text).trim();
}

/**
 * Sanitizes a report description before storing.
 * Extra-strict: also strips any remaining numeric run of 3+ digits.
 */
export function sanitizeReportDescription(text: string): string {
  let s = maskSensitiveText(text);
  // Extra: remove any remaining numeric sequences of 3+ digits
  s = s.replace(/\b\d{3,}\b/g, "[REDACTED]");
  return s.trim();
}
