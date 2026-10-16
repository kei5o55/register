// src/components/EventSettingScreen.tsx
// イベント単位の設定（タグ/メモ/使用頒布物/使用バンドル）を編集する画面

import { useEffect, useMemo, useState } from "react";
import { TagEditor } from "./TagEditor";
import type { Bundle, Event, Item } from "../logic/types";
import { loadItemImageBlob } from "../logic/storage";


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
  // イベント切替時は App 側で key={event.id} を渡して再マウントし、初期値を取り直す
  const [name, setName] = useState(event.name);
  const [date, setDate] = useState(event.date);
  const [memo, setMemo] = useState(event.memo ?? "");
  const [tags, setTags] = useState<string[]>(event.tags ?? []);
  const [itemIds, setItemIds] = useState<string[]>(selectedItemIds);
  const [bundleIds, setBundleIds] = useState<string[]>(selectedBundleIds);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeBundleTag, setActiveBundleTag] = useState<string | null>(null);
  const [localImageUrls, setLocalImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let alive = true;
    const created: string[] = [];

    (async () => {
      const entries: [string, string][] = [];

      for (const it of items) {
        const blob = await loadItemImageBlob(it.id);
        if (blob) {
          const url = URL.createObjectURL(blob);
          created.push(url);
          entries.push([it.id, url]);
        }
      }

      if (alive) {
        // 既存URLを掃除してから入れ替え（メモリ漏れ防止）
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
      created.forEach(URL.revokeObjectURL);
    };
  }, [items]);

  const itemSet = useMemo(() => new Set(itemIds), [itemIds]);
  const bundleSet = useMemo(() => new Set(bundleIds), [bundleIds]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      for (const t of it.tags ?? []) set.add(t);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
  }, [items]);

  const allBundleTags = useMemo(() => {
    const set = new Set<string>();
    for (const b of bundles) {
      for (const t of b.tags ?? []) set.add(t);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
  }, [bundles]);

  const visibleItems = useMemo(() => {
    if (!activeTag) return items;
    return items.filter((it) => it.tags?.includes(activeTag));
  }, [items, activeTag]);

  const visibleBundles = useMemo(() => {
    if (!activeBundleTag) return bundles;
    return bundles.filter((b) => b.tags?.includes(activeBundleTag));
  }, [bundles, activeBundleTag]);



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

  const sectionClass = "rounded-lg border border-[#ddd] p-4";
  const fieldClass = "grid gap-1.5";
  const selectableRowClass =
    "flex cursor-pointer items-center gap-2.5 rounded-lg border border-[#eee] p-2.5";
  const filterButtonClass = (active: boolean) =>
    `cursor-pointer rounded-full border border-[#ddd] px-2 py-0.5 text-xs ${active ? "opacity-100" : "opacity-75"}`;
  const tagBadgeClass = (active: boolean) =>
    `rounded px-1.5 py-0.5 text-[0.8em] ${active ? "bg-[#39739d] text-white" : "bg-[#e1ecf4] text-[#39739d]"}`;

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="flex items-center gap-3">
        <button onClick={onBack}>← 戻る</button>
        <h2 className="my-4">イベント設定</h2>
      </div>

      {/* 基本情報 */}
      <section className={sectionClass}>
        <h3 className="mt-0">基本情報</h3>

        <div className="grid gap-2.5">
          <label className={fieldClass}>
            <span>開催日</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <label className={fieldClass}>
            <span>イベント名</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: コミティア●●●"
            />
          </label>

          <label className={fieldClass}>
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
      <section className={`${sectionClass} mt-4`}>
        <h3 className="mt-0">タグ</h3>
        <TagEditor
          tags={tags}
          onChange={setTags}
          placeholder="イベントタグ（例：夏コミ）"
        />
      </section>

      {/* 使用頒布物 */}
      <section className={`${sectionClass} mt-4`}>
        <h3 className="mt-0">
          使用する頒布物 / バンドル（合計 {enabledCount} 件）
        </h3>
        <p className="mt-0 opacity-80">
          レジ画面には、ここでONにしたものだけ表示される想定
        </p>


        <h4 className="mb-2">単品頒布物</h4>
        
        {/* タグフィルタ */}
          <div className="mt-2 mb-3">
            <div className="mb-1.5 text-xs opacity-70">
              タグで絞り込み
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                className={filterButtonClass(activeTag === null)}
              >
                すべて
              </button>

              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={filterButtonClass(activeTag === tag)}
                >
                  #{tag}
                </button>
                
              ))}
            </div>
          </div>

        {items.length === 0 ? (
          <p>頒布物がまだ登録されていません。</p>
        ) : (
          <div className="grid gap-2">
            {visibleItems.map((it) => (
              <label key={it.id} className={selectableRowClass}>
                <input
                  type="checkbox"
                  checked={itemSet.has(it.id)}
                  onChange={() => setItemIds((prev) => toggle(prev, it.id))}
                />
                <div className="font-semibold">
                  {(() => {
                    const src = localImageUrls[it.id] ?? it.imageUrl; // ★ローカル優先
                    return src ? (
                      <img
                        key={src}
                        src={src}
                        alt={it.name}
                        className="size-14 rounded-lg border border-[#ddd] object-cover"
                        onLoad={(e) => ((e.currentTarget as HTMLImageElement).style.display = "")}
                        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                      />
                    ) : (
                      "No Image"
                    );
                  })()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{it.name}</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                    {it.price} 円 / 在庫 {it.stock}
                    {/* event.tags?.length で安全にチェック */}
                    {(it.tags?.length ?? 0) > 0 ? (
                      it.tags?.map((tag) => (
                      <span key={tag} className={tagBadgeClass(activeTag === tag)}>
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

        <h4 className="mt-[18px] mb-2">バンドル</h4>
        <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveBundleTag(null)}
                className={filterButtonClass(activeBundleTag === null)}
              >
                すべて
              </button>
              {allBundleTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveBundleTag(tag)}
                  className={filterButtonClass(activeBundleTag === tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
        {bundles.length === 0 ? (
          <p>バンドルはまだありません。</p>
        ) : (
          <div className="grid gap-2">
            {visibleBundles.map((b) => (
              <label key={b.id} className={selectableRowClass}>
                <input
                  type="checkbox"
                  checked={bundleSet.has(b.id)}
                  onChange={() => setBundleIds((prev) => toggle(prev, b.id))}
                />
                <div className="flex-1">
                  <div className="font-semibold">{b.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">{b.price} 円

                    {/* event.tags?.length で安全にチェック */}
                    {(b.tags?.length ?? 0) > 0 ? (
                        b.tags!.map((tag) => (
                          <span key={tag} className={tagBadgeClass(activeBundleTag === tag)}>
                            #{tag}
                          </span>
                        ))
                      ) : (
                        ""
                      )}
                  </div>
                  <div className="text-xs opacity-70">
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
      <div className="mt-4 flex gap-2.5">
        <button onClick={handleSave} disabled={!hasChanges}>
          保存
        </button>
        <button onClick={onBack}>キャンセル</button>

        {onDeleteEvent && (
          <button
            className="ml-auto text-[red]"
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
