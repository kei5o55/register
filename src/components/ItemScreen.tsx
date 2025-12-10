import { useState } from "react";
import type { Item } from "../types";

type ItemsScreenProps = {
  items: Item[];
  onChangeName: (id: string, name: string) => void;
  onChangePrice: (id: string, price: number) => void;
  onChangeStock: (id: string, stock: number) => void;
  onAddItem: (name: string, price: number, stock: number) => void;
  onDeleteItem: (id: string) => void;
};

export function ItemsScreen({
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