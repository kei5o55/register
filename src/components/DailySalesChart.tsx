// 日別売上チャートコンポーネント
// APIから日別売上データを取得して棒グラフで表示する

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
    date: string;        // 日付（例: "20xx-01-01"）
    sale_count: number;  // 売上数の合計
    total_amount: number;// 売上金額の合計
};

const MOCK_DATA: DailyRow[] = [
    { date: "2026-01-01", sale_count: 5, total_amount: 5000 },
    { date: "2026-01-02", sale_count: 8, total_amount: 8500 },
    { date: "2026-01-03", sale_count: 3, total_amount: 3000 },
];

export function DailySalesChart() {
    const [data, setData] = useState<DailyRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

useEffect(() => {// コンポーネントがマウントされたときにAPIからデータを取得する（１回だけ）
    const run = async () => {
    try {// データ取得開始
        setLoading(true);
        setError(null);
        // fetch("http://localhost:3000/analytics/daily")  ← これを
        const apiUrl = import.meta.env.VITE_API_URL;      // ← こう呼び出す
        fetch(`${apiUrl}/analytics/daily`)                // ← こう使う

        const res = await fetch(`${apiUrl}/analytics/daily`);// API(url)から日別売上データを取得
        const json = await res.json();// 取得したデータをJSONとしてパース

        // URLが設定されていない、またはlocalhostを指している場合はデモデータを表示する（開発環境でAPIが動いていないときの保険）
        if (!apiUrl || apiUrl.includes('localhost')) {
            console.warn("API URLが未設定またはlocalhostです。デモデータを表示します。");
            setData(MOCK_DATA);
            return; // デモデータをセットして以降の処理はスキップ
        }

        if (!res.ok || !json.ok) {// HTTPエラーやAPIエラーが発生した場合
            throw new Error(json?.error ?? `HTTP ${res.status}`);
        }

        setData(json.data ?? []);// 取得したデータをstateに保存（APIのレスポンス形式に合わせてjson.dataを使用）
        } catch (e: any) {// エラー発生
            setError(e?.message ?? "failed");
        } finally {// データ取得完了
        setLoading(false);
    }
    };

    run();// データ取得関数を実行
}, []);

if (loading) return <p>読み込み中...</p>;//(setLoading(true)の間)データが読み込まれていることを表示
if (error) return <p style={{ color: "crimson" }}>エラー: {error}</p>;// エラーが発生した場合はエラーメッセージを表示
if (data.length === 0) return <p>データがありません</p>;// データが空の場合はその旨を表示

return (
    <div style={{ width: "100%", height: 320 }}>
    <h3 style={{ margin: "8px 0" }}>日別売上（合計金額）</h3>
    <ResponsiveContainer>
        <BarChart data={data}>{/* データを棒グラフで表示dataKey="date"で日付をX軸、dataKey="total_amount"で売上金額をY軸に設定(APIから取得したデータのフィールド名に合わせること) */}
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