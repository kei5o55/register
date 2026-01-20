// utils（EventDetailScreen.tsx の上でもOK）
const pad2 = (n: number) => String(n).padStart(2, "0");

export function toHourKey(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const h = pad2(d.getHours());
  return `${y}/${m}/${day} ${h}:00`; // 表示用ラベル
}

export function buildHourlySalesYen(sales: { datetime: string; total: number }[]) {
  const map = new Map<string, number>();
  for (const s of sales) {
    const key = toHourKey(s.datetime);
    map.set(key, (map.get(key) ?? 0) + s.total);
  }
  return Array.from(map.entries())
    .map(([label, value]) => ({ key: label, label, value }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function toMinuteKey(iso: string): string {
  const d = new Date(iso);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${y}/${m}/${day} ${h}:${min}`;
}