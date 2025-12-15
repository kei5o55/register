import type { Sale } from "../types";

export type ItemSummary = {
  itemId: string;
  name: string;
  quantity: number;
};

export type EventReport = {
  totalSalesYen: number;
  totalOrders: number;       // 売上件数
  totalQuantity: number;     // 頒布数合計（全部の合計）
  items: ItemSummary[];      // 頒布物ごとの合計
};

export function buildEventReport(eventSales: Sale[]): EventReport {
  const totalSalesYen = eventSales.reduce((sum, s) => sum + s.total, 0);
  const totalOrders = eventSales.length;

  const map = new Map<string, ItemSummary>();
  let totalQuantity = 0;

  for (const sale of eventSales) {
    for (const it of sale.items) {
      totalQuantity += it.quantity;

      const prev = map.get(it.itemId);
      if (prev) {
        prev.quantity += it.quantity;
      } else {
        map.set(it.itemId, { itemId: it.itemId, name: it.name, quantity: it.quantity });
      }
    }
  }

  const items = [...map.values()].sort((a, b) => b.quantity - a.quantity);

  return { totalSalesYen, totalOrders, totalQuantity, items };
}
