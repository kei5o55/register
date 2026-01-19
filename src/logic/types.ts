// src/types.ts
export type SaleItem = {
  itemId: string;
  name: string;     // 当時の名前
  price: number;    // 当時の価格
  quantity: number; // 売れた数
};

export type Item = {
  id: string;
  name: string;
  price: number;
  stock: number;
};
export type CartItem = { itemId: string; quantity: number }

export type CartLine =
  | { kind: "item"; itemId: string; quantity: number }
  | { kind: "bundle"; bundleId: string; quantity: number };

export type BundleLine = {
  itemId: string;
  quantity: number;
};

export type Bundle = {
  id: string;
  name: string;
  lines: BundleLine[]; // 中身（アイテムIDと個数）
  price: number;       // バンドル価格（合計 or 割引価格でもOK）
};

export type SaleBundle = {
  bundleId: string;
  quantity: number;
};

export type BundleExpandedLine = {
  itemId: string;
  name: string;      // その時点の名前（スナップショット）
  quantity: number;  // バンドル由来の売れた個数
};


export type Sale = {
  id: string;
  datetime: string;
  total: number;
  items: SaleItem[];        // 単品購入分だけ
  bundles?: SaleBundle[];   // ← バンドル購入分
  bundleExpandedItems?: BundleExpandedLine[]; 
  eventId: string;//Eventidごとに売上を紐づけるためのフィールド
};

export type Event = {
  id: string;
  name: string;// イベント名
  date: string;// 開催日
  memo?: string;// メモ
}

export type Screen = "home" | "register" | "history" | "saleDetail" | "items" | "events";
