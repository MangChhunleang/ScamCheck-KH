# Security Specification for ScamCheck KH

This specification outlines the data invariants, security boundaries, and threat model ("Dirty Dozen") used to secure Firestore.

## 1. Data Invariants

### ScamChecks (`/scamChecks/{id}`)
- Any authenticated user or anonymous user can create/read their own logs. To protect privacy, a record with a non-null `userId` must strictly match the requester's `uid`. If `userId` is null, it belongs to an unauthenticated check (which can be read/written by the client if requested, or we can restrict it so anyone can write unauthenticated checks, but can only read if they know the exact document ID or if they are the author).
- Scam check records are immutable once written.
- All timestamps (`createdAt`) must exactly match `request.time`.

### Feedback (`/feedback/{id}`)
- Users can write feedback on scam checks.
- If a `userId` is provided in the feedback, it must match `request.auth.uid`.
- Feedback is immutable once written.

### Reports (`/reports/{id}`)
- Normal users can write (create) reports.
- Reports are write-only for normal users. Only admin can read or write reports.
- Users cannot modify or delete reports once submitted.

### Lessons (`/lessons/{id}`)
- Public digital safety lessons.
- Readable by anyone (publicly accessible).
- Writeable only by admin.

---

## 2. The "Dirty Dozen" Payloads (Attempted Attack Scenarios)

These payloads are designed to test the robustness of the security rules.

1. **Unsigned-In Write Spoof**: Write a scam check with a spoofed `userId` ("malicious_user") without being signed in.
2. **Identity Theft Write**: A signed-in user ("user_A") attempts to write a scam check with `userId` set to "user_B".
3. **Immutability Breach**: An authenticated user attempts to modify or update an existing scam check's `riskScore` or `riskLevel`.
4. **Time Spoofing (Create)**: Submit a check with `createdAt` set to a hardcoded client date (e.g. `2020-01-01T00:00:00Z`) instead of `request.time`.
5. **PII Pollution / Size Exhaustion**: Injecting a massive string (e.g., 2MB of text or high-byte characters) into `detectedType` or `inputPreview`.
6. **Malicious Document ID**: Attempt to write a document with a junk ID filled with dangerous symbols, like `scamChecks/../admins/root` or long SQL/noSQL commands to bypass security paths.
7. **Bypassing Feedback Validation**: Creating a feedback item with invalid schema keys or missing required fields (e.g., no `scamCheckId`).
8. **Unauthorized Feedback Modification**: Trying to update `isCorrect` on feedback to manipulate accuracy statistics.
9. **Normal User Reading Reports**: An authenticated normal user attempts to list or get items in the `/reports` collection.
10. **Report Tampering**: A user attempts to update or delete a submitted scam report.
11. **Unauthorized Lesson Modification**: A regular user attempts to create, edit, or delete a safety lesson in `/lessons`.
12. **Blanket Read Request**: A signed-in user tries to execute a blanket query to list all `scamChecks` belonging to other users.

---

## 3. Security Rules Architecture

We define these invariants in `/firestore.rules` and test them. Since rules must be watertight, we create robust validation helper functions.
