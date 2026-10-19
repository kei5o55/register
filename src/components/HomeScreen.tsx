// src/components/HomeScreen.tsx
// eventのホーム画面コンポーネント
// 現在のイベント情報やイベント別売上合計グラフを表示する

import { useState } from "react";
import type { Sale,Event } from "../logic/types";
import { buildEventSalesChart, listSaleYears, type SortOrder } from "../logic/eventSalesChart";
import { EventSalesBarChart } from "./EventSalesBarChart";


type HomeProps = {
  sales:Sale[];
  events:Event[];
  currentEvent: Event | null;//現在のイベントを持つ
  onGoRegister: () => void;
  onGoHistory: () => void;
  onGoEvents: () => void;
};

export function HomeScreen({ sales,events,currentEvent,onGoRegister, onGoHistory,onGoEvents}: HomeProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");// グラフの並び順（デフォルトは昇順）
  const [year, setYear] = useState<number | null>(null);// 表示する年（null は全期間）
  const years = listSaleYears(sales);// 選択肢となる年の一覧
  const chartData = buildEventSalesChart(sales, events, sortOrder, year);
  return (
    <div>
      <h2>ホーム</h2>

      <div className="mb-3 rounded-lg border border-[#ddd] p-3">
        <div className="mb-1.5 font-bold">現在のイベント</div>

        {currentEvent ? (
          <>
            <div>{currentEvent.name}</div>
            <div className="text-xs opacity-70">{currentEvent.date}</div>
            {currentEvent.memo && <div className="text-xs opacity-70">{currentEvent.memo}</div>}
          </>
        ) : (
          <>
            <div className="text-[#b45309]">未選択</div>
            <button onClick={onGoEvents} className="mt-2">
              イベントを選択する
            </button>
          </>
        )}
        
      </div>
      <h2>イベント別 売上合計</h2>
      <div className="mb-2 flex justify-end gap-2">
        <select
          value={year ?? "all"}
          onChange={(e) => setYear(e.target.value === "all" ? null : Number(e.target.value))}
        >
          <option value="all">全期間</option>
          {years.map(y => (
            <option key={y} value={y}>{y}年</option>
          ))}
        </select>
        <button onClick={() => setSortOrder(o => (o === "asc" ? "desc" : "asc"))}>
          {sortOrder === "asc" ? "昇順 ▲" : "降順 ▼"}
        </button>
      </div>
      <EventSalesBarChart data={chartData} unit="円" />

      <div className="flex gap-2">
        <button onClick={onGoRegister} disabled={!currentEvent}>
          レジへ
        </button>
        <button onClick={onGoHistory}>売上履歴へ</button>
      </div>
    </div>
  );
}
