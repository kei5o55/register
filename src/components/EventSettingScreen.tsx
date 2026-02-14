// src/components/EventSettingScreen.tsx
// イベント単位の設定（タグ/メモ/使用頒布物/使用バンドル）を編集する画面

import { useEffect, useMemo, useState } from "react";
import { TagEditor } from "./TagEditor";
import type { Bundle, Event, Item } from "../logic/types";

type Props = {
  event: Event;

  // 全頒布物/全バンドル（ItemsScreen で管理しているやつをそのまま渡す）
  items: Item[];
  bundles: Bundle[];

  // このイベントで使うもの（イベント別に App 側で保持する）
  selectedItemIds: string[];
  selectedBundleIds: string[];

  // 反映（保存）用コールバック
  onUpdateEventBasics: (
    eventId: string,
    patch: { name?: string; date?: string; memo?: string }
  ) => void;

  onChangeEventTags: (eventId: string, tags: string[]) => void;

  onChangeEventItems: (eventId: string, itemIds: string[]) => void;
  onChangeEventBundles: (eventId: string, bundleIds: string[]) => void;

  onBack: () => void;

  // 任意：ここから削除もできるようにするなら
  onDeleteEvent?: (eventId: string) => void;
};

export function EventSettingScreen({
  event,
  items,
  bundles,
  selectedItemIds,
  selectedBundleIds,
  onUpdateEventBasics,
  onChangeEventTags,
  onChangeEventItems,
  onChangeEventBundles,
  onBack,
  onDeleteEvent,
}: Props) {
  // --- ローカル編集状態（保存ボタン方式）
  const [name, setName] = useState(event.name);
  const [date, setDate] = useState(event.date);
  const [memo, setMemo] = useState(event.memo ?? "");
  const [tags, setTags] = useState<string[]>(event.tags ?? []);
  const [itemIds, setItemIds] = useState<string[]>(selectedItemIds);
  const [bundleIds, setBundleIds] = useState<string[]>(selectedBundleIds);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // event切替で同期
  useEffect(() => {
    setName(event.name);
    setDate(event.date);
    setMemo(event.memo ?? "");
    setTags(event.tags ?? []);
  }, [event.id]);

  useEffect(() => {
    setItemIds(selectedItemIds);
    setBundleIds(selectedBundleIds);
  }, [event.id, selectedItemIds, selectedBundleIds]);

  const itemSet = useMemo(() => new Set(itemIds), [itemIds]);
  const bundleSet = useMemo(() => new Set(bundleIds), [bundleIds]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      for (const t of it.tags ?? []) set.add(t);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
  }, [items]);

  const visibleItems = useMemo(() => {
    if (!activeTag) return items;
    return items.filter((it) => it.tags?.includes(activeTag));
  }, [items, activeTag]);


  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const handleSave = () => {
    if (!name.trim() || !date.trim()) {
      alert("イベント名と開催日は必須です");
      return;
    }

    onUpdateEventBasics(event.id, { name, date, memo });
    onChangeEventTags(event.id, tags);
    onChangeEventItems(event.id, itemIds);
    onChangeEventBundles(event.id, bundleIds);

    alert("保存しました");
    
  };

  const hasChanges =
    name !== event.name ||
    date !== event.date ||
    memo !== (event.memo ?? "") ||
    JSON.stringify(tags) !== JSON.stringify(event.tags ?? []) ||
    JSON.stringify(itemIds) !== JSON.stringify(selectedItemIds) ||
    JSON.stringify(bundleIds) !== JSON.stringify(selectedBundleIds);

  // UIで合計点数を出したい時用（任意）
  const enabledCount = itemIds.length + bundleIds.length;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack}>← 戻る</button>
        <h2 style={{ margin: "16px 0" }}>イベント設定</h2>
      </div>

      {/* 基本情報 */}
      <section style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>基本情報</h3>

        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>開催日</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>イベント名</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: コミティア●●●"
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>メモ</span>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="スペース番号や配置メモなど"
              rows={3}
            />
          </label>
        </div>
      </section>

      {/* タグ */}
      <section
        style={{
          border: "1px solid #ddd",
          padding: 16,
          borderRadius: 8,
          marginTop: 16,
        }}
      >
        <h3 style={{ marginTop: 0 }}>タグ</h3>
        <TagEditor
          tags={tags}
          onChange={setTags}
          placeholder="イベントタグ（例：夏コミ）"
        />
      </section>

      {/* 使用頒布物 */}
      <section
        style={{
          border: "1px solid #ddd",
          padding: 16,
          borderRadius: 8,
          marginTop: 16,
        }}
      >
        <h3 style={{ marginTop: 0 }}>
          使用する頒布物 / バンドル（合計 {enabledCount} 件）
        </h3>
        <p style={{ opacity: 0.8, marginTop: 0 }}>
          レジ画面には、ここでONにしたものだけ表示される想定
        </p>


        <h4 style={{ marginBottom: 8 }}>単品頒布物</h4>
        {/* タグフィルタ */}
        {allTags.length > 0 && (
          <div style={{ margin: "8px 0 12px" }}>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
              タグで絞り込み
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                style={{
                  padding: "2px 8px",
                  borderRadius: 999,
                  border: "1px solid #ddd",
                  fontSize: 12,
                  cursor: "pointer",
                  opacity: activeTag === null ? 1 : 0.75,
                }}
              >
                すべて
              </button>

              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  style={{
                    padding: "2px 8px",
                    borderRadius: 999,
                    border: "1px solid #ddd",
                    fontSize: 12,
                    cursor: "pointer",
                    opacity: activeTag === tag ? 1 : 0.75,
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <p>頒布物がまだ登録されていません。</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {visibleItems.map((it) => (
              <label
                key={it.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  border: "1px solid #eee",
                  padding: 10,
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={itemSet.has(it.id)}
                  onChange={() => setItemIds((prev) => toggle(prev, it.id))}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{it.name}</div>
                <div style={{ marginTop: 4, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {it.price} 円 / 在庫 {it.stock}
                    {/* event.tags?.length で安全にチェック */}
                    {(it.tags?.length ?? 0) > 0 ? (
                      it.tags?.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          backgroundColor: activeTag === tag ? "#39739d" : "#e1ecf4",
                          color: activeTag === tag ? "#fff" : "#39739d",
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontSize: "0.8em",
                          
                        }}
                      >
                        #{tag}
                      </span>
                      ))
                    ) : (
                      ""
                    )}
  
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        <h4 style={{ margin: "18px 0 8px" }}>バンドル</h4>
        {bundles.length === 0 ? (
          <p>バンドルはまだありません。</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {bundles.map((b) => (
              <label
                key={b.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  border: "1px solid #eee",
                  padding: 10,
                  borderRadius: 8,
                }}
              >
                <input
                  type="checkbox"
                  checked={bundleSet.has(b.id)}
                  onChange={() => setBundleIds((prev) => toggle(prev, b.id))}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{b.name}</div>
                  <div style={{ opacity: 0.75 }}>{b.price} 円</div>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>
                    {b.lines
                      .map((l) => {
                        const it = items.find((x) => x.id === l.itemId);
                        return `${it?.name ?? "不明"}×${l.quantity}`;
                      })
                      .join(" / ")}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* 操作 */}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button onClick={handleSave} disabled={!hasChanges}>
          保存
        </button>
        <button onClick={onBack}>キャンセル</button>

        {onDeleteEvent && (
          <button
            style={{ marginLeft: "auto", color: "red" }}
            onClick={() => {
              if (
                window.confirm(
                  `"${event.name}" を削除しますか？関連する売上履歴も削除されます。`
                )
              ) {
                onDeleteEvent(event.id);
              }
            }}
          >
            イベントを削除
          </button>
        )}
      </div>
    </div>
  );
}
