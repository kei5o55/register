// src/components/EventHistoryScreen.tsx
// eventの売上履歴画面コンポーネント
// 指定されたイベントに関連する売上データを表示する

import type { Event, Sale } from "../logic/types";
import { HistoryScreen } from "./HistoryScreen"; 

type EventHistoryScreenProps = {
  event: Event;
  sales: Sale[];                // すでにフィルタ済みの配列をもらう
  currentEvent: Event | null; // 追加: 現在のイベント情報も渡す
  onBack: () => void;
  onOpenEventDetail: (id: string) => void;
  onSelectSale: (id: string) => void;
};

export function EventHistoryScreen({
  event,
  sales,
  currentEvent,
  onBack,
  onSelectSale,
  onOpenEventDetail,
}: EventHistoryScreenProps) {
  return (
    <div>
      <h2>{event.name} の売上履歴</h2>
      <p>開催日: {event.date}</p>
      {event.memo && <p>メモ: {event.memo}</p>}

      <hr style={{ margin: "16px 0" }} />

      {/* 既存の HistoryScreen をそのまま再利用 */}
      <HistoryScreen sales={sales} currentEvent={currentEvent} onSelectSale={onSelectSale} />
      
      <button style={{ marginTop: 16 }} onClick={onBack}>
              戻る
      </button>

      <button onClick={() => onOpenEventDetail(event.id)}>
        売上集計
      </button>

      
    </div>
  );
}
