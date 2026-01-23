// src/components/EventTimeChartPanel.tsx
// イベントの時間別売上グラフパネルコンポーネント
// 売上データを時間別に集計し、グラフで表示する

import { useMemo, useState } from "react";
import type { Sale } from "../logic/types";
import { buildEventTimeChart, type TimeGroup, type Metric } from "../logic/eventTimeChart";
import { EventSalesBarChart } from "./EventSalesBarChart";

export function EventTimeChartPanel({ sales }: { sales: Sale[] }) {
  const [group, setGroup] = useState<TimeGroup>("hour");
  const [metric, setMetric] = useState<Metric>("yen");

  const data = useMemo(
    () => buildEventTimeChart(sales, group, metric),
    [sales, group, metric]
  );

  return (
    <div style={{ marginTop: 16 }}>
      <h3>時間別 {metric === "yen" ? "売上" : "注文件数"}</h3>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label>
          粒度：
          <select value={group} onChange={(e) => setGroup(e.target.value as TimeGroup)}>
            <option value="hour">時間ごと</option>
            <option value="minute">分ごと</option>
          </select>
        </label>

        <label>
          指標：
          <select value={metric} onChange={(e) => setMetric(e.target.value as Metric)}>
            <option value="yen">売上（円）</option>
            <option value="orders">注文件数（件）</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <EventSalesBarChart data={data} />
      </div>
    </div>
  );
}
