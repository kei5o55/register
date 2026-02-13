// src/components/RegisterScreen.tsx
// 頒布会レジ画面コンポーネント
// 頒布物の一覧表示、カート操作、会計処理を行う

import type{ Item, CartItem, Bundle } from "../logic/types";

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

    //テスト用販売データ送信関数
    const sendSale = async () => {
    const payload = {
      sale_id: crypto.randomUUID(),
      device_id: "dev-001",
      sold_at: new Date().toISOString(),
      total_amount: 1200,
      items: [
        { item_id: "A", name: "本", price: 600, qty: 1 },
        { item_id: "B", name: "ステッカー", price: 300, qty: 2 },
      ],
    };

  const res = await fetch("http://localhost:3000/sales/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  console.log(json);
  alert(JSON.stringify(json));
};


    const visibleItems = enabledItemSet
      ? items.filter((it) => enabledItemSet.has(it.id))
      : items;

    const visibleBundles = enabledBundleSet
      ? bundles.filter((b) => enabledBundleSet.has(b.id))
      : bundles;

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
        <h2>商品一覧</h2>
        {visibleItems.length === 0 ? (
          <p>頒布物がありません（頒布物管理で追加できます）</p>
        ) : (
        <ul>
          {visibleItems.map((item) => {
            const remaining = getRemainingStock(item.id);//在庫からカート分を引いた残り数を取得
            return (
              <li key={item.id} style={{ marginBottom: 8 }}>
                <div>
                  {item.name} / {item.price}円 / 在庫: {item.stock}
                  {"（残り: "}{remaining}{"）"}
                </div>
                <button
                  onClick={() => onAddToCart(item.id)}
                  disabled={remaining <= 0}//在庫が0以下ならボタンを無効化
                >
                  カートに追加
                </button>
              </li>
            );
          })}
        </ul>
        )}
        <h3>バンドル</h3>
          {visibleBundles.length === 0 ? (
            <p>バンドルがありません（頒布物管理で追加できます）</p>
          ) : (
            <table border={1} cellPadding={4} style={{ borderCollapse: "collapse", marginBottom: 16 }}>
              <thead>
                <tr>
                  <th>バンドル名</th>
                  <th>中身</th>
                  <th>価格(円)</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {visibleBundles.map((b) => (
                  <tr key={b.id}>
                    <td>{b.name}</td>
                    <td>
                      {b.lines.map((l, i) => {
                        const item = getItemById(l.itemId);
                        return (
                          <div key={i}>
                            {item.name} × {l.quantity}
                          </div>
                        );
                      })}
                    </td>
                    <td>{b.price}</td>
                    <td>
                      <button onClick={() => onAddBundleToCart(b.id)}>カートに追加</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              
            </table>
          )}
      </div>

      <div style={{ flex: 1 }}>
        <h2>カート</h2>
        {cart.length === 0 ? (
          <p>カートは空です</p>
        ) : (
          <ul>
            {cart.map((c) => {
              const item = getItemById(c.itemId);
              return (
                <div
                  key={c.itemId}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span>
                    {item.name} × {c.quantity}
                  </span>

                  <button onClick={() => onAddToCart(c.itemId)}>＋</button>
                  <button onClick={() => onRemoveFromCart(c.itemId)}>−</button>
                </div>
              );
            })}
          </ul>
        )}
        {bundleCart.length > 0 && (
            <>
              <h4>バンドル</h4>
              {bundleCart.map((bc) => {
                const b = getBundleById(bc.bundleId);
                const subtotal = b.price * bc.quantity;

                return (
                  <div
                    key={bc.bundleId}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span>
                      {b.name} × {bc.quantity}（{subtotal}円）
                    </span>

                    <button onClick={() => onAddBundleToCart(bc.bundleId)}>＋</button>
                    <button onClick={() => onRemoveBundleFromCart(bc.bundleId)}>−</button>

                  </div>
                );
              })}
            </>
          )}
        <hr />
        <p>合計: {totalPrice} 円</p>
        <button onClick={onCheckout} disabled={cart.length === 0 && bundleCart.length===0}>
          会計確定
        </button>
        <button onClick={sendSale}>売上送信</button>
      </div>
    </div>
  );
}
