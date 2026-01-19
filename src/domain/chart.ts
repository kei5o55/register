import type { Sale, Event } from "../types";

export type ChartRow = {
  key: string;   // グループキー（eventId や YYYY-MM-DD など）
  label: string; // 表示名
  value: number; // 集計値
};

function ymd(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function hourKey(date: Date) {
  const h = String(date.getHours()).padStart(2, "0");
  return `${ymd(date)} ${h}:00`;
}

// ⭐ ここだけ差し替えれば拡張できる
export function buildChartData(
  sales: Sale[],
  events: Event[],
  groupBy: "event" | "day" | "hour",
  metric: "yen" | "orders"
): ChartRow[] {
  const eventNameById = new Map(events.map(e => [e.id, e.name]));

  // group key extractor
  const getGroup = (s: Sale) => {
    if (groupBy === "event") return s.eventId;
    const dt = new Date(s.datetime); // もし datetime が toLocaleString なら後述の注意あり
    if (groupBy === "day") return ymd(dt);
    return hourKey(dt); // hour
  };

  // metric extractor
  const getValue = (s: Sale) => {
    if (metric === "yen") return s.total;
    return 1; // orders
  };

  const map = new Map<string, number>();

  for (const s of sales) {
    const k = getGroup(s);
    map.set(k, (map.get(k) ?? 0) + getValue(s));
  }

  const rows: ChartRow[] = Array.from(map.entries()).map(([key, value]) => {
    const label =
      groupBy === "event"
        ? (eventNameById.get(key) ?? `(不明イベント)`)
        : key;
    return { key, label, value };
  });

  // 並び：イベントは売上順、時間は時系列っぽく
  rows.sort((a, b) =>
    groupBy === "event" ? b.value - a.value : a.label.localeCompare(b.label)
  );

  return rows;
}
