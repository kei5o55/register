import { useState } from "react";
import type { Item,Bundle,BundleLine } from "../logic/types";

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
}: ItemsScreenProps) {
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("500");
  const [newStock, setNewStock] = useState("10");
  const [bundleName, setBundleName] = useState("");
  const [bundleLines, setBundleLines] = useState<BundleLine[]>([]);
  const [bundlePrice, setBundlePrice] = useState(0);

  const addLine = () => {
    const firstItem = items[0];
    if (!firstItem) return;
    const next = [...bundleLines, { itemId: firstItem.id, quantity: 1 }];
    setBundleLines(next);
    // 初期値は合計：新しく作り始めた直後は合計に寄せる
    setBundlePrice(calcBundleTotal(next));
  };

  const updateLineQty = (idx: number, quantity: number) => {
    const q = Math.max(1, quantity || 1);
    const next = bundleLines.map((l, i) => (i === idx ? { ...l, quantity: q } : l));
    setBundleLines(next);
    // price 自動更新しない
  };

  const reflectTotalToPrice = () => setBundlePrice(bundleTotal);

  const submitBundle = () => {
    if (!bundleName.trim()) return;
    if (bundleLines.length === 0) return;
    if (bundlePrice <= 0) return;

    onAddBundle(bundleName.trim(), bundleLines, bundlePrice);

    setBundleName("");
    setBundleLines([]);
    setBundlePrice(0);
  };

  const updateLineItem = (idx: number, itemId: string) => {
    const next = bundleLines.map((l, i) => (i === idx ? { ...l, itemId } : l));
    setBundleLines(next);
    // ここでは price は自動更新しない（割引が消えるのを防ぐ）
  };

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
                  <button onClick={() => onDeleteBundle(b.id)}>削除</button>
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
          </div>
  );
}