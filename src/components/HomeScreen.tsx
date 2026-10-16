// src/components/HomeScreen.tsx
// eventのホーム画面コンポーネント
// 現在のイベント情報やイベント別売上合計グラフを表示する

import type { Sale,Event } from "../logic/types";
import { buildEventSalesChart } from "../logic/eventSalesChart";
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
  const chartData = buildEventSalesChart(sales, events);
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
