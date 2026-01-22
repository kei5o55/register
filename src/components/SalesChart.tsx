// src/components/SalesChart.tsx
// 売上チャートコンポーネント

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { ChartRow } from "../logic/chart";

export function SalesBarChart({ data }: { data: ChartRow[] }) {//受け取ったchartrow型の配列データを棒グラフで表示するコンポーネント
  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
