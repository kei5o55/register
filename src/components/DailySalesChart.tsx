import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

type DailyRow = {
    date: string;        // "2026-02-13"
    sale_count: number;  // 10
    total_amount: number;// 12300
};

export function DailySalesChart() {
    const [data, setData] = useState<DailyRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

useEffect(() => {
    const run = async () => {
    try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:3000/analytics/daily");
        const json = await res.json();

        if (!res.ok || !json.ok) {
            throw new Error(json?.error ?? `HTTP ${res.status}`);
        }

        setData(json.data ?? []);
        } catch (e: any) {
            setError(e?.message ?? "failed");
        } finally {
        setLoading(false);
    }
    };

    run();
}, []);

if (loading) return <p>読み込み中...</p>;
if (error) return <p style={{ color: "crimson" }}>エラー: {error}</p>;
if (data.length === 0) return <p>データがありません</p>;

return (
    <div style={{ width: "100%", height: 320 }}>
    <h3 style={{ margin: "8px 0" }}>日別売上（合計金額）</h3>
    <ResponsiveContainer>
        <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total_amount" />
        </BarChart>
    </ResponsiveContainer>
    </div>
);
}