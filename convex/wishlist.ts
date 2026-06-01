import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 } as const;

export const listWishlistItems = query({
  args: { acquired: v.boolean() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("wishlistItems")
      .withIndex("by_acquired", (q) => q.eq("acquired", args.acquired))
      .collect();
    return items.sort((a, b) => {
      const r = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      return r !== 0 ? r : b.createdAt - a.createdAt;
    });
  },
});

export const getWishlistItem = query({
  args: { id: v.id("wishlistItems") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getWishlistStats = query({
  handler: async (ctx) => {
    const active = await ctx.db
      .query("wishlistItems")
      .withIndex("by_acquired", (q) => q.eq("acquired", false))
      .collect();
    const activeTotal = active.reduce((sum, i) => sum + (i.price ?? 0), 0);
    return { activeCount: active.length, activeTotal };
  },
});

export const createWishlistItem = mutation({
  args: {
    title: v.string(),
    link: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    price: v.optional(v.number()),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    category: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("wishlistItems", {
      ...args,
      acquired: false,
      createdAt: Date.now(),
    });
  },
});

export const updateWishlistItem = mutation({
  args: {
    id: v.id("wishlistItems"),
    title: v.optional(v.string()),
    link: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    price: v.optional(v.number()),
    priority: v.optional(
      v.union(v.literal("high"), v.literal("medium"), v.literal("low"))
    ),
    category: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, title, priority, link, imageUrl, price, category, note } = args;
    // Edição completa: o form envia todos os campos editáveis. Campos opcionais
    // recebem o valor cru (undefined limpa o campo); obrigatórios só se vierem.
    const patch: Record<string, unknown> = { link, imageUrl, price, category, note };
    if (title !== undefined) patch.title = title;
    if (priority !== undefined) patch.priority = priority;
    await ctx.db.patch(id, patch);
  },
});

export const setAcquired = mutation({
  args: { id: v.id("wishlistItems"), acquired: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      acquired: args.acquired,
      acquiredAt: args.acquired ? Date.now() : undefined,
    });
  },
});

export const deleteWishlistItem = mutation({
  args: { id: v.id("wishlistItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
