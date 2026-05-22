// src/components/EventDetailScreen.tsx
import type { Event, Sale } from "../logic/types";
import { buildEventReport } from "../logic/eventReport";
import { EventSalesBarChart } from "./EventSalesBarChart";
import { buildEventBundleQuantityChart } from "../logic/eventBundleCart";
import { useMemo, useState } from "react";
import type { ChartRow } from "../logic/eventSalesChart"; 

type Props = {
  event: Event;
  sales: Sale[];
  onBack: () => void;
};

type ChartMode = "time" | "item" | "bundle";
type TimeMode = "hour" | "half hour" | "quarter hour";
type ItemMode = "single" | "bundle" | "total";

export function EventDetailScreen({ event, sales, onBack }: Props) {
  const report = buildEventReport(sales);
  const bundleChartData = buildEventBundleQuantityChart(sales);

  const [chartMode, setChartMode] = useState<ChartMode>("time");
  const [itemMode, setItemMode] = useState<ItemMode>("total");
  const [timeMode, setTimeMode] = useState<TimeMode>("hour");

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

  // 「時間」「30分」「15分」を切り替えて集計するロジック
  const timeChartData: ChartRow[] = useMemo(() => {
    const map = new Map<string, number>();

    for (const sale of sales) {
      // 型定義に合わせて sale.datetime から日付オブジェクトを作成
      // 日時が空文字などの不正なデータだった場合の安全策として、パースできない場合はスキップします
      if (!sale.datetime) continue;
      
      const date = new Date(sale.datetime);
      if (isNaN(date.getTime())) continue; // 不正な日付文字列のガード

      const hour = date.getHours();
      const minute = date.getMinutes();

      let timeLabel = "";

      if (timeMode === "hour") {
        // 時間単位： "10:00", "11:00"
        timeLabel = `${String(hour).padStart(2, "0")}:00`;
      } else if (timeMode === "half hour") {
        // 30分単位：0〜29分なら "10:00"、30〜59分なら "10:30"
        const m = minute < 30 ? "00" : "30";
        timeLabel = `${String(hour).padStart(2, "0")}:${m}`;
      } else if (timeMode === "quarter hour") {
        // 15分単位：15分刻み（00, 15, 30, 45）に切り捨て
        let m = "00";
        if (minute >= 15 && minute < 30) m = "15";
        else if (minute >= 30 && minute < 45) m = "30";
        else if (minute >= 45) m = "45";
        
        timeLabel = `${String(hour).padStart(2, "0")}:${m}`;
      }

      // 既存の合計金額に、今回の売上（sale.total）を加算
      const currentSum = map.get(timeLabel) ?? 0;
      map.set(timeLabel, currentSum + sale.total);
    }

    // MapからRecharts用の配列に変換し、時系列（"10:00" -> "10:15"）順にソート
    return Array.from(map.entries())
      .map(([label, value]) => ({
        key: label,
        label,
        value,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [sales, timeMode]);

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
            <option value="bundle">バンドル別頒布数</option>
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
        {chartMode === "time" && (
          <label>
            単位：
            <select value={timeMode} onChange={(e) => setTimeMode(e.target.value as TimeMode)}>
              <option value="hour">時間</option>
              <option value="half hour">30分</option>
              <option value="quarter hour">15分</option>
            </select>
          </label>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        {/* ★ 渡すデータを hourlyData から 新しく作った timeChartData に変更 */}
        {chartMode === "time" && (
          <EventSalesBarChart data={timeChartData} unit="円" />
        )}

        {chartMode === "item" && (
          <EventSalesBarChart data={itemChartData} unit="個" />
        )}

        {chartMode === "bundle" && (
          <EventSalesBarChart data={bundleChartData} unit="個" />
        )}
      </div>

      <button style={{ marginTop: 16 }} onClick={onBack}>
        戻る
      </button>
    </div>
  );
}