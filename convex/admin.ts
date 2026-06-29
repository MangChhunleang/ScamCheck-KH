/**
 * Server-side admin protection for ScamCheck KH Convex functions.
 *
 * SECURITY MODEL:
 * - The real admin secret lives ONLY on the Convex server as the environment
 *   variable ADMIN_PASSCODE (set via the Convex dashboard or `npx convex env set`).
 * - It is NEVER the same as VITE_ADMIN_PASSCODE. Frontend env vars (VITE_*) are
 *   bundled into the browser and are therefore not secret.
 * - Every admin Convex function must call requireAdmin(adminPasscode) BEFORE
 *   reading or mutating any data.
 *
 * This is a shared-secret scheme suitable for a small single-admin tool. For a
 * multi-user system, migrate to Convex Auth and check ctx.auth.getUserIdentity().
 */

/**
 * Throws if the provided passcode does not match the server-side ADMIN_PASSCODE.
 * Returns silently when authorized.
 */
export function requireAdmin(passcode: string): void {
  const serverPasscode = process.env.ADMIN_PASSCODE;

  if (!serverPasscode) {
    throw new Error(
      "ADMIN_PASSCODE is not configured on the Convex server. " +
        "Set it with `npx convex env set ADMIN_PASSCODE <value>` or in the Convex dashboard."
    );
  }

  if (!passcode || passcode !== serverPasscode) {
    // Generic message — do not leak whether the passcode exists or its length.
    throw new Error("UNAUTHORIZED: Invalid admin passcode.");
  }
}
