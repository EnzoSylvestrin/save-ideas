import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listShoppingItems = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("shoppingItems").collect();
    // Pendentes primeiro (na ordem em que foram adicionados), comprados no fim.
    return items.sort((a, b) => {
      if (a.checked !== b.checked) return a.checked ? 1 : -1;
      return a.createdAt - b.createdAt;
    });
  },
});

export const getShoppingStats = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("shoppingItems").collect();
    const pendingCount = items.filter((i) => !i.checked).length;
    return { pendingCount, total: items.length };
  },
});

export const addShoppingItem = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("shoppingItems", {
      name: args.name,
      checked: false,
      createdAt: Date.now(),
    });
  },
});

export const toggleShoppingItem = mutation({
  args: { id: v.id("shoppingItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return;
    await ctx.db.patch(args.id, { checked: !item.checked });
  },
});

export const deleteShoppingItem = mutation({
  args: { id: v.id("shoppingItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const clearCheckedItems = mutation({
  handler: async (ctx) => {
    const checked = await ctx.db
      .query("shoppingItems")
      .withIndex("by_checked", (q) => q.eq("checked", true))
      .collect();
    for (const item of checked) {
      await ctx.db.delete(item._id);
    }
  },
});
