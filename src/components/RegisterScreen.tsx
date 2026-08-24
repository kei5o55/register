// src/components/RegisterScreen.tsx
// 頒布会レジ画面コンポーネント
// 頒布物の一覧表示、カート操作、会計処理を行う

import type{ Item, CartItem, Bundle } from "../logic/types";
import { useEffect, useState } from "react";
import { loadItemImageBlob } from "../logic/storage";


type BundleCartItem = { bundleId: string; quantity: number };

type RegisterProps = {
  items: Item[];
  bundles: Bundle[];

  // 追加：このイベントで表示したいID（null/undefinedなら全表示にする）
  enabledItemIds?: string[];
  enabledBundleIds?: string[];

  cart: CartItem[];
  bundleCart: BundleCartItem[];
  totalPrice: number;

  onAddToCart: (itemId: string) => void;
  onAddBundleToCart: (bundleId: string) => void;
  onRemoveFromCart: (itemId: string) => void;
  onRemoveBundleFromCart: (bundleId: string) => void;

  onCheckout: () => void;

  getItemById: (id: string) => Item;
  getBundleById: (id: string) => Bundle;
  getRemainingStock: (itemId: string) => number;
};


export function RegisterScreen({
  items,
  bundles,
  enabledItemIds,
  enabledBundleIds,
  cart,
  bundleCart,
  totalPrice,
  onAddToCart,
  onAddBundleToCart,
  onRemoveFromCart,
  onRemoveBundleFromCart,
  onCheckout,
  getItemById,
  getBundleById,
  getRemainingStock,
}: RegisterProps) {
    const enabledItemSet = enabledItemIds ? new Set(enabledItemIds) : null;
    const enabledBundleSet = enabledBundleIds ? new Set(enabledBundleIds) : null;
    const [localImageUrls, setLocalImageUrls] = useState<Record<string, string>>({});
    
    const visibleItems = enabledItemSet
      ? items.filter((it) => enabledItemSet.has(it.id))
      : items;

    const visibleBundles = enabledBundleSet
      ? bundles.filter((b) => enabledBundleSet.has(b.id))
      : bundles;

    

    useEffect(() => {
    let alive = true;
    const created: string[] = [];

    (async () => {
      const entries: [string, string][] = [];

      // 表示対象だけ読む（軽い）
      for (const it of visibleItems) {
        const blob = await loadItemImageBlob(it.id);
        if (blob) {
          const url = URL.createObjectURL(blob);
          created.push(url);
          entries.push([it.id, url]);
        }
      }

      if (alive) {
        // 以前のURLを掃除して差し替え
        setLocalImageUrls((prev) => {
          Object.values(prev).forEach((u) => URL.revokeObjectURL(u));
          return Object.fromEntries(entries);
        });
      } else {
        created.forEach(URL.revokeObjectURL);
      }
    })();

    return () => {
      alive = false;
      created.forEach(URL.revokeObjectURL);
    };
  }, []);

  return (
  <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
    {/* 左側：商品一覧・バンドル */}
    <div style={{ flex: 1 }}>
      <h2>商品一覧</h2>
      {visibleItems.length === 0 ? (
        <p>頒布物がありません（イベント履歴→設定 から登録できます）</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {visibleItems.map((item) => {
            const remaining = getRemainingStock(item.id);
            const isOutOfStock = remaining <= 0;
            const src = localImageUrls[item.id] ?? item.imageUrl;

            return (
              <li key={item.id} style={{ marginBottom: 10 }}>
                {/* カード全体をボタン化 */}
                <button
                  type="button"
                  onClick={() => onAddToCart(item.id)}
                  disabled={isOutOfStock}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                   
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    backgroundColor: isOutOfStock ? "#f5f5f5" : "#fff",
                    cursor: isOutOfStock ? "not-allowed" : "pointer",
                    textAlign: "left",
                    opacity: isOutOfStock ? 0.6 : 1,
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* 画像エリア */}
                    {src ? (
                      <img
                        key={src}
                        src={src}
                        alt={item.name}
                        style={{
                          width: 48,
                          height: 48,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "1px solid #ddd",
                          flexShrink: 0,
                        }}
                        onLoad={(e) => ((e.currentTarget as HTMLImageElement).style.display = "")}
                        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                      />
                    ) : (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 6,
                          border: "1px dashed #bbb",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 10,
                          color: "#888",
                          flexShrink: 0,
                        }}
                      >
                        No Img
                      </div>
                    )}

                    {/* テキスト情報 */}
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: 15, color: "#222" }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>
                        {item.price}円 / 在庫: {item.stock}（残り: {remaining}）
                      </div>
                    </div>
                  </div>

                  {/* 右端のラベル */}
                  <span style={{ fontSize: 13, fontWeight: "bold", color: isOutOfStock ? "#999" : "#0066cc", flexShrink: 0 }}>
                    {isOutOfStock ? "売り切れ" : "＋追加"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <h3>バンドル</h3>
      {visibleBundles.length === 0 ? (
        <p>バンドルがありません（イベント履歴→設定 から登録できます）</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {visibleBundles.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onAddBundleToCart(b.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #cce",
                backgroundColor: "#fcfaff",
                cursor: "pointer",
                textAlign: "left",
                boxSizing: "border-box",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold", fontSize: 14, color: "#333" }}>
                  {b.name}（{b.price}円）
                </div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                  {b.lines.map((l) => {
                    const item = getItemById(l.itemId);
                    return `${item.name} × ${l.quantity}`;
                  }).join(" / ")}
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: "bold", color: "#6600cc", flexShrink: 0 }}>
                ＋追加
              </span>
            </button>
          ))}
        </div>
      )}
    </div>

    {/* 右側：カート（ボタンの押しやすさを微調整） */}
    <div style={{ flex: 1, padding: 16, border: "1px solid #ddd", borderRadius: 8, backgroundColor: "#fafafa" }}>
      <h2>カート</h2>
      {cart.length === 0 ? (
        <p style={{ color: "#888" }}>カートは空です</p>
      ) : (
        <ul style={{ paddingLeft: 0, listStyle: "none" }}>
          {cart.map((c) => {
            const item = getItemById(c.itemId);
            return (
              <li
                key={c.itemId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  padding: "6px 8px",
                  backgroundColor: "#fff",
                  borderRadius: 6,
                  border: "1px solid #eee"
                }}
              >
                <span>
                  {item.name} × {c.quantity}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => onAddToCart(c.itemId)} style={{ padding: "4px 10px", fontSize: 14 }}>＋</button>
                  <button onClick={() => onRemoveFromCart(c.itemId)} style={{ padding: "4px 10px", fontSize: 14 }}>−</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {bundleCart.length > 0 && (
        <>
          <h4>バンドル</h4>
          <ul style={{ paddingLeft: 0, listStyle: "none" }}>
            {bundleCart.map((bc) => {
              const b = getBundleById(bc.bundleId);
              const subtotal = b.price * bc.quantity;

              return (
                <li
                  key={bc.bundleId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    padding: "6px 8px",
                    backgroundColor: "#fff",
                    borderRadius: 6,
                    border: "1px solid #eee"
                  }}
                >
                  <span>
                    {b.name} × {bc.quantity}（{subtotal}円）
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => onAddBundleToCart(bc.bundleId)} style={{ padding: "4px 10px", fontSize: 14 }}>＋</button>
                    <button onClick={() => onRemoveBundleFromCart(bc.bundleId)} style={{ padding: "4px 10px", fontSize: 14 }}>−</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "16px 0" }} />
      <p style={{ fontSize: 18, fontWeight: "bold" }}>合計: {totalPrice} 円</p>
      <button
        onClick={onCheckout}
        disabled={cart.length === 0 && bundleCart.length === 0}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: 16,
          fontWeight: "bold",
          cursor: cart.length === 0 && bundleCart.length === 0 ? "not-allowed" : "pointer"
        }}
      >
        会計確定
      </button>
    </div>
  </div>
);
}
