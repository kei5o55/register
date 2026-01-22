// src/logic/eventBundleCart.ts
// イベントごとのバンドルの頒布数をchart用に集計するロジック

import type { Sale } from "./types";
import type { ChartRow } from "./eventSalesChart"; // ChartRow型を既存から流用してOK

/** イベント内の sales を bundle別の頒布数に集計する */
export function buildEventBundleQuantityChart(
  sales: Sale[],
): ChartRow[] {
  // itemId -> { name, qty }
  const map = new Map<string, { name: string; qty: number }>();

  const add = (bundleId: string, name: string, qty: number) => {
    const cur = map.get(bundleId);
    if (cur) cur.qty += qty;
    else map.set(bundleId, { name, qty });
  };

  for (const s of sales) {
      const expanded = s.bundles ?? [];
      for (const ex of expanded) {
        add(ex.bundleId, ex.name, ex.quantity);
    }
  }

  const rows: ChartRow[] = Array.from(map.entries()).map(([bundleId, v]) => ({
    key: bundleId,
    label: v.name,
    value: v.qty,
  }));

  // 多い順
  rows.sort((a, b) => b.value - a.value);

  return rows;
}