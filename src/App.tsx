//src/App.tsx
import { useState, useEffect } from "react";
import type { Item, CartItem, Sale,Event} from "./types";
import { loadItems, saveItems, loadSales, saveSales } from "./storage";
import"./App.css";

//コンポーネントのインポート
import { HomeScreen } from "./components/HomeScreen";
import { HistoryScreen } from "./components/HistoryScreen";
import { SaleDetailScreen } from "./components/SaleDetailScreen";
import { RegisterScreen } from "./components/RegisterScreen";
import { ItemsScreen } from "./components/ItemScreen";
import { EventListScreen } from "./components/EventListScreen";
import { EventHistoryScreen } from "./components/EventHistoryScreen";
import { EventDetailScreen } from "./components/EventDetailScreen";


type SaleItem = {//販売された商品の情報を表す型
  itemId: string;
  name: string;     // 当時の名前
  price: number;    // 当時の価格
  quantity: number; // 売れた数
};

type Screen = "home" | "register" | "history" | "saleDetail" | "items" | "events" | "eventHistory" | "eventDetail";//画面の種類を定義

const initialItems: Item[] = [//仮データ
  { id: "1", name: "新刊 A", price: 500, stock: 20 },
  { id: "2", name: "既刊 B", price: 700, stock: 15 },
  { id: "3", name: "グッズ C", price: 300, stock: 30 },
];

const initialEvents: Event[] = [{//仮データ
  id: "e1",
  name: "コミックマーケット○○",
  date: "20xx-2-2",
   memo: "同人即売イベント"
},];



function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [screenStack,setScreenStack] = useState<Screen[]>([]);
  const [items, setItems] = useState<Item[]>(() => loadItems(initialItems)); 
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>(() => loadSales());
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [selectedEventIdForHistory,setSelectedEventIdForHistory]= useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const selectedEventForHistory = selectedEventIdForHistory ? events.find(e => e.id === selectedEventIdForHistory) ?? null : null;
  const selectedEventSalesForHistory = selectedEventForHistory ? sales.filter(s => s.eventId === selectedEventForHistory.id) : [];
  const selectedEvent =selectedEventId ? events.find(e => e.id === selectedEventId) ?? null : null;
  const selectedEventSalesForDetail = selectedEvent ? sales.filter(s => s.eventId === selectedEvent.id) : [];
  const currentEvent =currentEventId ? events.find(e => e.id === currentEventId) ?? null : null;


  useEffect(() => {//商品データの保存(itemsが変化したときに実行)
    saveItems(items);
  }, [items]);

  useEffect(() => {//販売データの保存(salesが変化したときに実行)
    saveSales(sales);
  }, [sales]);

  /*useEffect(() =>{
    const Eventname=initialEvents[selectedEventId].name;
  },[selectedEventId]);*/

  const go = (next: Screen) => {
    setScreenStack((prev) => [...prev,screen]);
    setScreen(next);
  };

  const back = () => {
    setScreenStack((prev) => {
      if(prev.length === 0)return prev;
      const last = prev[prev.length -1];
      setScreen(last);
      return prev.slice(0, -1);
    });
  };

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

    if (!currentEventId){
      alert("イベントを選択してください");
      return;
    }

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
      eventId: currentEventId,//選択されたイベントID(紐づけ)
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

  const handleDeleteSale = (id: string) => {
    if (!confirm("この売上履歴を削除しますか？")) return;
    setSales((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddEvent=(name:string,date:string,memo?:string)=>{//いったん追加
    const newEvent:Event={
      id:crypto.randomUUID(),
      name,
      date,
      memo,
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  const handleDeleteEvent=(id:string)=>{
    setEvents((prev) => prev.filter((event) => event.id !== id));
    setSales((prev) => prev.filter((sale) => sale.eventId !== id));
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
          <button onClick={() => setScreen("events")}>イベント履歴</button>
        </nav>
      </header>

      {screen === "home" && (
        <HomeScreen
          currentEvent={currentEvent}
          onGoRegister={() => setScreen("register")}
          onGoHistory={() => setScreen("history")}
          onGoEvents={() => setScreen("events")} // ← 未選択ならイベント選択へ飛ばす用
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
            go("saleDetail");
            //setScreen("saleDetail");
          }}
        />
      )}

      {screen === "saleDetail" && selectedSale && (
        <SaleDetailScreen
          sale={selectedSale}
          onBack={back}
          onDelete={() => {
            handleDeleteSale(selectedSale.id);
            go("history");
            //setScreen("history");
          }}
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

      {screen === "events" && (
        <EventListScreen
          events={events}
          currentEventId={currentEventId}
          onSelectCurrentEvent={(id)=>{
            setCurrentEventId(id);
          }}
          onOpenEventHistory={(id) => {
            setSelectedEventIdForHistory(id);
            go("eventHistory");
            //setScreen("eventHistory");
          }}
         /*onOpenEventDetail={(id) => {
            setSelectedEventId(id);
            setScreen("eventDetail");
          }}*/
          onAddEvent={handleAddEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      )}

      {screen ==="eventHistory" &&
        selectedEventForHistory &&(
          <EventHistoryScreen
          event={selectedEventForHistory}
          sales={selectedEventSalesForHistory}
          onBack={back}
          onSelectSale={(id) =>{
            setSelectedSaleId(id);
            go("saleDetail");
            //setScreen("saleDetail");
          }}
          onOpenEventDetail={(id) => {
            setSelectedEventId(id);
            go("eventDetail");
            //setScreen("eventDetail");
          }}
          />
        )}

        {screen ==="eventDetail" && selectedEvent &&(
          <EventDetailScreen
          event={selectedEvent}
          sales={selectedEventSalesForDetail}
          onBack={back}
          />
        )}
    </div>
  );
}




export default App;
