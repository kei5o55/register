import type { Sale, Event } from "./types";

export type ChartRow = {
  key: string;
  label: string;
  value: number;
};

// イベントごとの売上合計（円）
export function buildEventSalesChart(
  sales: Sale[],
  events: Event[]
): ChartRow[] {
  const eventNameById = new Map(events.map(e => [e.id, e.name]));
  const map = new Map<string, number>();

  for (const sale of sales) {
    const eventId = sale.eventId;
    map.set(eventId, (map.get(eventId) ?? 0) + sale.total);
  }

  const rows: ChartRow[] = Array.from(map.entries()).map(([eventId, total]) => ({
    key: eventId,
    label: eventNameById.get(eventId) ?? "(不明なイベント)",
    value: total,
  }));

  // 売上の多い順
  rows.sort((a, b) => b.value - a.value);

  return rows;
}
