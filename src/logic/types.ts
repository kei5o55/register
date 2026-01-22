// src/types.ts
// 共通の型定義

export type SaleItem = {
  itemId: string;
  name: string;     // 当時の名前
  price: number;    // 当時の価格
  quantity: number; // 売れた数
};

export type Item = {// 同人アイテム
  id: string;// 一意なID
  name: string;// アイテム名
  price: number;// 価格（円）
  stock: number;// 在庫数
};
export type CartItem = { itemId: string; quantity: number }// カート内の単品アイテム行

export type CartLine =
  | { kind: "item"; itemId: string; quantity: number }
  | { kind: "bundle"; bundleId: string; quantity: number };// カート内の行（単品 or バンドル）

export type BundleLine = {
  itemId: string;
  quantity: number;
};// バンドル内のアイテム行(アイテムIDと個数）

export type Bundle = {// バンドル商品
  id: string;//バンドルごとの一意なID
  name: string;// バンドル名
  lines: BundleLine[]; // 中身（アイテムIDと個数）
  price: number;       // バンドル価格（合計 or 割引価格でもOK）
};

export type SaleBundle = {// 売上内のバンドル購入分
  bundleId: string;// バンドルID(Bundle.id)
  quantity: number;// 売れた個数
};

export type BundleExpandedLine = {// バンドル展開行（Sale内でバンドル購入分を単品に展開したもの）
  itemId: string;    //バンドル内のアイテムID
  name: string;      // その時点の名前（スナップショット）
  quantity: number;  // バンドル由来の売れた個数
};


export type Sale = {// 売上データ
  id: string;//売上Id（一意）
  datetime: string;// 売上日時（ISO文字列）
  total: number;// 合計金額（円）
  items: SaleItem[];        // 単品購入分だけ
  bundles?: SaleBundle[];   // ← バンドル購入分（null許容）
  bundleExpandedItems?: BundleExpandedLine[]; // ← バンドルを行ごとに展開したもの（null許容）
  eventId: string;//Eventidごとに売上を紐づけるためのフィールド
};

export type Event = {
  id: string;
  name: string;// イベント名
  date: string;// 開催日
  memo?: string;// メモ
}

export type Screen = "home" | "register" | "history" | "saleDetail" | "items" | "events";
