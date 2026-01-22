// src/logic/time.ts
// 時間帯ごとの売上集計など

const pad2 = (n: number) => String(n).padStart(2, "0");// 2桁ゼロ埋め関数(09:00のようにするため←ソート時に便利)

export function toHourKey(iso: string) {//iso文字列を受け取り，年/月/日 時 を返す関数
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const h = pad2(d.getHours());
  return `${y}/${m}/${day} ${h}:00`; // 表示用ラベル(00:00形式)
}

export function buildHourlySalesYen(sales: { datetime: string; total: number }[]) {//売上データ配列を受け取り，時間帯ごとの売上合計をChartRow型の配列で返す関数
  const map = new Map<string, number>();// 時間帯ラベル -> 売上合計（円）のマップを作成
  for (const s of sales) {//s=salesを０～nまで一桁ずつ取り出して参照
    const key = toHourKey(s.datetime);//時間帯ラベルを取得(nn:00)
    map.set(key, (map.get(key) ?? 0) + s.total);// 既存の売上合計に加算（時間ごとに集計）
  }
  return Array.from(map.entries())// マップのエントリを配列に変換
    .map(([label, value]) => ({ key: label, label, value }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function toMinuteKey(iso: string): string {// iso文字列を受け取り，年/月/日 時:分 を返す関数
  const d = new Date(iso);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${y}/${m}/${day} ${h}:${min}`;
}
