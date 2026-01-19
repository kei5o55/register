// src/components/HomeScreen.tsx
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

      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, marginBottom: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>現在のイベント</div>

        {currentEvent ? (
          <>
            <div>{currentEvent.name}</div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>{currentEvent.date}</div>
            {currentEvent.memo && <div style={{ opacity: 0.7, fontSize: 12 }}>{currentEvent.memo}</div>}
          </>
        ) : (
          <>
            <div style={{ color: "#b45309" }}>未選択</div>
            <button onClick={onGoEvents} style={{ marginTop: 8 }}>
              イベントを選択する
            </button>
          </>
        )}
        
      </div>
      <h2>イベント別 売上合計</h2>
      <EventSalesBarChart data={chartData} />

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onGoRegister} disabled={!currentEvent}>
          レジへ
        </button>
        <button onClick={onGoHistory}>売上履歴へ</button>
      </div>
    </div>
  );
}
