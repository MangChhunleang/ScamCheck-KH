import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  scamChecks: defineTable({
    userId: v.optional(v.string()),
    inputPreview: v.string(),
    detectedType: v.string(),
    riskLevel: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
    riskScore: v.number(),
    detectedSignals: v.array(v.string()),
    reasons: v.array(v.string()),
    safeNextSteps: v.array(v.string()),
    language: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  feedback: defineTable({
    scamCheckId: v.optional(v.string()),
    userId: v.optional(v.string()),
    inputPreview: v.optional(v.string()),
    detectedType: v.string(),
    riskLevel: v.union(v.literal("Low"), v.literal("Medium"), v.literal("High")),
    riskScore: v.number(),
    detectedSignals: v.optional(v.array(v.string())),
    isCorrect: v.boolean(),
    comment: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_scam_check", ["scamCheckId"]),

  reports: defineTable({
    scamType: v.string(),
    platform: v.string(),
    descriptionPreview: v.string(),
    contact: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  lessons: defineTable({
    titleKm: v.string(),
    titleEn: v.string(),
    contentKm: v.string(),
    contentEn: v.string(),
    category: v.string(),
    createdAt: v.number(),
  }),
});
