// src/storage.ts
// IndexedDBを使ったデータ永続化（localStorageからの初回移行つき）

import { openDB, type DBSchema } from "idb";
import type { Item, Sale } from "./types";

const STORAGE_PREFIX = "doujin-regi";
const ITEMS_KEY = `${STORAGE_PREFIX}:items`;
const SALES_KEY = `${STORAGE_PREFIX}:sales`;

const DB_NAME = "doujin-regi-db";
const DB_VERSION = 1;

interface RegiDB extends DBSchema {
  items: {
    key: string; // Item.id
    value: Item;
  };
  sales: {
    key: string; // Sale.id
    value: Sale;
  };
  meta: {
    key: string; // "migrated"
    value: boolean;
  };
}

const dbPromise = openDB<RegiDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    db.createObjectStore("items");
    db.createObjectStore("sales");
    db.createObjectStore("meta");
  },
});

async function getMigrated(): Promise<boolean> {
  const db = await dbPromise;
  return (await db.get("meta", "migrated")) === true;
}
async function setMigrated(v: boolean): Promise<void> {
  const db = await dbPromise;
  await db.put("meta", v, "migrated");
}

async function migrateLocalStorageToIDBOnce(): Promise<void> {
  if (typeof window === "undefined") return;
  if (await getMigrated()) return;

  try {
    const rawItems = localStorage.getItem(ITEMS_KEY);
    const rawSales = localStorage.getItem(SALES_KEY);

    const items = rawItems ? (JSON.parse(rawItems) as Item[]) : [];
    const sales = rawSales ? (JSON.parse(rawSales) as Sale[]) : [];

    const db = await dbPromise;

    // items移行
    if (items.length) {
      const tx = db.transaction("items", "readwrite");
      const store = tx.objectStore("items");
      await store.clear();
      for (const it of items) await store.put(it, it.id);
      await tx.done;
    }

    // sales移行
    if (sales.length) {
      const tx = db.transaction("sales", "readwrite");
      const store = tx.objectStore("sales");
      await store.clear();
      for (const s of sales) await store.put(s, s.id);
      await tx.done;
    }

    await setMigrated(true);

    // ズレ事故防止に消すならここ（まずは残してもOK）
    // localStorage.removeItem(ITEMS_KEY);
    // localStorage.removeItem(SALES_KEY);
  } catch (e) {
    console.error("Failed to migrate localStorage -> IndexedDB:", e);
    // 失敗時は migrated を立てない（次回起動で再挑戦できる）
  }
}

// --- API（App.tsxから呼ぶ）---

export async function loadItems(defaultItems: Item[]): Promise<Item[]> {
  if (typeof window === "undefined") return defaultItems;

  await migrateLocalStorageToIDBOnce();

  try {
    const db = await dbPromise;
    const all = await db.getAll("items");
    return all.length ? all : defaultItems;
  } catch (e) {
    console.error("Failed to load items from IndexedDB:", e);
    return defaultItems;
  }
}

export async function saveItems(items: Item[]): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const db = await dbPromise;
    const tx = db.transaction("items", "readwrite");
    const store = tx.objectStore("items");

    // シンプルに全置換（件数が増えたら差分方式にしてOK）
    await store.clear();
    for (const it of items) await store.put(it, it.id);

    await tx.done;
  } catch (e) {
    console.error("Failed to save items to IndexedDB:", e);
  }
}

export async function loadSales(): Promise<Sale[]> {
  if (typeof window === "undefined") return [];

  await migrateLocalStorageToIDBOnce();

  try {
    const db = await dbPromise;
    return await db.getAll("sales");
  } catch (e) {
    console.error("Failed to load sales from IndexedDB:", e);
    return [];
  }
}

export async function saveSales(sales: Sale[]): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const db = await dbPromise;
    const tx = db.transaction("sales", "readwrite");
    const store = tx.objectStore("sales");

    await store.clear();
    for (const s of sales) await store.put(s, s.id);

    await tx.done;
  } catch (e) {
    console.error("Failed to save sales to IndexedDB:", e);
  }
}
