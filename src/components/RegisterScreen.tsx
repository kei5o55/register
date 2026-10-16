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

  const cartLineClass =
    "mb-2 flex items-center justify-between rounded-md border border-[#eee] bg-white px-2 py-1.5";
  const qtyButtonClass = "px-2.5 py-1 text-sm";
  const isCartEmpty = cart.length === 0 && bundleCart.length === 0;

  return (
  <div className="flex items-start gap-6">
    {/* 左側：商品一覧・バンドル */}
    <div className="flex-1">
      <h2>商品一覧</h2>
      {visibleItems.length === 0 ? (
        <p>頒布物がありません（イベント履歴→設定 から登録できます）</p>
      ) : (
        <ul className="m-0 list-none p-0">
          {visibleItems.map((item) => {
            const remaining = getRemainingStock(item.id);
            const isOutOfStock = remaining <= 0;
            const src = localImageUrls[item.id] ?? item.imageUrl;

            return (
              <li key={item.id} className="mb-2.5">
                {/* カード全体をボタン化 */}
                <button
                  type="button"
                  onClick={() => onAddToCart(item.id)}
                  disabled={isOutOfStock}
                  className={`box-border flex w-full items-center gap-3 rounded-lg border border-[#ccc] px-3.5 py-2.5 text-left ${
                    isOutOfStock
                      ? "cursor-not-allowed bg-[#f5f5f5] opacity-60"
                      : "cursor-pointer bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* 画像エリア */}
                    {src ? (
                      <img
                        key={src}
                        src={src}
                        alt={item.name}
                        className="size-12 shrink-0 rounded-md border border-[#ddd] object-cover"
                        onLoad={(e) => ((e.currentTarget as HTMLImageElement).style.display = "")}
                        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                      />
                    ) : (
                      <div className="grid size-12 shrink-0 place-items-center rounded-md border border-dashed border-[#bbb] text-[10px] text-[#888]">
                        No Img
                      </div>
                    )}

                    {/* テキスト情報 */}
                    <div>
                      <div className="text-[15px] font-bold text-[#222]">
                        {item.name}
                      </div>
                      <div className="mt-0.5 text-[13px] text-[#555]">
                        {item.price}円 / 在庫: {item.stock}（残り: {remaining}）
                      </div>
                    </div>
                  </div>

                  {/* 右端のラベル */}
                  <span className={`shrink-0 text-[13px] font-bold ${isOutOfStock ? "text-[#999]" : "text-[#0066cc]"}`}>
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
        <div className="mb-4 flex flex-col gap-2">
          {visibleBundles.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onAddBundleToCart(b.id)}
              className="box-border flex w-full cursor-pointer items-center justify-between rounded-lg border border-[#cce] bg-[#fcfaff] px-3.5 py-2.5 text-left"
            >
              <div>
                <div className="text-sm font-bold text-[#333]">
                  {b.name}（{b.price}円）
                </div>
                <div className="mt-0.5 text-xs text-[#666]">
                  {b.lines.map((l) => {
                    const item = getItemById(l.itemId);
                    return `${item.name} × ${l.quantity}`;
                  }).join(" / ")}
                </div>
              </div>
              <span className="shrink-0 text-[13px] font-bold text-[#6600cc]">
                ＋追加
              </span>
            </button>
          ))}
        </div>
      )}
    </div>

    {/* 右側：カート（ボタンの押しやすさを微調整） */}
    <div className="flex-1 rounded-lg border border-[#ddd] bg-[#fafafa] p-4">
      <h2>カート</h2>
      {cart.length === 0 ? (
        <p className="text-[#888]">カートは空です</p>
      ) : (
        <ul className="list-none pl-0">
          {cart.map((c) => {
            const item = getItemById(c.itemId);
            return (
              <li key={c.itemId} className={cartLineClass}>
                <span>
                  {item.name} × {c.quantity}
                </span>
                <div className="flex gap-1.5">
                  <button onClick={() => onAddToCart(c.itemId)} className={qtyButtonClass}>＋</button>
                  <button onClick={() => onRemoveFromCart(c.itemId)} className={qtyButtonClass}>−</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {bundleCart.length > 0 && (
        <>
          <h4>バンドル</h4>
          <ul className="list-none pl-0">
            {bundleCart.map((bc) => {
              const b = getBundleById(bc.bundleId);
              const subtotal = b.price * bc.quantity;

              return (
                <li key={bc.bundleId} className={cartLineClass}>
                  <span>
                    {b.name} × {bc.quantity}（{subtotal}円）
                  </span>
                  <div className="flex gap-1.5">
                    <button onClick={() => onAddBundleToCart(bc.bundleId)} className={qtyButtonClass}>＋</button>
                    <button onClick={() => onRemoveBundleFromCart(bc.bundleId)} className={qtyButtonClass}>−</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <hr className="my-4 border-t border-[#ccc]" />
      <p className="text-lg font-bold">合計: {totalPrice} 円</p>
      <button
        onClick={onCheckout}
        disabled={isCartEmpty}
        className={`w-full p-3 text-base font-bold ${isCartEmpty ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        会計確定
      </button>
    </div>
  </div>
);
}
