// src/logic/charts.ts
import type { Event, Sale } from "./types";

export type GroupBy = "event" | "day" | "hour";
export type Metric = "yen" | "orders";

export type ChartRow = {
  key: string;
  label: string;
  value: number;
};

function ymd(dt: Date) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function hourLabel(dt: Date) {
  const h = String(dt.getHours()).padStart(2, "0");
  return `${ymd(dt)} ${h}:00`;
}

function safeParseDate(datetime: string): Date | null {
  const d = new Date(datetime);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function buildChartData(
  sales: Sale[],
  events: Event[],
  groupBy: GroupBy,
  metric: Metric
): ChartRow[] {
  const eventNameById = new Map(events.map((e) => [e.id, e.name]));

  const getGroupKey = (s: Sale): { key: string; label: string } | null => {
    if (groupBy === "event") {
      const label = eventNameById.get(s.eventId) ?? "(不明なイベント)";
      return { key: s.eventId, label };
    }

    const dt = safeParseDate(s.datetime);
    if (!dt) return null;

    if (groupBy === "day") {
      const k = ymd(dt);
      return { key: k, label: k };
    }

    const k = hourLabel(dt);
    return { key: k, label: k };
  };

  const getMetricValue = (s: Sale) => (metric === "yen" ? s.total : 1);

  const map = new Map<string, { label: string; value: number }>();

  for (const s of sales) {
    const g = getGroupKey(s);
    if (!g) continue;

    const cur = map.get(g.key);
    const add = getMetricValue(s);
    if (cur) {
      cur.value += add;
    } else {
      map.set(g.key, { label: g.label, value: add });
    }
  }

  const rows: ChartRow[] = Array.from(map.entries()).map(([key, v]) => ({
    key,
    label: v.label,
    value: v.value,
  }));

  // eventは値順、それ以外は時系列っぽくラベル順
  rows.sort((a, b) =>
    groupBy === "event" ? b.value - a.value : a.label.localeCompare(b.label)
  );

  return rows;
}
