// src/components/HistoryScreen.tsx
// eventの売上履歴画面コンポーネント
// 指定されたイベントに関連する売上データを表示する

import type { Sale } from "../logic/types";
import { toMinuteKey } from "../logic/time";

type HistoryProps = {
  sales: Sale[];
  onSelectSale: (id: string) => void;
};

export function HistoryScreen({ sales, onSelectSale }: HistoryProps) {
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
                {toMinuteKey(sale.datetime)} - {sale.total} 円
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
