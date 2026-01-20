// src/logic/eventTimeChart.ts
import type { Sale } from "./types";

export type TimeGroup = "hour" | "minute";
export type Metric = "yen" | "orders";

export type ChartRow = { key: string; label: string; value: number };

const pad2 = (n: number) => String(n).padStart(2, "0");

function safeDate(iso: string): Date | null {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function hourKey(d: Date) {
  return `${dayKey(d)} ${pad2(d.getHours())}:00`;
}
function minuteKey(d: Date) {
  return `${dayKey(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function buildEventTimeChart(
  sales: Sale[],
  group: TimeGroup,
  metric: Metric
): ChartRow[] {
  const map = new Map<string, number>();

  for (const s of sales) {
    const d = safeDate(s.datetime);
    if (!d) continue;

    const key = group === "hour" ? hourKey(d) : minuteKey(d);
    const add = metric === "yen" ? s.total : 1;

    map.set(key, (map.get(key) ?? 0) + add);
  }

  const rows: ChartRow[] = Array.from(map.entries()).map(([k, v]) => ({
    key: k,
    label: k,
    value: v,
  }));

  // 時系列っぽくラベル順
  rows.sort((a, b) => a.label.localeCompare(b.label));
  return rows;
}
