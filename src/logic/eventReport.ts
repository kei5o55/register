// src/logic/eventReport.ts
// イベントごとの売上・頒布数サマリを生成するロジック

import type { Sale } from "./types";


export type ItemSummary = {// アイテムごとの頒布数サマリ
  itemId: string;
  name: string;
  singleQuantity: number; // 単品
  bundleQuantity: number; // バンドル
  totalQuantity: number;  // 合計
};

export type EventReport = {// イベント全体のサマリ
  totalSalesYen: number;
  totalOrders: number;      // 売上件数
  totalQuantity: number;    // 頒布数合計（単品+バンドル）
  items: ItemSummary[];     // itemごとの単品/バンドル/合計
};

export function buildEventReport(eventSales: Sale[]): EventReport {// 指定イベントの sales を集計

  // 売上合計・件数
  const totalSalesYen = eventSales.reduce((sum, s) => sum + s.total, 0);
  const totalOrders = eventSales.length;

  // itemId -> { name, single, bundle }
  const map = new Map<
    string,
    { name: string; single: number; bundle: number }//(name=名前、single=単品数量、bundle=バンドル数量)
  >();

  // 単品分
  for (const sale of eventSales) {// eventSales配列を１桁ずつループ処理
    for (const it of sale.items) {// sale内の単品購入分をループ処理
      const cur = map.get(it.itemId) ?? { name: it.name, single: 0, bundle: 0 };// itemIdで参照した単品の数量を取得。なければ初期値を設定(0)
      cur.single += it.quantity;// 単品数量を加算
      cur.name = it.name; // 最新名で上書き（バンドル追加後に名前が変わっている可能性があるため）
      map.set(it.itemId, cur);// マップに更新後の値をセット
    }
  }

  // バンドル分（会計時に確定保存した内訳）単品分と同じロジック
  for (const sale of eventSales) {
    for (const it of sale.bundleExpandedItems ?? []) {// bundleExpandedItems=バンドル購入分を単品に展開したもの(バンドル内アイテムの配列[itemId, name, quantity])
      const cur = map.get(it.itemId) ?? { name: it.name, single: 0, bundle: 0 };
      cur.bundle += it.quantity;
      if (!cur.name) cur.name = it.name;
      map.set(it.itemId, cur);
    }
  }

  const items: ItemSummary[] = Array.from(map.entries()).map(([itemId, v]) => ({// イベントごとの頒布数サマリ(map)をItemSummary型の配列に変換
    itemId,
    name: v.name,
    singleQuantity: v.single,
    bundleQuantity: v.bundle,
    totalQuantity: v.single + v.bundle,
  }));

  items.sort((a, b) => b.totalQuantity - a.totalQuantity);// 頒布数合計の多い順にソート

  const totalQuantity = items.reduce((sum, x) => sum + x.totalQuantity, 0);// 頒布数合計を計算

  return { totalSalesYen, totalOrders, totalQuantity, items };// EventReport型のオブジェクトを返す(売上合計、売上件数、頒布数合計、アイテムごとの頒布数サマリ配列)
}
