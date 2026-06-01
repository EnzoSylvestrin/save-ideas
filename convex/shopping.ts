import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function sortPendingFirst<T extends { checked: boolean; createdAt: number }>(items: T[]) {
  return items.sort((a, b) => {
    if (a.checked !== b.checked) return a.checked ? 1 : -1;
    return a.createdAt - b.createdAt;
  });
}

export const listItemsByDay = query({
  args: { day: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("shoppingItems")
      .withIndex("by_day", (q) => q.eq("day", args.day))
      .collect();
    return sortPendingFirst(items);
  },
});

export const getDayStats = query({
  args: { day: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("shoppingItems")
      .withIndex("by_day", (q) => q.eq("day", args.day))
      .collect();
    return { pendingCount: items.filter((i) => !i.checked).length, total: items.length };
  },
});

// Nomes distintos já usados (em qualquer dia), mais recentes primeiro,
// excluindo os que já estão no dia informado. Para a faixa de "salvos".
export const listSavedItems = query({
  args: { day: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("shoppingItems").collect();
    const inDay = new Set(
      all.filter((i) => i.day === args.day).map((i) => i.name.toLowerCase())
    );
    all.sort((a, b) => b.createdAt - a.createdAt);
    const seen = new Set<string>();
    const result: string[] = [];
    for (const it of all) {
      if (!it.day) continue; // ignora itens antigos sem dia
      const key = it.name.toLowerCase();
      if (seen.has(key) || inDay.has(key)) continue;
      seen.add(key);
      result.push(it.name);
    }
    return result.slice(0, 30);
  },
});

// Dias com itens, mais recentes primeiro (para o histórico).
export const listDays = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("shoppingItems").collect();
    const map = new Map<string, { day: string; total: number; checked: number }>();
    for (const it of all) {
      if (!it.day) continue;
      const e = map.get(it.day) ?? { day: it.day, total: 0, checked: 0 };
      e.total++;
      if (it.checked) e.checked++;
      map.set(it.day, e);
    }
    return Array.from(map.values()).sort((a, b) => (a.day < b.day ? 1 : -1));
  },
});

export const addItem = mutation({
  args: { name: v.string(), day: v.string() },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    // Evita duplicatas: se já existe um item com o mesmo nome no dia, incrementa a quantidade.
    const dayItems = await ctx.db
      .query("shoppingItems")
      .withIndex("by_day", (q) => q.eq("day", args.day))
      .collect();
    const existing = dayItems.find(
      (i) => i.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: (existing.quantity ?? 1) + 1,
        checked: false, // volta pra lista de pendentes ao re-adicionar
      });
      return existing._id;
    }
    return await ctx.db.insert("shoppingItems", {
      name,
      checked: false,
      quantity: 1,
      day: args.day,
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

export const clearCheckedByDay = mutation({
  args: { day: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("shoppingItems")
      .withIndex("by_day", (q) => q.eq("day", args.day))
      .collect();
    for (const it of items) {
      if (it.checked) await ctx.db.delete(it._id);
    }
  },
});

// Copia os itens de um dia para outro (desmarcados), pulando duplicados.
export const reuseDay = mutation({
  args: { fromDay: v.string(), toDay: v.string() },
  handler: async (ctx, args) => {
    const from = await ctx.db
      .query("shoppingItems")
      .withIndex("by_day", (q) => q.eq("day", args.fromDay))
      .collect();
    const to = await ctx.db
      .query("shoppingItems")
      .withIndex("by_day", (q) => q.eq("day", args.toDay))
      .collect();
    const existing = new Set(to.map((i) => i.name.toLowerCase()));
    const now = Date.now();
    let i = 0;
    for (const it of from) {
      if (existing.has(it.name.toLowerCase())) continue;
      await ctx.db.insert("shoppingItems", {
        name: it.name,
        checked: false,
        quantity: it.quantity ?? 1,
        day: args.toDay,
        createdAt: now + i++,
      });
    }
  },
});
