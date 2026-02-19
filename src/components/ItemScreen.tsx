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
  //onChangeImageUrl,(今回はローカル保存に切り替えるのでURL変更は廃止)
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

  useEffect(() => {
    (async () => {
      const entries: [string, string][] = [];

      for (const it of items) {
        const blob = await loadItemImageBlob(it.id);
        if (blob) {
          entries.push([it.id, URL.createObjectURL(blob)]);
        }
      }

      setLocalImageUrls(Object.fromEntries(entries));
    })();
  }, []); // ← items依存やめる


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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {(() => {
                    const localUrl = localImageUrls[item.id]; // ★追加：端末内画像
                    const src = localUrl ?? item.imageUrl;    // ★ローカル優先→なければ既存URL

                    return src ? (
                      <img
                        key={src} // ★超重要：srcが変わったらimgを作り直す
                        src={src}
                        alt={`${item.name} thumbnail`}
                        style={{
                          width: 56,
                          height: 56,
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "1px solid #ddd",
                        }}
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
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 8,
                          border: "1px dashed #bbb",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 12,
                          opacity: 0.7,
                        }}
                      >
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
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      padding: "6px 10px",
                      cursor: "pointer",
                      userSelect: "none",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                    title="端末から画像を選択（オフラインでも表示）"
                  >
                    端末から…
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
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
                          const { [item.id]: _, ...rest } = prev;
                          return rest;
                        });
                      }}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        padding: "6px 10px",
                        cursor: "pointer",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                        background: "white",
                      }}
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
                    style={{ width: 80 }}
                    className="no-spinner"
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
                  <button onClick={() => onDeleteItem(item.id)} style={{ color: "red", marginLeft: 8 }}>削除</button>
                </td>
                <TagEditor
                  tags={item.tags}
                  onChange={(next) => onChangeTags(item.id, next)}
                  placeholder="タグを追加（例：新刊）"
                />
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
          className="no-spinner"
        />
        <input
          type="number"
          placeholder="在庫"
          value={newStock}
          onChange={(e) => setNewStock(e.target.value)}
          style={{ width: 80 }}
          className="no-spinner"
        />
        <button onClick={handleSubmitNew}>追加</button>
      </div>
      <hr style={{ margin: "24px 0" }} />

      <h3>バンドル管理</h3>

      {/* 既存バンドル一覧 */}
      {bundles.length === 0 ? (
        <p>バンドルはまだありません</p>
      ) : (
        <table
          border={1}
          cellPadding={4}
          style={{ borderCollapse: "collapse", marginBottom: 16 }}
        >
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
                  <button onClick={() => onDeleteBundle(b.id)} style={{ color: "red", marginLeft: 8 }}>削除</button>
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
        style={{ marginBottom: 8 }}
      />
      {/* 中身 */}
      {bundleLines.map((line, idx) => (
        <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
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
            style={{ width: 60 }}
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

      <div style={{ marginTop: 8 }}>
        合計（参考）: {bundleTotal} 円
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input
          type="number"
          value={bundlePrice}
          onChange={(e) => setBundlePrice(Number(e.target.value) || 0)}
          placeholder="価格"
          className="no-spinner"
          style={{ width: 100 }}
        />

        <button onClick={() => setBundlePrice(bundleTotal)}>
          合計を反映
        </button>
      </div>

      <button
        style={{ marginTop: 8 }}
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
        <button /*onClick={syncCatalog}*/ style={{ marginLeft: 16 }}>
          カタログ同期(データベース保存機能ができるまでは未実装)
        </button>
    </div>
    
  );
}