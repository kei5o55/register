// src/components/EventSalesBarChart.tsx
// イベントの売上棒グラフコンポーネント
// Rechartsを使って売上データを棒グラフで表示する

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartRow } from "../logic/eventSalesChart";

type Props = {
  data: ChartRow[];
  unit?: string; // "円" / "件" / "個"
};

export function EventSalesBarChart({ data, unit }: Props) {
  if (data.length === 0) {
    return <p>売上データがありません</p>;
  }

  const yLabel =
    unit === "円"
      ? "売上金額（円）"
      : unit === "件"
      ? "売上件数（件）"
      : unit === "個"
      ? "頒布数（個）"
      : "値";

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="label" />
          <YAxis
            label={{
              value: yLabel,
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            formatter={(v) => (unit ? [`${v} ${unit}`, yLabel] : [v as number, "値"])}
          />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
