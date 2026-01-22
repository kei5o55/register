// src/logic/eventSalesChart.ts
// イベントごとの売上合計（円）を配列用に集計するロジック

import type { Sale, Event } from "./types";

export type ChartRow = {// チャートの1行分のデータ
  key: string;// イベントID
  label: string;// イベント名
  value: number;// 売上合計（円）
};

// イベントごとの売上合計（円）
export function buildEventSalesChart(
  sales: Sale[],
  events: Event[]
): ChartRow[] {
  const eventNameById = new Map(events.map(e => [e.id, e.name]));// イベントIDから対応するイベント名のマップ（辞書）を作成
  const map = new Map<string, number>();// イベントIDから売上合計（円）を保持するマップを作成

  for (const sale of sales) {// sales配列を，各saleについてループ処理
    const eventId = sale.eventId;// saleのイベントIDを取得
    map.set(eventId, (map.get(eventId) ?? 0) + sale.total);// eventIdに対応する売上合計（円）を更新
  }

  const rows: ChartRow[] = Array.from(map.entries()).map(([eventId, total]) => ({//Chartrow型の配列を生成
    key: eventId,//keyにはイベントIDを設定
    label: eventNameById.get(eventId) ?? "(不明なイベント)",//EventIdに対応するイベント名をlabelに設定。不明な場合は"(不明なイベント)"とする
    value: total,//eventIdに対応する売上合計（円）をvalueに設定
  }));

  rows.sort((a, b) => b.value - a.value);//配列を売上の多い順にソート

  return rows;// チャート用配列データを返す(ChartRow[])
}
