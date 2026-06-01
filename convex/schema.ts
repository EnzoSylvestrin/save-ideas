import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
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
  wishlistItems: defineTable({
    title: v.string(),
    link: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    price: v.optional(v.number()),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    category: v.optional(v.string()),
    note: v.optional(v.string()),
    acquired: v.boolean(),
    acquiredAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_acquired", ["acquired"]),
  shoppingItems: defineTable({
    name: v.string(),
    checked: v.boolean(),
    quantity: v.optional(v.number()), // ausente = 1
    listId: v.optional(v.string()), // undefined = lista ativa; definido = lote no histórico
    archivedAt: v.optional(v.number()), // quando foi enviado ao histórico
    day: v.optional(v.string()), // legado (não usado)
    createdAt: v.number(),
  }).index("by_list", ["listId"]),
});

