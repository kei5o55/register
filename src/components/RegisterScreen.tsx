// src/components/RegisterScreen.tsx
import type{ Item, CartItem } from "../types";

type RegisterProps = {
  items: Item[];
  cart: CartItem[];
  totalPrice: number;
  onAddToCart: (itemId: string) => void;
  onCheckout: () => void;
  getItemById: (id: string) => Item;
  getRemainingStock: (id: string) => number;
};

export function RegisterScreen({
  items,
  cart,
  totalPrice,
  onAddToCart,
  onCheckout,
  getItemById,
  getRemainingStock,
}: RegisterProps) {
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
        <h2>商品一覧</h2>
        <ul>
          {items.map((item) => {
            const remaining = getRemainingStock(item.id);
            return (
              <li key={item.id} style={{ marginBottom: 8 }}>
                <div>
                  {item.name} / {item.price}円 / 在庫: {item.stock}
                  {"（残り: "}{remaining}{"）"}
                </div>
                <button
                  onClick={() => onAddToCart(item.id)}
                  disabled={remaining <= 0}
                >
                  カートに追加
                </button>
              </li>
            );
          })}
        </ul>
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
                <li key={c.itemId}>
                  {item.name} x {c.quantity} = {item.price * c.quantity}円
                </li>
              );
            })}
          </ul>
        )}
        <hr />
        <p>合計: {totalPrice} 円</p>
        <button onClick={onCheckout} disabled={cart.length === 0}>
          会計確定
        </button>
      </div>
    </div>
  );
}
