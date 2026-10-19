// src/logic/eventSalesChart.ts
// イベントごとの売上合計（円）を配列用に集計するロジック

import type { Sale, Event } from "./types";

export type ChartRow = {// チャートの1行分のデータ
  key: string;// イベントID
  label: string;// イベント名
  value: number;// 売上合計（円）
};

export type SortOrder = "asc" | "desc";// 昇順 / 降順

// 売上日時（ISO文字列）から年を取得する
function saleYear(sale: Sale): number {
  return new Date(sale.datetime).getFullYear();
}

// 売上データに含まれる年の一覧（新しい順）
export function listSaleYears(sales: Sale[]): number[] {
  const years = new Set(sales.map(saleYear).filter(y => !Number.isNaN(y)));// 重複を除いた年の集合
  return Array.from(years).sort((a, b) => b - a);
}

// イベントごとの売上合計（円）
// year を指定した場合は、その年の売上だけを集計する（null なら全期間）
export function buildEventSalesChart(
  sales: Sale[],
  events: Event[],
  order: SortOrder = "asc",
  year: number | null = null
): ChartRow[] {
  const eventNameById = new Map(events.map(e => [e.id, e.name]));// イベントIDから対応するイベント名のマップ（辞書）を作成
  const map = new Map<string, number>();// イベントIDから売上合計（円）を保持するマップを作成

  for (const sale of sales) {// sales配列を，各saleについてループ処理
    if (year !== null && saleYear(sale) !== year) continue;// 指定年以外の売上は除外
    const eventId = sale.eventId;// saleのイベントIDを取得
    map.set(eventId, (map.get(eventId) ?? 0) + sale.total);// eventIdに対応する売上合計（円）を更新
  }

  const rows: ChartRow[] = Array.from(map.entries()).map(([eventId, total]) => ({//Chartrow型の配列を生成
    key: eventId,//keyにはイベントIDを設定
    label: eventNameById.get(eventId) ?? "(不明なイベント)",//EventIdに対応するイベント名をlabelに設定。不明な場合は"(不明なイベント)"とする
    value: total,//eventIdに対応する売上合計（円）をvalueに設定
  }));

  rows.sort((a, b) => (order === "asc" ? a.value - b.value : b.value - a.value));//売上金額で昇順または降順にソート

  return rows;// チャート用配列データを返す(ChartRow[])
}
