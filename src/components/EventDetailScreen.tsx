//src/components/EventDetailScreren.tsx

import type { Event, Sale } from "../logic/types";
import { buildEventReport } from "../logic/eventReport";
import {EventSalesBarChart} from "../logic/EventSalesBarChart";
import {buildHourlySalesYen} from "../logic/time";
import { useMemo, useState } from "react";
import type { ChartRow } from "../logic/eventSalesChart"; 


type Props = {
  event: Event;
  sales: Sale[];
  onBack: () => void;
};

export function EventDetailScreen({ event, sales, onBack }: Props) {
  const report = buildEventReport(sales);
  const hourlyData = buildHourlySalesYen(sales);

  type ChartMode = "time" | "item";
  type ItemMode = "single" | "bundle" | "total";

  const [chartMode, setChartMode] = useState<ChartMode>("time");
  const [itemMode, setItemMode] = useState<ItemMode>("total");

  const itemChartData: ChartRow[] = useMemo(() => {
    return report.items
      .map((it) => {
        const value =
          itemMode === "single"
            ? it.singleQuantity
            : itemMode === "bundle"
            ? it.bundleQuantity
            : it.totalQuantity;

        return {
          key: it.itemId,
          label: it.name,
          value,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [report.items, itemMode]);


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
      <h3>グラフ</h3>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label>
          表示：
          <select value={chartMode} onChange={(e) => setChartMode(e.target.value as ChartMode)}>
            <option value="time">時間別売上</option>
            <option value="item">頒布物別頒布数</option>
          </select>
        </label>

        {chartMode === "item" && (
          <label>
            内訳：
            <select value={itemMode} onChange={(e) => setItemMode(e.target.value as ItemMode)}>
              <option value="single">単品のみ</option>
              <option value="bundle">バンドルのみ</option>
              <option value="total">合計</option>
            </select>
          </label>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        {chartMode === "time" ? (
          <EventSalesBarChart data={hourlyData} unit="円" />
        ) : (
          <EventSalesBarChart data={itemChartData} unit="個" />
        )}
      </div>
      <button style={{ marginTop: 16 }} onClick={onBack}>
        戻る
      </button>
    </div>
  );
}
