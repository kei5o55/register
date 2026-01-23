// src/components/SaleDetailScreen.tsx
// 売上詳細画面コンポーネント
// 指定された売上(Sale[])の詳細情報を表示する

import type { Sale, Bundle,Event } from "../logic/types";
import  {toMinuteKey} from "../logic/time";

type SaleDetailProps = {
  sale: Sale;
  bundles: Bundle[]; 
  events: Event[];
  onBack: () => void;
  onDelete: () => void;};

export function SaleDetailScreen({ sale, bundles, events, onBack, onDelete }: SaleDetailProps) {
  const bundleLines = sale.bundles ?? [];
  const expanded = sale.bundleExpandedItems ?? [];

  const getBundleName = (bundleId: string) =>
    bundles.find((b) => b.id === bundleId)?.name ?? `(不明なバンドル: ${bundleId})`;
  
  const getBundleById = (bundleId: string) =>
      bundles.find((b) => b.id === bundleId);

  const getEventName = (eventId: string) =>
    events.find((e) => e.id === eventId)?.name ?? `(不明なイベント: ${eventId})`;

  const calcBundleSubtotal = (bundleId: string, quantity: number) => {
    const bundle = getBundleById(bundleId);
    return bundle ? bundle.price * quantity : 0;
  };

  return (
    <div>
      <h2>売上詳細</h2>
      <p>日時: {toMinuteKey(sale.datetime)}</p>{/*toMinuteKeyで日時を見やすく変更(年/月/日/時/分) */}
      <p>イベント: {getEventName(sale.eventId)}</p>
      <p>合計金額: {sale.total} 円</p>

      {/* 単品内訳 */}
      <h3>内訳（単品）</h3>
      {sale.items.length === 0 ? (
        <p>単品の内訳データがありません</p>
      ) : (
        <table border={1} cellPadding={4} style={{ borderCollapse: "collapse", marginBottom: 16 }}>
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

      {/* バンドル購入（バンドル名×個数） */}
      <h3>内訳（バンドル）</h3>
      {bundleLines.length === 0 ? (
        <p>バンドル購入はありません</p>
      ) : (
        <table border={1} cellPadding={4} style={{ borderCollapse: "collapse", marginBottom: 16 }}>
          <thead>
            <tr>
              <th>バンドル</th>
              <th>数量</th>
              <th>金額</th>
            </tr>
          </thead>
          <tbody>
            {bundleLines.map((b) => {
              const bundle = getBundleById(b.bundleId);
              const subtotal = calcBundleSubtotal(b.bundleId, b.quantity);

              return (
                <tr key={b.bundleId}>
                  <td>{bundle?.name ?? `(不明なバンドル)`}</td>
                  <td>{b.quantity}</td>
                  <td>{subtotal} 円</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* バンドル展開内訳（Itemごとの数量：確定スナップショット） */}
      <h3>内訳（バンドル内の頒布物）</h3>
      {expanded.length === 0 ? (
        <p>バンドル内訳データがありません</p>
      ) : (
        <table border={1} cellPadding={4} style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>頒布物</th>
              <th>数量</th>
            </tr>
          </thead>
          <tbody>
            {expanded.map((it) => (
              <tr key={it.itemId}>
                <td>{it.name}</td>
                <td>{it.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button style={{ marginTop: 16 }} onClick={onBack}>
        戻る
      </button>

      <button onClick={onDelete} style={{ color: "red", marginLeft: 8 }}>
        この売り上げを削除
      </button>
    </div>
  );
}
