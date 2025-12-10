import { useState } from "react";
import { HomeScreen } from "./components/HomeScreen";
import { HistoryScreen } from "./components/HistoryScreen";
import { SaleDetailScreen } from "./components/SaleDetailScreen";
import { RegisterScreen } from "./components/RegisterScreen";

type SaleItem = {
  itemId: string;
  name: string;     // 当時の名前
  price: number;    // 当時の価格
  quantity: number; // 売れた数
};

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
  items: SaleItem[]; // ← ここに内訳を持たせる
};

type Screen = "home" | "register" | "history" | "saleDetail" | "items";

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
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  const selectedSale = selectedSaleId
    ? sales.find((s) => s.id === selectedSaleId) ?? null
    : null;

  const getItemById = (id: string) => items.find((i) => i.id === id)!;

  const handleAddToCart = (itemId: string) => {
    setCart((prev) => {
      const item = getItemById(itemId);

      const currentInCart = prev.find((c) => c.itemId === itemId)?.quantity ?? 0;
      
      const remainingStock = item.stock -currentInCart;
      if (remainingStock <= 0) {
        alert("在庫が足りません");
        return prev;
      }

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

    const saleItems: SaleItem[] = cart.map((c) => {
      const item = getItemById(c.itemId);
      return {
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: c.quantity,
      };
    });

    const sale: Sale = {
      id: crypto.randomUUID(),
      datetime: now.toLocaleString(),
      total,
      items: saleItems,
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
    alert(`合計金額: ${total} 円`);
  };

  const handleChangeItemName = (id: string, name: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item))
    );
  };

  const handleChangeItemPrice = (id: string, price: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price } : item))
    );
  };

  const handleChangeItemStock = (id: string, stock: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock } : item))
    );
  };

  const handleAddItem = (name: string, price: number, stock: number) => {
    if (!name.trim()) return;
    const newItem: Item = {
      id: crypto.randomUUID(),
      name,
      price,
      stock,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    // カート内の商品も削除
    setCart((prev) => prev.filter((c) => c.itemId !== id));
  };

  //いったん追加
  const getRemainingStock = (itemId: string) => {
    const item = getItemById(itemId);
    const cartItem = cart.find((c) => c.itemId === itemId);
    const used = cartItem ? cartItem.quantity : 0;
    return item.stock - used;
  };


  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <h1>レジアプリ（プロトタイプ）</h1>
        <nav style={{ display: "flex", gap: 8 ,flexWrap: "nowrap"}}>
          <button onClick={() => setScreen("home")}>ホーム</button>
          <button onClick={() => setScreen("register")}>レジ</button>
          <button onClick={() => setScreen("history")}>売上履歴</button>
          <button onClick={() => setScreen("items")}>頒布物管理</button>
        </nav>
      </header>

      {screen === "home" && (//ホーム画面を表示
        <HomeScreen//ホーム画面コンポーネントを呼び出し
          onGoRegister={() => setScreen("register")}//レジ画面へ遷移する関数を渡す
          onGoHistory={() => setScreen("history")}//売上履歴画面へ遷移する関数を渡す
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
          getRemainingStock={getRemainingStock}
        />
      )}

      {screen === "history" && (
        <HistoryScreen
          sales={sales}
          onSelectSale={(id) => {
            setSelectedSaleId(id);
            setScreen("saleDetail");
          }}
        />
      )}

      {screen === "saleDetail" && selectedSale && (
        <SaleDetailScreen
          sale={selectedSale}
          onBack={() => setScreen("history")}
        />
      )}

      {screen === "items" && (
        <ItemsScreen
          items={items}
          onChangeName={handleChangeItemName}
          onChangePrice={handleChangeItemPrice}
          onChangeStock={handleChangeItemStock}
          onAddItem={handleAddItem}
          onDeleteItem={handleDeleteItem}
        />
      )}
    </div>
  );
}

/*type RegisterProps = {
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
        <h2>頒布物一覧</h2>
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
}*/


type ItemsScreenProps = {
  items: Item[];
  onChangeName: (id: string, name: string) => void;
  onChangePrice: (id: string, price: number) => void;
  onChangeStock: (id: string, stock: number) => void;
  onAddItem: (name: string, price: number, stock: number) => void;
  onDeleteItem: (id: string) => void;
};

function ItemsScreen({
  items,
  onChangeName,
  onChangePrice,
  onChangeStock,
  onAddItem,
  onDeleteItem,
}: ItemsScreenProps) {
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("500");
  const [newStock, setNewStock] = useState("10");

  const handleSubmitNew = () => {
    const price = Number(newPrice);
    const stock = Number(newStock);
    if (!newName.trim() || Number.isNaN(price) || Number.isNaN(stock)) {
      alert("商品名・価格・在庫数を正しく入力してください");
      return;
    }
    onAddItem(newName, price, stock);
    setNewName("");
    setNewPrice("500");
    setNewStock("10");
  };

  return (
    <div>
      <h2>頒布物管理</h2>

      <h3>既存頒布物</h3>
      {items.length === 0 ? (
        <p>頒布物が登録されていません</p>
      ) : (
        <table
          border={1}
          cellPadding={4}
          style={{ borderCollapse: "collapse", marginBottom: 16 }}
        >
          <thead>
            <tr>
              <th>頒布物</th>
              <th>価格(円)</th>
              <th>在庫</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    value={item.name}
                    onChange={(e) => onChangeName(item.id, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      onChangePrice(item.id, Number(e.target.value) || 0)
                    }
                    style={{ width: 80 }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.stock}
                    onChange={(e) =>
                      onChangeStock(item.id, Number(e.target.value) || 0)
                    }
                    style={{ width: 80 }}
                  />
                </td>
                <td>
                  <button onClick={() => onDeleteItem(item.id)}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>新規頒布物を追加</h3>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          placeholder="頒布物名"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          type="number"
          placeholder="価格"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          style={{ width: 80 }}
        />
        <input
          type="number"
          placeholder="在庫"
          value={newStock}
          onChange={(e) => setNewStock(e.target.value)}
          style={{ width: 80 }}
        />
        <button onClick={handleSubmitNew}>追加</button>
      </div>
    </div>
  );
}

export default App;
