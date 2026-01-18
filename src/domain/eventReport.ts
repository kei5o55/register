import type { Sale } from "../types";

export type ItemSummary = {
  itemId: string;
  name: string;
  singleQuantity: number; // 単品
  bundleQuantity: number; // バンドル
  totalQuantity: number;  // 合計
};

export type EventReport = {
  totalSalesYen: number;
  totalOrders: number;      // 売上件数
  totalQuantity: number;    // 頒布数合計（単品+バンドル）
  items: ItemSummary[];     // itemごとの単品/バンドル/合計
};

export function buildEventReport(eventSales: Sale[]): EventReport {
  const totalSalesYen = eventSales.reduce((sum, s) => sum + s.total, 0);
  const totalOrders = eventSales.length;

  // itemId -> { name, single, bundle }
  const map = new Map<
    string,
    { name: string; single: number; bundle: number }
  >();

  // 単品分
  for (const sale of eventSales) {
    for (const it of sale.items) {
      const cur = map.get(it.itemId) ?? { name: it.name, single: 0, bundle: 0 };
      cur.single += it.quantity;
      cur.name = it.name; // 最新名で上書き（好みで固定でもOK）
      map.set(it.itemId, cur);
    }
  }

  // バンドル分（会計時に確定保存した内訳）
  for (const sale of eventSales) {
    for (const it of sale.bundleExpandedItems ?? []) {
      const cur = map.get(it.itemId) ?? { name: it.name, single: 0, bundle: 0 };
      cur.bundle += it.quantity;
      if (!cur.name) cur.name = it.name;
      map.set(it.itemId, cur);
    }
  }

  const items: ItemSummary[] = Array.from(map.entries()).map(([itemId, v]) => ({
    itemId,
    name: v.name,
    singleQuantity: v.single,
    bundleQuantity: v.bundle,
    totalQuantity: v.single + v.bundle,
  }));

  items.sort((a, b) => b.totalQuantity - a.totalQuantity);

  const totalQuantity = items.reduce((sum, x) => sum + x.totalQuantity, 0);

  return { totalSalesYen, totalOrders, totalQuantity, items };
}
