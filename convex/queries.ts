import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./admin";

/**
 * Get all lessons (seeded from static data or admin-inserted).
 */
export const getLessons = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("lessons").order("asc").collect();
  },
});

/**
 * Get scam checks for a specific authenticated user.
 * Only usable if authentication is set up.
 */
export const getUserScamChecks = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scamChecks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

/**
 * Admin-only: get all submitted reports, newest first.
 *
 * SECURITY: Requires the server-side admin passcode (ADMIN_PASSCODE env var on
 * Convex). The client never has the real secret hardcoded in a trusted way —
 * the passcode is checked here on the server via requireAdmin().
 *
 * NOTE: For a multi-user production system, migrate to Convex Auth and verify
 * ctx.auth.getUserIdentity() instead of a shared passcode.
 */
export const adminGetReports = query({
  args: {
    adminPasscode: v.string(),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminPasscode);
    // .order("desc") orders by _creationTime descending = newest first
    return await ctx.db.query("reports").order("desc").take(200);
  },
});

/**
 * Admin-only: get all submitted feedback, newest first.
 *
 * SECURITY: Requires the server-side admin passcode (ADMIN_PASSCODE env var on
 * Convex), verified via requireAdmin(). Used to review where the rule-based
 * analyzer was right or wrong so it can be improved later.
 */
export const adminGetFeedback = query({
  args: {
    adminPasscode: v.string(),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminPasscode);
    return await ctx.db.query("feedback").order("desc").take(200);
  },
});

/**
 * Admin-only: aggregated insight summary across reports and feedback.
 *
 * SECURITY: Requires the server-side admin passcode (verified via requireAdmin).
 * PRIVACY: Returns only sanitized previews/comments — never full messages or
 * sensitive data.
 */
export const adminGetInsights = query({
  args: {
    adminPasscode: v.string(),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminPasscode);

    const reports = await ctx.db.query("reports").order("desc").take(1000);
    const feedback = await ctx.db.query("feedback").order("desc").take(1000);

    // ── Reports summary ────────────────────────────────────────────────
    const totalReports = reports.length;
    const newReports = reports.filter((r) => r.status === "new").length;
    const reviewingReports = reports.filter((r) => r.status === "reviewing").length;
    const resolvedReports = reports.filter((r) => r.status === "resolved").length;

    // ── Feedback summary ───────────────────────────────────────────────
    const totalFeedback = feedback.length;
    const correctFeedback = feedback.filter((f) => f.isCorrect).length;
    const incorrectFeedback = feedback.filter((f) => !f.isCorrect).length;

    // ── Most common scam types (from reports + feedback) ───────────────
    const typeCounts: Record<string, number> = {};
    for (const r of reports) {
      if (r.scamType) typeCounts[r.scamType] = (typeCounts[r.scamType] || 0) + 1;
    }
    for (const f of feedback) {
      if (f.detectedType) typeCounts[f.detectedType] = (typeCounts[f.detectedType] || 0) + 1;
    }
    const mostCommonScamTypes = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // ── Most common warning signals (from feedback.detectedSignals) ────
    const signalCounts: Record<string, number> = {};
    for (const f of feedback) {
      for (const sig of f.detectedSignals || []) {
        signalCounts[sig] = (signalCounts[sig] || 0) + 1;
      }
    }
    const mostCommonWarningSignals = Object.entries(signalCounts)
      .map(([signal, count]) => ({ signal, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // ── Recent incorrect feedback (newest 10; feedback already desc) ───
    const recentIncorrectFeedback = feedback
      .filter((f) => !f.isCorrect)
      .slice(0, 10)
      .map((f) => ({
        _id: f._id,
        detectedType: f.detectedType,
        riskLevel: f.riskLevel,
        riskScore: f.riskScore,
        inputPreview: f.inputPreview || "",
        comment: f.comment || "",
        createdAt: f.createdAt || f._creationTime,
      }));

    return {
      totalReports,
      newReports,
      reviewingReports,
      resolvedReports,
      totalFeedback,
      correctFeedback,
      incorrectFeedback,
      mostCommonScamTypes,
      mostCommonWarningSignals,
      recentIncorrectFeedback,
    };
  },
});
