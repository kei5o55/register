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

export type CartItem = {
  itemId: string;
  quantity: number;
};
export type Bandel = {
  BandleId: string;
  itemId: string[];
  naem:string;
  price: number;
  stock: number;
};

export type Sale = {
  id: string;
  datetime: string;
  total: number;
  items: SaleItem[];
  eventId: string;//Eventidごとに売上を紐づけるためのフィールド
};

export type Event = {
  id: string;
  name: string;// イベント名
  date: string;// 開催日
  memo?: string;// メモ
}

export type Screen = "home" | "register" | "history" | "saleDetail" | "items" | "events";
