// src/components/EventSalesBarChart.tsx

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
  unit?: string; // 追加
};

export function EventSalesBarChart({ data, unit }: Props) {
  if (data.length === 0) {
    return <p>売上データがありません</p>;
  }

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip
            formatter={(v) => (unit ? [`${v} ${unit}`, "値"] : [v as number, "値"])}
          />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
