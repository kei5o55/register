import { useState, useEffect } from "react";
import type { Item, CartItem, Sale } from "./types";
import { loadItems, saveItems, loadSales, saveSales } from "./storage";

import { HomeScreen } from "./components/HomeScreen";
import { HistoryScreen } from "./components/HistoryScreen";
import { SaleDetailScreen } from "./components/SaleDetailScreen";
import { RegisterScreen } from "./components/RegisterScreen";
import { ItemsScreen } from "./components/ItemScreen";

type SaleItem = {
  itemId: string;
  name: string;     // 当時の名前
  price: number;    // 当時の価格
  quantity: number; // 売れた数
};

type Screen = "home" | "register" | "history" | "saleDetail" | "items";

const initialItems: Item[] = [
  { id: "1", name: "新刊 A", price: 500, stock: 20 },
  { id: "2", name: "既刊 B", price: 700, stock: 15 },
  { id: "3", name: "グッズ C", price: 300, stock: 30 },
];



function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [items, setItems] = useState<Item[]>(() => loadItems(initialItems)); 
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>(() => loadSales());
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  useEffect(() => {
    saveSales(sales);
  }, [sales]);

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




export default App;
