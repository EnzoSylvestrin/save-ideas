import { v } from "convex/values";
import { action } from "./_generated/server";

function metaContent(html: string, keys: string[]): string | undefined {
  for (const key of keys) {
    const a = new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ).exec(html);
    if (a?.[1]) return decodeEntities(a[1]);
    const b = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
      "i"
    ).exec(html);
    if (b?.[1]) return decodeEntities(b[1]);
  }
  return undefined;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parsePrice(html: string): number | undefined {
  const meta = metaContent(html, [
    "og:price:amount",
    "product:price:amount",
    "twitter:data1",
  ]);
  if (!meta) return undefined;
  const n = parseFloat(meta.replace(/[^0-9.,]/g, "").replace(",", "."));
  return !isNaN(n) && n > 0 ? n : undefined;
}

export const getLinkPreview = action({
  args: { url: v.string() },
  handler: async (_ctx, args): Promise<{ title?: string; imageUrl?: string; price?: number }> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(args.url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        },
      });
      clearTimeout(timeout);
      if (!res.ok) return {};
      const html = await res.text();
      const tagTitle = /<title[^>]*>([^<]+)<\/title>/i.exec(html)?.[1];
      const title =
        metaContent(html, ["og:title", "twitter:title"]) ??
        (tagTitle ? decodeEntities(tagTitle) : undefined);
      const imageUrl = metaContent(html, ["og:image", "twitter:image"]);
      const price = parsePrice(html);
      return {
        title: title ? title.trim() : undefined,
        imageUrl,
        price,
      };
    } catch {
      return {};
    }
  },
});
