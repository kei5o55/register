// src/logic/tags.ts
// タグ操作ユーティリティ関数群
//まだ使ってないけど、将来的にタグ操作を共通化するために用意

export function normalizeTag(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

export function addTag(tags: string[] | undefined, tag: string) {
  const t = normalizeTag(tag);
  if (!t) return tags ?? [];
  const base = tags ?? [];
  if (base.includes(t)) return base; // 重複防止
  return [...base, t];
}

export function removeTag(tags: string[] | undefined, tag: string) {
  const base = tags ?? [];
  return base.filter(t => t !== tag);
}
