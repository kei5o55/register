// src/logic/eventItemChart.ts
// イベント内の sales を Item別の頒布数に集計するロジック

import type { Sale } from "./types";
import type { ChartRow } from "./eventSalesChart"; // ChartRow型を既存から流用

export type ItemMode = "single" | "bundle" | "total";// 集計モード（単品、バンドル、合計）

/** イベント内の sales を Item別の頒布数に集計する */
export function buildEventItemQuantityChart(
  sales: Sale[],
  mode: ItemMode
): ChartRow[] {
  // itemId -> { name, qty }
  const map = new Map<string, { name: string; qty: number }>();

  const add = (itemId: string, name: string, qty: number) => {// 頒布数をマップに追加・更新する関数
    const cur = map.get(itemId);
    if (cur) cur.qty += qty;
    else map.set(itemId, { name, qty });
  };

  for (const s of sales) {// sales配列を１桁ずつループ処理
    if (mode === "single" || mode === "total") {
      for (const it of s.items) {
        add(it.itemId, it.name, it.quantity);
      }
    }

    if (mode === "bundle" || mode === "total") {
      const expanded = s.bundleExpandedItems ?? [];//バンドル内アイテムを個別に展開した配列
      for (const ex of expanded) {
        add(ex.itemId, ex.name, ex.quantity);
      }
    }
  }

  const rows: ChartRow[] = Array.from(map.entries()).map(([itemId, v]) => ({//集計をChartRow型の配列に変換
    key: itemId,
    label: v.name,
    value: v.qty,
  }));

  // 多い順
  rows.sort((a, b) => b.value - a.value);

  return rows;
}
