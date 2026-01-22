// src/logic/eventTimeChart.ts
// イベント内の sales を時間帯ごとに集計するロジック

import type { Sale } from "./types";

export type TimeGroup = "hour" | "minute";
export type Metric = "yen" | "orders";

export type ChartRow = { key: string; label: string; value: number };

const pad2 = (n: number) => String(n).padStart(2, "0");// 2桁ゼロ埋め関数(09:00のようにするため←ソート時に便利)

function safeDate(iso: string): Date | null {// 安全にDateオブジェクトを生成する関数
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;// 無効な日付の場合はnullを返す
}

function dayKey(d: Date) {// 年/月/日 を返す関数
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function hourKey(d: Date) {// 年/月/日 時:00 を返す関数
  return `${dayKey(d)} ${pad2(d.getHours())}:00`;
}
function minuteKey(d: Date) {// 年/月/日 時:分 を返す関数
  return `${dayKey(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}



export function buildEventTimeChart(//イベントの時間帯別売上集計を行う関数（safedateを使用し不明な日時はスキップ．安全に日付処理を行う）
  sales: Sale[],
  group: TimeGroup,// 集計単位（時間または分）
  metric: Metric// 売上・注文数
): ChartRow[] {
  const map = new Map<string, number>();// 時間帯ラベル -> 集計値のマップ

  for (const s of sales) {//s=salesを０～nまで一桁ずつ取り出して参照
    const d = safeDate(s.datetime);// 安全にDateオブジェクトを取得
    if (!d) continue;//null(無効な日付）の場合はスキップ

    const key = group === "hour" ? hourKey(d) : minuteKey(d);// 受け取ったgroupに応じて時間帯キーを取得(時間or分)
    const add = metric === "yen" ? s.total : 1;//受け取ったmetricに応じて加算する値を決定（売上合計or注文数）

    map.set(key, (map.get(key) ?? 0) + add);// 既存の集計値に加算（時間keyごとに集計）
  }

  const rows: ChartRow[] = Array.from(map.entries()).map(([k, v]) => ({//売上データ(map)をChartRow型の配列に変換
    key: k,
    label: k,
    value: v,
  }));

  // 時系列っぽくラベル順
  rows.sort((a, b) => a.label.localeCompare(b.label));
  return rows;
}
