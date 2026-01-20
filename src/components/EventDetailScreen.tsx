import type { Event, Sale } from "../logic/types";
import { buildEventReport } from "../logic/eventReport";
import {EventSalesBarChart} from "./EventSalesBarChart";
import {buildHourlySalesYen} from "../logic/time";

type Props = {
  event: Event;
  sales: Sale[];
  onBack: () => void;
};

export function EventDetailScreen({ event, sales, onBack }: Props) {
  const report = buildEventReport(sales);
  const hourlyData = buildHourlySalesYen(sales);

  return (
    <div>
      <h2>{event.name}（詳細）</h2>
      <p>開催日: {event.date}</p>
      {event.memo && <p>メモ: {event.memo}</p>}
      <p>このイベントの売上件数: {sales.length} 件</p>
      <p>総売上: {sales.reduce((sum, s) => sum + s.total, 0)} 円</p>


      <hr style={{ margin: "16px 0" }} />

      <h3>サマリ</h3>
      <ul>
        <li>総売上: {report.totalSalesYen} 円</li>
        <li>売上件数: {report.totalOrders} 件</li>
        <li>総頒布数: {report.totalQuantity} 点</li>
      </ul>

      <h3>頒布数（頒布物ごと）</h3>
      {report.items.length === 0 ? (
        <p>売上がありません</p>
      ) : (
        <table border={1} cellPadding={6} style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>頒布物</th>
              <th>単品</th>
              <th>バンドル</th>
              <th>合計</th>
            </tr>
          </thead>
          <tbody>
            {report.items.map((it) => (
              <tr key={it.itemId}>
                <td>{it.name}</td>
                <td>{it.singleQuantity}</td>
                <td>{it.bundleQuantity}</td>
                <td>{it.totalQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h3>時間別売上（合計）</h3>
      <EventSalesBarChart data={hourlyData} unit="円" />

      <button style={{ marginTop: 16 }} onClick={onBack}>
        戻る
      </button>
    </div>
  );
}
