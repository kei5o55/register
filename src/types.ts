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

export type Sale = {
  id: string;
  datetime: string;
  total: number;
  items: SaleItem[];
};

export type Screen = "home" | "register" | "history" | "saleDetail" | "items";
