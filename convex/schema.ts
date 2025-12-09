import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  ideas: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    audioUrl: v.optional(v.string()),
    transcribedText: v.optional(v.string()),
    processedIdea: v.string(),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),
});

