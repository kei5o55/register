// src/components/HistoryScreen.tsx
// eventの売上履歴画面コンポーネント
// 指定されたイベントに関連する売上データを表示する

import type { Sale,Event } from "../logic/types";

type HistoryProps = {
  sales: Sale[];
  currentEvent: Event | null;
  onSelectSale: (id: string) => void;
};

export function HistoryScreen({ sales, currentEvent, onSelectSale }: HistoryProps) {
  return (
    <div>
      <div className="pageHeader">
        <h2>売上履歴（{sales.length}件）</h2>
      </div>

      {sales.length === 0 ? (
        <p>まだ売上はありません</p>
      ) : (
        <ul>
          {sales.map((sale) => (
            <li key={sale.id} style={{ marginBottom: 8 }}>
              <button onClick={() => onSelectSale(sale.id)}>
                {currentEvent ? currentEvent.name : sale.eventId} - {sale.total} 円  : {sale.items.length}点
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
