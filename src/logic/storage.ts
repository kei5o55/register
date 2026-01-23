// src/storage.ts
// localStorageを使ったデータの永続化ロジック

import type { Item, Sale } from "./types";

const STORAGE_PREFIX = "doujin-regi";// localStorage内でのキー接頭辞
const ITEMS_KEY = `${STORAGE_PREFIX}:items`;// アイテムデータ保存用キー
const SALES_KEY = `${STORAGE_PREFIX}:sales`;// 売上データ保存用キー
const EVENTS_KEY = `${STORAGE_PREFIX}:events`;// イベントデータ保存用キー

export function loadItems(defaultItems: Item[]): Item[] {// アイテムデータをlocalStorageから読み込む関数
  if (typeof window === "undefined") return defaultItems;// サーバーサイドではlocalStorageは使えないのでデフォルトを返す
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    if (!raw) return defaultItems;
    const data = JSON.parse(raw) as Item[];
    return data;
  } catch (e) {
    console.error("Failed to load items from localStorage:", e);
    return defaultItems;
  }
}

export function saveItems(items: Item[]) {// アイテムデータをlocalStorageに保存する関数
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save items to localStorage:", e);
  }
}

export function loadSales(): Sale[] {// 売上データをlocalStorageから読み込む関数
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SALES_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Sale[];
    return data;
  } catch (e) {
    console.error("Failed to load sales from localStorage:", e);
    return [];
  }
}

export function saveSales(sales: Sale[]) {// 売上データをlocalStorageに保存する関数
  if (typeof window === "undefined") return;//
  try {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  } catch (e) {
    console.error("Failed to save sales to localStorage:", e);
  }
}
