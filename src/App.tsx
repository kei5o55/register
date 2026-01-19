//src/App.tsx
import { useState, useEffect } from "react";
import type { Item, CartItem, Sale,Event,Bundle,BundleLine} from "./types";
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
  const [bundles, setBundles] = useState<Bundle[]>([]);

  const selectedEventForHistory = selectedEventIdForHistory ? events.find(e => e.id === selectedEventIdForHistory) ?? null : null;
  const selectedEventSalesForHistory = selectedEventForHistory ? sales.filter(s => s.eventId === selectedEventForHistory.id) : [];
  const selectedEvent =selectedEventId ? events.find(e => e.id === selectedEventId) ?? null : null;
  const selectedEventSalesForDetail = selectedEvent ? sales.filter(s => s.eventId === selectedEvent.id) : [];
  const currentEvent =currentEventId ? events.find(e => e.id === currentEventId) ?? null : null;

  const [bundleCart, setBundleCart] = useState<BundleCartItem[]>([]);
  type BundleCartItem = { bundleId: string; quantity: number };

  useEffect(() => {//商品データの保存(itemsが変化したときに実行)
    saveItems(items);
  }, [items]);

  useEffect(() => {//販売データの保存(salesが変化したときに実行)
    saveSales(sales);
  }, [sales]);

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

  const buildReservedMap = () => {
    const reserved = new Map<string, number>();

    // 単品カート分
    for (const c of cart) {
      reserved.set(c.itemId, (reserved.get(c.itemId) ?? 0) + c.quantity);
    }

    // バンドルカート分（中身を展開）
    for (const bc of bundleCart) {
      const bundle = bundles.find((b) => b.id === bc.bundleId);
      if (!bundle) continue;

      for (const line of bundle.lines) {
        const add = line.quantity * bc.quantity;
        reserved.set(line.itemId, (reserved.get(line.itemId) ?? 0) + add);
      }
    }

    return reserved;
  };

  const handleAddBundleToCart = (bundleId: string) => {
    const bundle = bundles.find((b) => b.id === bundleId);
    if (!bundle) return;

    // いまカートで確保済みの個数（単品＋バンドル）
    const reserved = buildReservedMap();

    // 「このバンドルをさらに1個」追加したときに必要な個数をチェック
    for (const line of bundle.lines) {
      const item = items.find((i) => i.id === line.itemId);
      if (!item) continue;

      const already = reserved.get(line.itemId) ?? 0;
      const needIfAddOne = already + line.quantity; // バンドル1個追加分

      if (needIfAddOne > item.stock) {
        alert(
          `在庫が足りません: ${item.name}\n` +
            `必要: ${needIfAddOne} / 在庫: ${item.stock}`
        );
        return;
      }
    }

    // ここまで来たら追加OK
    setBundleCart((prev) => {
      const existing = prev.find((b) => b.bundleId === bundleId);
      if (existing) {
        return prev.map((b) =>
          b.bundleId === bundleId ? { ...b, quantity: b.quantity + 1 } : b
        );
      }
      return [...prev, { bundleId, quantity: 1 }];
    });
  };

  const getBundleById = (id: string) => bundles.find((b) => b.id === id)!;

  const handleAddBundle = (name: string, lines: BundleLine[], price: number) => {
    const newBundle: Bundle = {
      id: crypto.randomUUID(),
      name,
      lines,
      price,
    };
    setBundles(prev => [...prev, newBundle]);
  };

  const handleRemoveBundleFromCart = (bundleId: string) => {
    setBundleCart((prev) => {
      const target = prev.find((b) => b.bundleId === bundleId);
      if (!target) return prev;

      if (target.quantity <= 1) {
        return prev.filter((b) => b.bundleId !== bundleId);
      }

      return prev.map((b) =>
        b.bundleId === bundleId ? { ...b, quantity: b.quantity - 1 } : b
      );
    });
  };

  const handleDeleteBundle = (id: string) => {
    setBundles(prev => prev.filter(b => b.id !== id));
  };

  const selectedSale = selectedSaleId
    ? sales.find((s) => s.id === selectedSaleId) ?? null
    : null;

  const getItemById = (id: string) => items.find((i) => i.id === id)!;

  const handleAddToCart = (itemId: string) => {
    const reserved = buildReservedMap();
    const item = getItemById(itemId);

    const already = reserved.get(itemId) ?? 0;
    const needIfAddOne = already + 1;

    if (needIfAddOne > item.stock) {
      alert(`在庫が足りません: ${item.name}`);
      return;
    }

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

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => {
      const target = prev.find((c) => c.itemId === itemId);
      if (!target) return prev;

      if (target.quantity <= 1) {
        // 数量1なら行ごと削除
        return prev.filter((c) => c.itemId !== itemId);
      }

      // それ以上なら quantity を -1
      return prev.map((c) =>
        c.itemId === itemId
          ? { ...c, quantity: c.quantity - 1 }
          : c
      );
    });
  };

  const totalPrice =
    cart.reduce((sum, c) => {
      const item = getItemById(c.itemId);
      return sum + item.price * c.quantity;
    }, 0)
    +
    bundleCart.reduce((sum, bc) => {
      const bundle = getBundleById(bc.bundleId);
      return sum + bundle.price * bc.quantity;
  }, 0);

const handleCheckout = () => {
  
      // 単品もバンドルも空なら何もしない
      if (cart.length === 0 && bundleCart.length === 0) return;

      if (!currentEventId) {
        alert("イベントを選択してください");
        return;
      }

      // --- ① 必要数を itemId ごとに集計（単品 + バンドル展開） ---
      const required = new Map<string, number>();

      // 単品
      for (const c of cart) {
        required.set(c.itemId, (required.get(c.itemId) ?? 0) + c.quantity);
      }

      // バンドル（中身を展開して必要数に加算）
      for (const bc of bundleCart) {
        const bundle = bundles.find((b) => b.id === bc.bundleId);
        if (!bundle) continue;

        for (const line of bundle.lines) {
          const add = line.quantity * bc.quantity;
          required.set(line.itemId, (required.get(line.itemId) ?? 0) + add);
        }
      }

      // --- ② 在庫チェック（バンドル込み） ---
      for (const [itemId, need] of required) {
        const item = items.find((i) => i.id === itemId);
        if (!item) continue; // 念のため

        if (item.stock < need) {
          alert(`在庫が足りません: ${item.name}\n必要: ${need} / 在庫: ${item.stock}`);
          return;
        }
      }
      // --- バンドル由来の内訳（itemIdごと）をスナップショット保存する ---
      const bundleExpandedMap = new Map<string, { name: string; quantity: number }>();

      for (const bc of bundleCart) {
        const bundle = bundles.find((b) => b.id === bc.bundleId);
        if (!bundle) continue;

        for (const line of bundle.lines) {
          const item = getItemById(line.itemId);

          // バンドル1個あたり line.quantity 個入ってる × バンドル購入数
          const add = line.quantity * bc.quantity;

          const cur = bundleExpandedMap.get(line.itemId);
          if (cur) {
            cur.quantity += add;
            // 名前は最新に寄せる（スナップショットとしては item.name でOK）
            cur.name = item.name;
          } else {
            bundleExpandedMap.set(line.itemId, { name: item.name, quantity: add });
          }
        }
      }

      const bundleExpandedItems =
        bundleExpandedMap.size > 0
          ? Array.from(bundleExpandedMap.entries()).map(([itemId, v]) => ({
              itemId,
              name: v.name,
              quantity: v.quantity,
            }))
          : undefined;


      // --- ③ 売上データを作る（単品は items に、バンドルは bundles に保存） ---
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

      const saleBundles = bundleCart.map((bc) => ({
        bundleId: bc.bundleId,
        quantity: bc.quantity,
      }));

      const total = totalPrice; // ←すでに単品+バンドルの合計になってる前提

      const sale: Sale = {
        id: crypto.randomUUID(),
        datetime: now.toLocaleString(),
        total,
        items: saleItems,
        bundles: saleBundles.length > 0 ? saleBundles : undefined,
        bundleExpandedItems, // ←追加
        eventId: currentEventId,
      };

      setSales((prev) => [sale, ...prev]);

      // --- ④ 在庫更新（required 分まとめて引く） ---
      const updatedItems = items.map((item) => {
        const need = required.get(item.id) ?? 0;
        if (need === 0) return item;
        return { ...item, stock: item.stock - need };
      });

      setItems(updatedItems);

      // --- ⑤ カートを空にする ---
      setCart([]);
      setBundleCart([]);

      alert(`合計金額: ${total} 円`);
      console.log("saved sale (full)", JSON.stringify(sale, null, 2));


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
          sales={sales}
          events={events}
          currentEvent={currentEvent}
          onGoRegister={() => setScreen("register")}
          onGoHistory={() => setScreen("history")}
          onGoEvents={() => setScreen("events")} // ← 未選択ならイベント選択へ飛ばす用
        />
      )}

      {screen === "register" && (
        <RegisterScreen
          items={items}
          bundles={bundles}
          cart={cart}
          bundleCart={bundleCart}
          totalPrice={totalPrice}
          onAddToCart={handleAddToCart}
          onAddBundleToCart={handleAddBundleToCart}
          onRemoveFromCart={handleRemoveFromCart}
          onRemoveBundleFromCart={handleRemoveBundleFromCart}
          onCheckout={handleCheckout} // ※ 会計は次ステップで bundle 対応する
          getItemById={getItemById}
          getBundleById={getBundleById}
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
          bundles={bundles}
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
          bundles={bundles}
          onAddBundle={handleAddBundle}
          onDeleteBundle={handleDeleteBundle}
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
