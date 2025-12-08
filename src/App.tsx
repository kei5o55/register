import { useState } from "react";

type Item = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

type CartItem = {
  itemId: string;
  quantity: number;
};

const initialItems: Item[] = [
  { id: "1", name: "新刊 A", price: 500, stock: 20 },
  { id: "2", name: "既刊 B", price: 700, stock: 15 },
  { id: "3", name: "グッズ C", price: 300, stock: 30 },
];

function App() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleAddToCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === itemId);
      if (existing) {
        return prev.map((c) =>
          c.itemId === itemId ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { itemId, quantity: 1 }];
    });
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // 合計金額計算
    const total = cart.reduce((sum, c) => {
      const item = items.find((i) => i.id === c.itemId);
      if (!item) return sum;
      return sum + item.price * c.quantity;
    }, 0);

    alert(`会計完了！ 合計金額: ${total} 円`);

    // 在庫を減らす
    const updatedItems = items.map((item) => {
      const cartItem = cart.find((c) => c.itemId === item.id);
      if (!cartItem) return item;
      return {
        ...item,
        stock: item.stock - cartItem.quantity,
      };
    });

    setItems(updatedItems);
    setCart([]);
  };

  const getItemById = (id: string) => items.find((i) => i.id === id)!;

  const totalPrice = cart.reduce((sum, c) => {
    const item = getItemById(c.itemId);
    return sum + item.price * c.quantity;
  }, 0);

  return (
    <div style={{ padding: "16px", maxWidth: 800, margin: "0 auto" }}>
      <h1>同人レジ・プロトタイプ</h1>

      <div style={{ display: "flex", gap: "24px" }}>
        {/* 商品リスト */}
        <div style={{ flex: 1 }}>
          <h2>商品一覧</h2>
          <ul>
            {items.map((item) => (
              <li key={item.id} style={{ marginBottom: "8px" }}>
                <div>
                  {item.name} / {item.price}円 / 在庫: {item.stock}
                </div>
                <button
                  onClick={() => handleAddToCart(item.id)}
                  disabled={item.stock <= 0}
                >
                  カートに追加
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* カート */}
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
                    {item.name} x {c.quantity} ={" "}
                    {item.price * c.quantity}円
                  </li>
                );
              })}
            </ul>
          )}
          <hr />
          <p>合計: {totalPrice} 円</p>
          <button onClick={handleCheckout} disabled={cart.length === 0}>
            会計確定
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
