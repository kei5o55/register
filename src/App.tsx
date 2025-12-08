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

type Sale = {
  id: string;
  datetime: string;
  total: number;
};

type Screen = "home" | "register" | "history";

const initialItems: Item[] = [
  { id: "1", name: "新刊 A", price: 500, stock: 20 },
  { id: "2", name: "既刊 B", price: 700, stock: 15 },
  { id: "3", name: "グッズ C", price: 300, stock: 30 },
];

function App() {
  const [screen, setScreen] = useState<Screen>("home");

  const [items, setItems] = useState<Item[]>(initialItems);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const getItemById = (id: string) => items.find((i) => i.id === id)!;

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

  const totalPrice = cart.reduce((sum, c) => {
    const item = getItemById(c.itemId);
    return sum + item.price * c.quantity;
  }, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const total = totalPrice;
    const now = new Date();

    const sale: Sale = {
      id: crypto.randomUUID(),
      datetime: now.toLocaleString(),
      total,
    };
    setSales((prev) => [sale, ...prev]);

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
    alert(`会計完了！ 合計金額: ${total} 円`);
  };

  

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h1>レジアプリ（プロトタイプ）</h1>
        <nav style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setScreen("home")}>ホーム</button>
          <button onClick={() => setScreen("register")}>レジ</button>
          <button onClick={() => setScreen("history")}>売上履歴</button>
        </nav>
      </header>

      {screen === "home" && (
        <HomeScreen
          onGoRegister={() => setScreen("register")}
          onGoHistory={() => setScreen("history")}
        />
      )}

      {screen === "register" && (
        <RegisterScreen
          items={items}
          cart={cart}
          totalPrice={totalPrice}
          onAddToCart={handleAddToCart}
          onCheckout={handleCheckout}
          getItemById={getItemById}
        />
      )}

      {screen === "history" && <HistoryScreen sales={sales} />}
    </div>
  );
}

type HomeProps = {
  onGoRegister: () => void;
  onGoHistory: () => void;
};

function HomeScreen({ onGoRegister, onGoHistory }: HomeProps) {
  return (
    <div>
      <h2>ホーム</h2>
      <p>同人即売会用のWebレジアプリです。</p>
      <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
        <button onClick={onGoRegister}>レジ画面を開く</button>
        <button onClick={onGoHistory}>売上履歴を見る</button>
      </div>
    </div>
  );
}

type RegisterProps = {
  items: Item[];
  cart: CartItem[];
  totalPrice: number;
  onAddToCart: (itemId: string) => void;
  onCheckout: () => void;
  getItemById: (id: string) => Item;
};

function RegisterScreen({
  items,
  cart,
  totalPrice,
  onAddToCart,
  onCheckout,
  getItemById,
}: RegisterProps) {
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
        <h2>商品一覧</h2>
        <ul>
          {items.map((item) => (
            <li key={item.id} style={{ marginBottom: 8 }}>
              <div>
                {item.name} / {item.price}円 / 在庫: {item.stock}
              </div>
              <button
                onClick={() => onAddToCart(item.id)}
                disabled={item.stock <= 0}
              >
                カートに追加
              </button>
            </li>
          ))}
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

type HistoryProps = {
  sales: Sale[];
};

function HistoryScreen({ sales }: HistoryProps) {
  return (
    <div>
      <h2>売上履歴</h2>
      {sales.length === 0 ? (
        <p>まだ売上はありません</p>
      ) : (
        <ul>
          {sales.map((sale) => (
            <li key={sale.id}>
              {sale.datetime} - {sale.total} 円
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;

