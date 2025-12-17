// src/components/SaleDetailScreen.tsx
import type { Sale } from "../types";

type SaleDetailProps = {
  sale: Sale;
  onBack: () => void;
  onDelete: () => void;
};

export function SaleDetailScreen({ sale, onBack ,onDelete}: SaleDetailProps) {
  return (
    <div>
      <h2>売上詳細</h2>
      <p>日時: {sale.datetime}</p>
      <p>合計金額: {sale.total} 円</p>

      <h3>内訳</h3>
      {sale.items.length === 0 ? (
        <p>内訳データがありません</p>
      ) : (
        <table border={1} cellPadding={4} style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>頒布物</th>
              <th>単価</th>
              <th>数量</th>
              <th>小計</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item) => (
              <tr key={item.itemId}>
                <td>{item.name}</td>
                <td>{item.price} 円</td>
                <td>{item.quantity}</td>
                <td>{item.price * item.quantity} 円</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button style={{ marginTop: 16 }} onClick={onBack}>
        戻る
      </button>
      
      <button onClick={onDelete} style={{color: "red"}}>
            この売り上げを削除
      </button>
    </div>
  );
}
