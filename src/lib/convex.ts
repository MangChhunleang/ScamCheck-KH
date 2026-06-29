/**
 * Convex client setup for ScamCheck KH.
 *
 * SETUP INSTRUCTIONS:
 * 1. Run `npx convex dev` in the project root and follow the login prompt.
 * 2. After login, Convex will auto-generate `convex/_generated/` files and print your URL.
 * 3. Add VITE_CONVEX_URL=https://your-project.convex.cloud to your .env file.
 *
 * The app works fully without Convex (rule-based + Gemini still runs, localStorage history
 * still works). Convex only adds optional cloud sync for checks, feedback, and reports.
 */

import { ConvexClient } from "convex/browser";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

// Admin configuration.
//
// NOTE: Admin authorization is enforced SERVER-SIDE in Convex via ADMIN_PASSCODE
// (see convex/admin.ts → requireAdmin). The frontend does NOT authorize anything.
// VITE_ADMIN_PASSCODE is intentionally NOT read here — it is bundled into the
// browser and is therefore not a secret. The admin email below is only used to
// decide whether to surface the (hidden, server-protected) admin footer link.
export const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;

/** Whether to surface the hidden admin footer link. Visibility only — not auth. */
export const isAdminConfigured = Boolean(adminEmail);

// Memoized singleton so the whole app shares one Convex connection.
let _client: ConvexClient | null | undefined;

/**
 * Returns a shared Convex client if VITE_CONVEX_URL is configured, otherwise null.
 * All callers must handle the null case gracefully.
 */
export function getConvexClient(): ConvexClient | null {
  if (_client !== undefined) return _client;

  if (!convexUrl) {
    console.info(
      "[ScamCheck KH] VITE_CONVEX_URL not set — cloud sync disabled. " +
        "App runs in offline mode. Set VITE_CONVEX_URL in .env to enable Convex."
    );
    _client = null;
    return null;
  }

  _client = new ConvexClient(convexUrl);
  return _client;
}

/**
 * Backwards-compatible factory used by App.tsx. Returns the shared singleton.
 */
export function createConvexClient(): ConvexClient | null {
  return getConvexClient();
}

/**
 * Fire-and-forget wrapper for a Convex mutation.
 * Uses the low-level ConvexClient.mutation() which accepts a function path string
 * in the format "filename:functionName" (e.g. "mutations:saveScamCheck").
 *
 * Errors are caught and logged — never thrown — so Convex failures
 * never break the core scam-check experience.
 */
export async function convexMutate(
  client: ConvexClient,
  path: string,
  args: Record<string, unknown>
): Promise<void> {
  try {
    await (client as any).mutation(path, args);
  } catch (err) {
    console.warn(`[Convex] mutation "${path}" failed (non-blocking):`, err);
  }
}

/**
 * Awaitable wrapper for a Convex mutation. Use when the caller needs the result
 * or needs to know whether it succeeded (e.g. admin actions that refresh a list).
 */
export async function convexMutateAwait(
  client: ConvexClient,
  path: string,
  args: Record<string, unknown>
): Promise<unknown> {
  return await (client as any).mutation(path, args);
}

/**
 * One-shot Convex query (no live subscription). Returns the query result.
 */
export async function convexQueryOnce(
  client: ConvexClient,
  path: string,
  args: Record<string, unknown> = {}
): Promise<unknown> {
  return await (client as any).query(path, args);
}

export { convexUrl };
