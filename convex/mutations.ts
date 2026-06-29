import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./admin";

/**
 * Save a scam check result (non-sensitive preview only).
 */
export const saveScamCheck = mutation({
  args: {
    userId: v.optional(v.string()),
    inputPreview: v.string(),
    detectedType: v.string(),
    riskLevel: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
    riskScore: v.number(),
    detectedSignals: v.array(v.string()),
    reasons: v.array(v.string()),
    safeNextSteps: v.array(v.string()),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scamChecks", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/**
 * Submit user feedback on a scan result.
 * Only stores non-sensitive, sanitized data — never the full pasted message.
 */
export const submitFeedback = mutation({
  args: {
    scamCheckId: v.optional(v.string()),
    userId: v.optional(v.string()),
    inputPreview: v.optional(v.string()),
    detectedType: v.string(),
    riskLevel: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
    riskScore: v.number(),
    detectedSignals: v.optional(v.array(v.string())),
    isCorrect: v.boolean(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("feedback", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/**
 * Submit a scam report.
 * Sanitized description preview only — no OTP, PIN, password, ID, or bank data.
 */
export const submitReport = mutation({
  args: {
    scamType: v.string(),
    platform: v.string(),
    descriptionPreview: v.string(),
    contact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reports", {
      ...args,
      status: "new",
      createdAt: Date.now(),
    });
  },
});

/**
 * Admin: update the review status of a report.
 * Requires the server-side admin passcode.
 */
export const updateReportStatus = mutation({
  args: {
    adminPasscode: v.string(),
    id: v.id("reports"),
    status: v.union(
      v.literal("new"),
      v.literal("reviewing"),
      v.literal("resolved")
    ),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminPasscode);
    const report = await ctx.db.get(args.id);
    if (!report) {
      throw new Error("Report not found.");
    }
    await ctx.db.patch(args.id, { status: args.status });
  },
});

/**
 * Admin: delete a report permanently.
 * Requires the server-side admin passcode.
 */
export const deleteReport = mutation({
  args: {
    adminPasscode: v.string(),
    id: v.id("reports"),
  },
  handler: async (ctx, args) => {
    requireAdmin(args.adminPasscode);
    await ctx.db.delete(args.id);
  },
});

/**
 * Delete a user-owned scam check from saved history (for future auth-gated history feature).
 */
export const deleteScamCheck = mutation({
  args: {
    id: v.id("scamChecks"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id);
    if (!record || record.userId !== args.userId) {
      throw new Error("Not authorized to delete this record.");
    }
    await ctx.db.delete(args.id);
  },
});
