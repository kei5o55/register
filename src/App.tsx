//src/App.tsx
import { useState, useEffect,useRef } from "react";
import type { Item, CartItem, Sale,Event,Bundle,BundleLine} from "./logic/types";
import {
  loadItems,
  saveItems,
  loadSales,
  saveSales,
  loadEvents,
  saveEvents,
  loadBundles,
  saveBundles,
  loadAppState,
  saveAppState,
  type PersistedAppState,
} from "./logic/storage";
import"./App.css";
//import { DailySalesChart } from "./components/DailySalesChart";//日別売上チャートコンポーネント(APIからデータを取ってきて棒グラフ表示)

//コンポーネントのインポート
import { HomeScreen } from "./components/HomeScreen";
import { HistoryScreen } from "./components/HistoryScreen";
import { SaleDetailScreen } from "./components/SaleDetailScreen";
import { RegisterScreen } from "./components/RegisterScreen";
import { ItemsScreen } from "./components/ItemScreen";
import { EventListScreen } from "./components/EventListScreen";
import { EventHistoryScreen } from "./components/EventHistoryScreen";
import { EventDetailScreen } from "./components/EventDetailScreen";
import { EventSettingScreen } from "./components/EventSettingScreen";


type SaleItem = {//販売された商品の情報を表す型
  itemId: string;   // 商品のID（一意）
  name: string;     // 当時の名前
  price: number;    // 当時の価格
  quantity: number; // 売れた数
};

type Screen = "home" | "register" | "history" | "saleDetail" | "items" | "events" | "eventHistory" | "eventDetail" | "eventSetting";//画面の種類を定義

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
  const [,setScreenStack] = useState<Screen[]>([]);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [selectedEventIdForHistory,setSelectedEventIdForHistory]= useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEventIdForSetting, setSelectedEventIdForSetting] =useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  
  const selectedEventForSetting =events.find((e) => e.id === selectedEventIdForSetting) ?? null;
  
  // イベントID → 有効な itemId 配列
  const [eventItemMap, setEventItemMap] = useState<Record<string, string[]>>({});
  // イベントID → 有効な bundleId 配列
  const [eventBundleMap, setEventBundleMap] = useState<Record<string, string[]>>({});
  const handleChangeEventItems = (eventId: string, itemIds: string[]) => {
    setEventItemMap((prev) => ({ ...prev, [eventId]: itemIds }));
  };
  const handleChangeEventBundles = (eventId: string, bundleIds: string[]) => {
    setEventBundleMap((prev) => ({ ...prev, [eventId]: bundleIds }));
  };

  const selectedEventForHistory = selectedEventIdForHistory ? events.find(e => e.id === selectedEventIdForHistory) ?? null : null;
  const selectedEventSalesForHistory = selectedEventForHistory ? sales.filter(s => s.eventId === selectedEventForHistory.id) : [];
  const selectedEvent =selectedEventId ? events.find(e => e.id === selectedEventId) ?? null : null;
  const selectedEventSalesForDetail = selectedEvent ? sales.filter(s => s.eventId === selectedEvent.id) : [];
  const currentEvent =currentEventId ? events.find(e => e.id === currentEventId) ?? null : null;

  const [bundleCart, setBundleCart] = useState<BundleCartItem[]>([]);
  type BundleCartItem = { bundleId: string; quantity: number };

  const hydrated = useRef(false);// データの水和が完了したかどうかを追跡するフラグ（初回ロード時の副作用を制御するため）
                                 //useeffectを使用すると無限ループになるのを防ぐため、最初のロード時は保存処理をスキップするためのもの。データの水和が完了した後は、以降の変更で保存処理が走るようになる。
  useEffect(() => {
    (async () => {
      const [i, s, e, b, appState] = await Promise.all([
        loadItems(initialItems),
        loadSales(),
        loadEvents(initialEvents),
        loadBundles([]),
        loadAppState(),
      ]);

      setItems(i);
      setSales(s);
      setEvents(e);
      setBundles(b);

      setCurrentEventId(appState.currentEventId);
      setEventItemMap(appState.eventItemMap);
      setEventBundleMap(appState.eventBundleMap);
      setCart(appState.cart);
      setBundleCart(appState.bundleCart);

      if (
        appState.screen === "home" ||
        appState.screen === "register" ||
        appState.screen === "history" ||
        appState.screen === "saleDetail" ||
        appState.screen === "items" ||
        appState.screen === "events" ||
        appState.screen === "eventHistory" ||
        appState.screen === "eventDetail" ||
        appState.screen === "eventSetting"
      ) {
        setScreen(appState.screen);
      }

      hydrated.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveItems(items);
  }, [items]);

  useEffect(() => {
    if (!hydrated.current) return;
    saveSales(sales);
  }, [sales]);
  useEffect(() => {
    if (!hydrated.current) return;
    saveEvents(events);
  }, [events]);

  useEffect(() => {
    if (!hydrated.current) return;
    saveBundles(bundles);
  }, [bundles]);

  useEffect(() => {
    if (!hydrated.current) return;

    const appState: PersistedAppState = {
      currentEventId,
      eventItemMap,
      eventBundleMap,
      cart,
      bundleCart,
      screen,
    };

    saveAppState(appState);
  }, [currentEventId, eventItemMap, eventBundleMap, cart, bundleCart, screen]);

  useEffect(() => {
    // イベントが存在し、かつ現在何も選択されていない場合
    if (events.length > 0 && !currentEventId) {
      // 一番上のイベントIDを選択状態にする
      setCurrentEventId(events[0].id);
    }
  }, [events, currentEventId]);

  //バンドル・アイテムのIdを取得する関数
  const getBundleById = (id: string) => bundles.find((b) => b.id === id)!;
  const getItemById = (id: string) => items.find((i) => i.id === id)!;

  /*--- 画面遷移と履歴管理のロジック ---*/
  const go = (next: Screen) => {// 画面遷移関数（遷移前の画面をスタックに保存）
    setScreenStack((prev) => [...prev,screen]);
    setScreen(next);
  };
  const back = () => {// 画面戻る関数（スタックから前の画面を取り出して遷移）
    setScreenStack((prev) => {
      if(prev.length === 0)return prev;
      const last = prev[prev.length -1];
      setScreen(last);
      return prev.slice(0, -1);
    });
  };
  /*------------------------*/
  
  const onChangeImageUrl = (id: string, url: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, imageUrl: url } : it)));
  };


  const buildReservedMap = () => {//カート内の確保済み個数(バンドル＋単品)を itemId ごとに集計する関数
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

  const handleAddBundleToCart = (bundleId: string) => {//バンドルをカート保存
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

  

  const handleAddBundle = (name: string, lines: BundleLine[], price: number) => {
    const newBundle: Bundle = {
      id: crypto.randomUUID(),
      name,
      lines,
      price,
    };
    setBundles(prev => [...prev, newBundle]);
  };
  
  const handleUpdateEventBasics = (
    eventId: string,
    patch: { name?: string; date?: string; memo?: string }
  ) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, ...patch } : e
      )
    );
  };
const enabledItemIds = currentEventId ? (eventItemMap[currentEventId] ?? []) : undefined;
const enabledBundleIds = currentEventId ? (eventBundleMap[currentEventId] ?? []) : undefined;


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
      //const now = new Date();

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
        name: getBundleById(bc.bundleId).name,
        quantity: bc.quantity,
      }));

      const total = totalPrice; // ←すでに単品+バンドルの合計になってる前提

      const sale: Sale = {
        id: crypto.randomUUID(),
        datetime: new Date().toISOString(),
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

    //テスト用販売データ送信関数
    /*const sendSale = async () => {
      const payload = {
        sale_id: crypto.randomUUID(),// 一意な販売IDを生成(API送信時に同じIDで重複送信を防止)
        event_id: currentEventId!, // 現在のイベントIDをセット（null でない前提）
        device_id: "dev-001", // 後で localStorage で固定化すると良い
        sold_at: new Date().toISOString(),// 現在日時をISO文字列で取得
        total_amount: totalPrice,// 合計金額(カートに入った商品の合計)
        items: cart.map((c) => {
          const item = getItemById(c.itemId);
          return {
            item_id: item.id,
            name: item.name,
            price: item.price,
            qty: c.quantity,
          };
        }),
        bundles: bundleCart.map((bc) => {
          const b = getBundleById(bc.bundleId);
          return {
            bundle_id: b.id,
            name: b.name,
            price: b.price,
            qty: bc.quantity,
            lines: b.lines, // 中身も送りたければ
          };
        }),
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
    
    sendSale();*/

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
  const handleChangeItemTags = (id: string, tags: string[]) => {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, tags } : it)));
  };
  const handleChangeBundleTags = (id: string, tags: string[]) => {
    setBundles(prev => prev.map(b => (b.id === id ? { ...b, tags } : b)));
  };
  const handleChangeEventTags = (id: string, tags: string[]) => {
    setEvents(prev => prev.map(ev => (ev.id === id ? { ...ev, tags } : ev)));
  };

  const handleAddItem = (name: string, price: number, stock: number) => {
    if (!name.trim()) return;
    const newItem: Item = {
      id: crypto.randomUUID(),// 一意なIDを生成
      name,// name: name の略
      price, // price: price の略
      stock,// stock: stock の略
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
    setSales((prev) => prev.filter((s) => s.id !== id));// 売上履歴から削除(idが一致しないものだけ残す)
  };

  const handleAddEvent=(name:string,date:string,memo?:string)=>{//いったん追加
    const newEvent:Event={
      id:crypto.randomUUID(),
      name,
      date,
      memo,
    };
    setEvents((prev) => [...prev, newEvent]);//イベントリストに新しいイベントを追加(...prevで既存のイベントを展開してから末尾newEventを追加
  };

  const handleDeleteEvent = (id: string) => {
    // イベント本体削除
    setEvents((prev) => prev.filter((e) => e.id !== id));

    // eventItemMap からも削除
    setEventItemMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    // eventBundleMap からも削除
    setEventBundleMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    // もし削除したイベントが現在選択中なら解除＋カート初期化
    if (id === currentEventId) {
      setCurrentEventId(null);
      setCart([]);
      setBundleCart([]);
    }
  };

  const getRemainingStock = (itemId: string) => {//在庫からカート分を引いた残り数を取得
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
        <h1>レジ（プロトタイプ）</h1>
        <nav style={{ display: "flex", gap: 8 ,flexWrap: "nowrap"}}>
          <button onClick={() => setScreen("home")}>ホーム</button>
          <button onClick={() => setScreen("register")}>レジ</button>
          <button onClick={() => setScreen("events")}>イベント管理</button>
          <button onClick={() => setScreen("items")}>頒布物管理</button>
          <button onClick={() => setScreen("history")}>売上履歴</button>
        </nav>
        <label style={{ marginLeft: "auto" }}>
          選択中の頒布物id:{enabledItemIds}
        </label>
      </header>

      {screen === "home" && (
        <HomeScreen
          sales={sales}
          events={events}
          currentEvent={currentEvent}
          onGoRegister={() => setScreen("register")}
          onGoHistory={() => setScreen("history")}
          onGoEvents={() => setScreen("events")} //未選択ならイベント選択へ飛ばす用
        />
      )}

      {screen === "register" && (
        <RegisterScreen
          items={items}
          bundles={bundles}
          enabledItemIds={enabledItemIds}
          enabledBundleIds={enabledBundleIds}
          cart={cart}
          bundleCart={bundleCart}
          totalPrice={totalPrice}
          onAddToCart={handleAddToCart}
          onAddBundleToCart={handleAddBundleToCart}
          onRemoveFromCart={handleRemoveFromCart}
          onRemoveBundleFromCart={handleRemoveBundleFromCart}
          onCheckout={handleCheckout}
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
          events={events}
          onBack={back}
          onDelete={() => {
            handleDeleteSale(selectedSale.id);
            go("history");
            //setScreen("history");
          }}        />
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
          onChangeTags={handleChangeItemTags}
          onChangeBundleTags={handleChangeBundleTags}
          onChangeImageUrl={onChangeImageUrl}
        />
      )}

      {screen === "events" && (
        <EventListScreen
          events={events}
          currentEventId={currentEventId}
          onSelectCurrentEvent={(id) => {
            if (id === currentEventId) return;

            setCurrentEventId(id);
            setCart([]);
            setBundleCart([]);
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
          onChangeEventTags={handleChangeEventTags}
          onOpenEventSetting={(id) => {
            setSelectedEventIdForSetting(id);
            go("eventSetting");
          }}
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
          }}
          onOpenEventDetail={(id) => {
            setSelectedEventId(id);
            go("eventDetail");;
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

        {screen === "eventSetting" &&
          selectedEventForSetting && (
            <EventSettingScreen
              event={selectedEventForSetting}
              items={items}
              bundles={bundles}
              selectedItemIds={eventItemMap[selectedEventForSetting.id] ?? []}
              selectedBundleIds={eventBundleMap[selectedEventForSetting.id] ?? []}
              onUpdateEventBasics={handleUpdateEventBasics}
              onChangeEventTags={handleChangeEventTags}
              onChangeEventItems={handleChangeEventItems}
              onChangeEventBundles={handleChangeEventBundles}
              onBack={back}
            />
          )}

      <div style={{ padding: 16 }}>{/* どこからでも見れるように日別売上チャートを置いてみる(デバッグ用) */}
        {/* <DailySalesChart /> 一旦バックエンドは未実装 */}
      </div>

    </div>
    
  );
}
export default App;