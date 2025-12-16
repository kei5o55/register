// src/components/EventHistoryScreen.tsx
import type { Event, Sale } from "../types";
import { HistoryScreen } from "./HistoryScreen"; // 既存を再利用するなら

type EventHistoryScreenProps = {
  event: Event;
  sales: Sale[];                // すでにフィルタ済みの配列をもらう
  onBack: () => void;
  onOpenEventDetail: (id: string) => void;
  onSelectSale: (id: string) => void;
};

export function EventHistoryScreen({
  event,
  sales,
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
      <HistoryScreen sales={sales} onSelectSale={onSelectSale} />

      <button onClick={() => onOpenEventDetail(event.id)}>
        売上詳細
      </button>

      <button style={{ marginTop: 16 }} onClick={onBack}>
        イベント一覧に戻る
      </button>
    </div>
  );
}
