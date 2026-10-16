// src/components/ItemScreen.tsx
// 頒布物管理画面コンポーネント
// 頒布物（Item）とバンドル（Bundle）を一覧表示・編集・追加・削除する

import { useState,useEffect } from "react";
import type { Item,Bundle,BundleLine } from "../logic/types";
import { TagEditor } from "./TagEditor";
//import { publicItemImages } from "../logic/publicImages";(今回はローカル保存に切り替えるのでpublic画像は廃止)
import { saveItemImage,deleteItemImage,loadItemImageBlob } from "../logic/storage";


type ItemsScreenProps = {
  items: Item[];

  // 画面で一覧表示するため：Bundle の配列
  bundles: Bundle[];

  // 追加：name + lines + price（idはApp側で作る）
  onAddBundle: (name: string, lines: BundleLine[], price: number) => void;

  // 削除（表示するならほぼ要る）
  onDeleteBundle: (bundleId: string) => void;

  onChangeName: (id: string, name: string) => void;
  onChangePrice: (id: string, price: number) => void;
  onChangeStock: (id: string, stock: number) => void;
  onAddItem: (name: string, price: number, stock: number) => void;
  onDeleteItem: (id: string) => void;
  onChangeTags: (id: string, tags: string[]) => void;
  onChangeBundleTags: (id: string, tags: string[]) => void;
  onChangeImageUrl: (id: string, url: string) => void;
};

export function ItemsScreen({
  items,
  bundles,
  onAddBundle,
  onDeleteBundle,
  onChangeName,
  onChangePrice,
  onChangeStock,
  onAddItem,
  onDeleteItem,
  onChangeTags,
  onChangeBundleTags,
}: ItemsScreenProps) {
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("500");
  const [newStock, setNewStock] = useState("10");
  const [bundleName, setBundleName] = useState("");
  const [bundleLines, setBundleLines] = useState<BundleLine[]>([]);
  const [bundlePrice, setBundlePrice] = useState(0);
  const [localImageUrls, setLocalImageUrls] = useState<Record<string, string>>({});
  

  
  // カタログ同期APIを呼び出す関数(追加した頒布物やバンドルを外部システムに反映させるためのもの,pwaで完結予定なのでいったんは未実装)
  /*const syncCatalog = async () => {
    const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/catalog/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, bundles }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(json?.error ?? "sync failed");
    alert("サーバに保存しました");
  };*/

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

  const calcBundleTotal = (lines: BundleLine[]) => {
    return lines.reduce((sum, line) => {
      const item = items.find(i => i.id === line.itemId);
      if (!item) return sum;
      return sum + item.price * line.quantity;
    }, 0);
  };

  const bundleTotal = calcBundleTotal(bundleLines);

  // 名前・価格の編集では画像を読み直さないよう、IDの増減だけを依存にする
  const itemIdsKey = items.map((it) => it.id).join(",");

  useEffect(() => {
    let alive = true;
    const created: string[] = [];

    (async () => {
      const entries: [string, string][] = [];

      for (const id of itemIdsKey.split(",").filter(Boolean)) {
        const blob = await loadItemImageBlob(id);
        if (blob) {
          const url = URL.createObjectURL(blob);
          created.push(url);
          entries.push([id, url]);
        }
      }

      if (alive) {
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
    };
  }, [itemIdsKey]);


  return (
    <div>
      <h2>頒布物管理</h2>

      <h3>既存頒布物</h3>
      {items.length === 0 ? (
        <p>頒布物が登録されていません</p>
      ) : (
        <table className="mb-4 border-collapse">
          <thead>
            <tr>
              <th>画像</th>
              <th>頒布物</th>
              <th>価格(円)</th>
              <th>在庫</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
              {/* ★追加：サムネ */}
              <td>
                <div className="flex items-center gap-2">
                  {(() => {
                    const localUrl = localImageUrls[item.id]; // ★追加：端末内画像
                    const src = localUrl ?? item.imageUrl;    // ★ローカル優先→なければ既存URL

                    return src ? (
                      <img
                        key={src} // ★超重要：srcが変わったらimgを作り直す
                        src={src}
                        alt={`${item.name} thumbnail`}
                        className="size-14 rounded-lg border border-[#ddd] object-cover"
                        onLoad={(e) => {
                          // ★ onErrorで消された場合に復活させる
                          (e.currentTarget as HTMLImageElement).style.display = "";
                        }}
                        onError={(e) => {
                          // ★ display:none はやめるか、最小限に
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="grid size-14 place-items-center rounded-lg border border-dashed border-[#bbb] text-xs opacity-70">
                        No Image
                      </div>
                    );
                  })()}

                  {/* ★ 既存: public画像URLを選ぶ（remote） */}
                  {/*<select
                    value={item.imageUrl ?? ""}
                    onChange={(e) => onChangeImageUrl(item.id, e.target.value)}
                    style={{ width: 240 }}
                    title="オンライン画像URL（remote）"
                  >
                    <option value="">（画像なし）</option>
                    {publicItemImages.map((path) => (
                      <option key={path} value={path}>
                        {path}
                      </option>
                    ))}
                  </select>*/}

                  {/* ★ 新規: 端末から画像を選んで保存（local） */}
                  {!localImageUrls[item.id] && (
                  <label
                    className="cursor-pointer rounded-lg border border-[#ddd] px-2.5 py-1.5 text-xs whitespace-nowrap select-none"
                    title="端末から画像を選択（オフラインでも表示）"
                  >
                    端末から…
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // 即プレビュー
                        const previewUrl = URL.createObjectURL(file);

                        setLocalImageUrls((prev) => {
                          const old = prev[item.id];
                          if (old) URL.revokeObjectURL(old);
                          return { ...prev, [item.id]: previewUrl };
                        });

                        await saveItemImage(item.id, file);

                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                  )}

                  {/* ★ 新規: 端末内画像を消す */}
                  {localImageUrls[item.id] && (
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteItemImage(item.id);
                        setLocalImageUrls((prev) => {
                          const old = prev[item.id];
                          if (old) URL.revokeObjectURL(old);
                          const rest = { ...prev };
                          delete rest[item.id];
                          return rest;
                        });
                      }}
                      className="cursor-pointer rounded-lg border border-[#ddd] bg-white px-2.5 py-1.5 text-xs whitespace-nowrap"
                      title="端末内に保存した画像を削除"
                    >
                      削除
                    </button>
                  )}
                </div>
              </td>
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
                    className="no-spinner w-20"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.stock}
                    onChange={(e) =>
                      onChangeStock(item.id, Number(e.target.value) || 0)
                    }
                    className="w-20"
                  />
                </td>
                <td>
                  <button onClick={() => onDeleteItem(item.id)} className="ml-2 text-[red]">削除</button>
                </td>
                <td>
                  <TagEditor
                    tags={item.tags}
                    onChange={(next) => onChangeTags(item.id, next)}
                    placeholder="タグを追加（例：新刊）"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>新規頒布物を追加</h3>
      <div className="flex items-center gap-2">
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
          className="no-spinner w-20"
        />
        <input
          type="number"
          placeholder="在庫"
          value={newStock}
          onChange={(e) => setNewStock(e.target.value)}
          className="no-spinner w-20"
        />
        <button onClick={handleSubmitNew}>追加</button>
      </div>
      <hr className="my-6" />

      <h3>バンドル管理</h3>

      {/* 既存バンドル一覧 */}
      {bundles.length === 0 ? (
        <p>バンドルはまだありません</p>
      ) : (
        <table className="mb-4 border-collapse">
          <thead>
            <tr>
              <th>バンドル名</th>
              <th>中身</th>
              <th>価格(円)</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {bundles.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>
                  {b.lines.map((l, i) => {
                    const item = items.find(it => it.id === l.itemId);
                    return (
                      <div key={i}>
                        {item?.name ?? "不明"} × {l.quantity}
                      </div>
                    );
                  })}
                </td>
                <td>{b.price}</td>
                <td>
                  <button onClick={() => onDeleteBundle(b.id)} className="ml-2 text-[red]">削除</button>
                </td>
                <td>
                  <TagEditor
                    tags={b.tags}
                    onChange={(next) => onChangeBundleTags(b.id, next)}
                    placeholder="タグを追加（例：新刊）"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* 新規バンドル追加 */}
      <h4>新規バンドルを追加</h4>
      <input
        placeholder="バンドル名"
        value={bundleName}
        onChange={(e) => setBundleName(e.target.value)}
        className="mb-2"
      />
      {/* 中身 */}
      {bundleLines.map((line, idx) => (
        <div key={idx} className="mb-1 flex gap-2">
          <select
            value={line.itemId}
            onChange={(e) => {
              const next = [...bundleLines];
              next[idx] = { ...next[idx], itemId: e.target.value };
              setBundleLines(next);
            }}
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            value={line.quantity}
            onChange={(e) => {
              const q = Number(e.target.value) || 1;
              const next = [...bundleLines];
              next[idx] = { ...next[idx], quantity: q };
              setBundleLines(next);
            }}
            className="w-[60px]"
          />

          <button
            onClick={() =>
              setBundleLines((prev) => prev.filter((_, i) => i !== idx))
            }
          >
            ×
          </button>
        </div>
      ))}

      <button
        onClick={() => {
          if (items.length === 0) return;
          const first = items[0];
          const next = [...bundleLines, { itemId: first.id, quantity: 1 }];
          setBundleLines(next);
          if (bundleLines.length === 0) {
            setBundlePrice(calcBundleTotal(next));
          }
        }}
      >
        中身を追加
      </button>

      <div className="mt-2">
        合計（参考）: {bundleTotal} 円
      </div>

      <div className="mt-2 flex gap-2">
        <input
          type="number"
          value={bundlePrice}
          onChange={(e) => setBundlePrice(Number(e.target.value) || 0)}
          placeholder="価格"
          className="no-spinner w-[100px]"
        />

        <button onClick={() => setBundlePrice(bundleTotal)}>
          合計を反映
        </button>
      </div>

      <button
        className="mt-2"
        onClick={() => {
          if (!bundleName.trim()) return;
          if (bundleLines.length === 0) return;
          if (bundlePrice <= 0) return;

          onAddBundle(bundleName.trim(), bundleLines, bundlePrice);

          setBundleName("");
          setBundleLines([]);
          setBundlePrice(0);
        }}
      >
        バンドル追加
      </button>
    </div>
    
  );
}