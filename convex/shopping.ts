import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function sortPendingFirst<T extends { checked: boolean; createdAt: number }>(items: T[]) {
  return items.sort((a, b) => {
    if (a.checked !== b.checked) return a.checked ? 1 : -1;
    return a.createdAt - b.createdAt;
  });
}

// Lista ativa = itens sem listId.
export const listActiveItems = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("shoppingItems").collect();
    return sortPendingFirst(all.filter((i) => !i.listId));
  },
});

export const getActiveStats = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("shoppingItems").collect();
    const active = all.filter((i) => !i.listId);
    return { pendingCount: active.filter((i) => !i.checked).length, total: active.length };
  },
});

// Nomes distintos já usados, mais recentes primeiro, excluindo os já presentes na lista ativa.
export const listSavedItems = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("shoppingItems").collect();
    const active = new Set(all.filter((i) => !i.listId).map((i) => i.name.trim().toLowerCase()));
    all.sort((a, b) => b.createdAt - a.createdAt);
    const seen = new Set<string>();
    const result: string[] = [];
    for (const it of all) {
      const key = it.name.trim().toLowerCase();
      if (seen.has(key) || active.has(key)) continue;
      seen.add(key);
      result.push(it.name);
    }
    return result.slice(0, 30);
  },
});

// Lotes arquivados (histórico), mais recentes primeiro.
export const listHistory = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("shoppingItems").collect();
    const map = new Map<string, { listId: string; archivedAt: number; total: number; checked: number }>();
    for (const it of all) {
      if (!it.listId) continue;
      const e = map.get(it.listId) ?? { listId: it.listId, archivedAt: it.archivedAt ?? it.createdAt, total: 0, checked: 0 };
      e.total++;
      if (it.checked) e.checked++;
      map.set(it.listId, e);
    }
    return Array.from(map.values()).sort((a, b) => b.archivedAt - a.archivedAt);
  },
});

export const listItemsByList = query({
  args: { listId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("shoppingItems")
      .withIndex("by_list", (q) => q.eq("listId", args.listId))
      .collect();
    return sortPendingFirst(items);
  },
});

export const addItem = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) return null;
    const all = await ctx.db.query("shoppingItems").collect();
    const existing = all.find(
      (i) => !i.listId && i.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: (existing.quantity ?? 1) + 1,
        checked: false,
      });
      return existing._id;
    }
    return await ctx.db.insert("shoppingItems", {
      name,
      checked: false,
      quantity: 1,
      createdAt: Date.now(),
    });
  },
});

export const changeQuantity = mutation({
  args: { id: v.id("shoppingItems"), delta: v.number() },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return;
    const next = Math.max(1, (item.quantity ?? 1) + args.delta);
    await ctx.db.patch(args.id, { quantity: next });
  },
});

export const updateItemName = mutation({
  args: { id: v.id("shoppingItems"), name: v.string() },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) return;
    await ctx.db.patch(args.id, { name });
  },
});

export const toggleItem = mutation({
  args: { id: v.id("shoppingItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return;
    await ctx.db.patch(args.id, { checked: !item.checked });
  },
});

export const deleteItem = mutation({
  args: { id: v.id("shoppingItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const clearChecked = mutation({
  handler: async (ctx) => {
    const all = await ctx.db.query("shoppingItems").collect();
    for (const it of all) {
      if (!it.listId && it.checked) await ctx.db.delete(it._id);
    }
  },
});

// Arquiva a lista ativa como um lote no histórico e abre uma nova lista (vazia).
export const sendToHistory = mutation({
  handler: async (ctx) => {
    const all = await ctx.db.query("shoppingItems").collect();
    const active = all.filter((i) => !i.listId);
    if (active.length === 0) return;
    const archivedAt = Date.now();
    const listId = String(archivedAt);
    for (const it of active) {
      await ctx.db.patch(it._id, { listId, archivedAt });
    }
  },
});

// Copia os itens de um lote do histórico para a lista ativa (pulando duplicados).
export const reuseList = mutation({
  args: { listId: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("shoppingItems").collect();
    const from = all.filter((i) => i.listId === args.listId);
    const activeNames = new Set(all.filter((i) => !i.listId).map((i) => i.name.trim().toLowerCase()));
    const now = Date.now();
    let i = 0;
    for (const it of from) {
      if (activeNames.has(it.name.trim().toLowerCase())) continue;
      await ctx.db.insert("shoppingItems", {
        name: it.name,
        checked: false,
        quantity: it.quantity ?? 1,
        createdAt: now + i++,
      });
    }
  },
});
