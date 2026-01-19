// src/storage.ts
import type { Item, Sale } from "./types";

const STORAGE_PREFIX = "doujin-regi";
const ITEMS_KEY = `${STORAGE_PREFIX}:items`;
const SALES_KEY = `${STORAGE_PREFIX}:sales`;

export function loadItems(defaultItems: Item[]): Item[] {
  if (typeof window === "undefined") return defaultItems; // 念のためSSR対策
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

export function saveItems(items: Item[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save items to localStorage:", e);
  }
}

export function loadSales(): Sale[] {
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

export function saveSales(sales: Sale[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  } catch (e) {
    console.error("Failed to save sales to localStorage:", e);
  }
}
