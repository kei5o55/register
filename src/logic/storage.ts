// src/logic/storage.ts
import { openDB, type DBSchema } from "idb";
import type { Item, Sale, Event, Bundle, CartItem } from "./types";

const STORAGE_PREFIX = "doujin-regi";
const ITEMS_KEY = `${STORAGE_PREFIX}:items`;
const SALES_KEY = `${STORAGE_PREFIX}:sales`;

const DB_NAME = "doujin-regi-db";
const DB_VERSION = 4;

type BundleCartItem = { bundleId: string; quantity: number };

export type PersistedAppState = {
  currentEventId: string | null;
  eventItemMap: Record<string, string[]>;
  eventBundleMap: Record<string, string[]>;
  cart: CartItem[];
  bundleCart: BundleCartItem[];
  screen: string;
};

interface RegiDB extends DBSchema {
  items: {
    key: string;
    value: Item;
  };
  sales: {
    key: string;
    value: Sale;
  };
  events: {
    key: string;
    value: Event;
  };
  bundles: {
    key: string;
    value: Bundle;
  };
  appState: {
    key: string;
    value: PersistedAppState;
  };
  meta: {
    key: string;
    value: boolean;
  };
  images: {
    key: string;
    value: Blob;
  };
}

const dbPromise = openDB<RegiDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("items")) {
      db.createObjectStore("items");
    }
    if (!db.objectStoreNames.contains("sales")) {
      db.createObjectStore("sales");
    }
    if (!db.objectStoreNames.contains("events")) {
      db.createObjectStore("events");
    }
    if (!db.objectStoreNames.contains("bundles")) {
      db.createObjectStore("bundles");
    }
    if (!db.objectStoreNames.contains("appState")) {
      db.createObjectStore("appState");
    }
    if (!db.objectStoreNames.contains("meta")) {
      db.createObjectStore("meta");
    }
    if (!db.objectStoreNames.contains("images")) {
      db.createObjectStore("images");
    }
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

    if (items.length) {
      const tx = db.transaction("items", "readwrite");
      const store = tx.objectStore("items");
      await store.clear();
      for (const it of items) {
        await store.put(it, it.id);
      }
      await tx.done;
    }

    if (sales.length) {
      const tx = db.transaction("sales", "readwrite");
      const store = tx.objectStore("sales");
      await store.clear();
      for (const s of sales) {
        await store.put(s, s.id);
      }
      await tx.done;
    }

    await setMigrated(true);
  } catch (e) {
    console.error("Failed to migrate localStorage -> IndexedDB:", e);
  }
}

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

    await store.clear();
    for (const it of items) {
      await store.put(it, it.id);
    }

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
    for (const s of sales) {
      await store.put(s, s.id);
    }

    await tx.done;
  } catch (e) {
    console.error("Failed to save sales to IndexedDB:", e);
  }
}

export async function loadEvents(defaultEvents: Event[] = []): Promise<Event[]> {
  if (typeof window === "undefined") return defaultEvents;

  try {
    const db = await dbPromise;
    const all = await db.getAll("events");
    return all.length ? all : defaultEvents;
  } catch (e) {
    console.error("Failed to load events from IndexedDB:", e);
    return defaultEvents;
  }
}

export async function saveEvents(events: Event[]): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const db = await dbPromise;
    const tx = db.transaction("events", "readwrite");
    const store = tx.objectStore("events");

    await store.clear();
    for (const ev of events) {
      await store.put(ev, ev.id);
    }

    await tx.done;
  } catch (e) {
    console.error("Failed to save events to IndexedDB:", e);
  }
}

export async function loadBundles(defaultBundles: Bundle[] = []): Promise<Bundle[]> {
  if (typeof window === "undefined") return defaultBundles;

  try {
    const db = await dbPromise;
    const all = await db.getAll("bundles");
    return all.length ? all : defaultBundles;
  } catch (e) {
    console.error("Failed to load bundles from IndexedDB:", e);
    return defaultBundles;
  }
}

export async function saveBundles(bundles: Bundle[]): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const db = await dbPromise;
    const tx = db.transaction("bundles", "readwrite");
    const store = tx.objectStore("bundles");

    await store.clear();
    for (const bundle of bundles) {
      await store.put(bundle, bundle.id);
    }

    await tx.done;
  } catch (e) {
    console.error("Failed to save bundles to IndexedDB:", e);
  }
}

const DEFAULT_APP_STATE: PersistedAppState = {
  currentEventId: null,
  eventItemMap: {},
  eventBundleMap: {},
  cart: [],
  bundleCart: [],
  screen: "home",
};

export async function loadAppState(): Promise<PersistedAppState> {
  if (typeof window === "undefined") return DEFAULT_APP_STATE;

  try {
    const db = await dbPromise;
    return (await db.get("appState", "main")) ?? DEFAULT_APP_STATE;
  } catch (e) {
    console.error("Failed to load appState from IndexedDB:", e);
    return DEFAULT_APP_STATE;
  }
}

export async function saveAppState(state: PersistedAppState): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const db = await dbPromise;
    await db.put("appState", state, "main");
  } catch (e) {
    console.error("Failed to save appState to IndexedDB:", e);
  }
}

export async function saveItemImage(itemId: string, file: File): Promise<void> {
  const db = await dbPromise;

  const bitmap = await createImageBitmap(file);
  const max = 1024;
  const scale = Math.min(max / bitmap.width, max / bitmap.height, 1);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob: Blob = await new Promise((res) =>
    canvas.toBlob((b) => res(b!), "image/jpeg", 0.85)
  );

  await db.put("images", blob, itemId);
}

export async function loadItemImageBlob(itemId: string): Promise<Blob | null> {
  const db = await dbPromise;
  return (await db.get("images", itemId)) ?? null;
}

export async function deleteItemImage(itemId: string): Promise<void> {
  const db = await dbPromise;
  await db.delete("images", itemId);
}