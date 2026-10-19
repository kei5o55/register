// src/components/EventListScreen.tsx
// eventの一覧画面コンポーネント
// 登録されているイベントの一覧を表示し、選択や追加・削除を行う

import { useState } from "react";
import type { Event } from "../logic/types";

type EventListProps = {
  events: Event[];
  currentEventId: string | null;
  onSelectCurrentEvent: (id: string) => void;
  onOpenEventHistory: (id: string) => void;
  //onOpenEventDetail: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onAddEvent: (name: string, date: string, memo: string) => void;
  onChangeEventTags: (eventId: string, tags: string[]) => void;
  onOpenEventSetting: (id: string) => void;
};



export function EventListScreen({
  events,
  currentEventId,
  onSelectCurrentEvent,
  onOpenEventHistory,
  onDeleteEvent,
  onAddEvent,
  onOpenEventSetting,
}: EventListProps) {
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newMemo, setNewMemo] = useState("");

  const handleSubmit = () => {
    if (!newName.trim() || !newDate.trim()) {
      alert("イベント名と開催日は必須です");
      return;
    }
    onAddEvent(newName, newDate, newMemo);
    setNewName("");
    setNewDate("");
    setNewMemo("");
  };

  return (
    <div>
      <h2>イベント履歴</h2>
      <p>レジで使用するイベントを選択できます。</p>

      {events.length === 0 ? (
        <p>まだイベントが登録されていません。</p>
      ) : (
        <div className="mt-4 mb-6 overflow-x-auto">
          <table className="w-full border-collapse leading-relaxed [&_td]:px-3 [&_td]:py-2 [&_td]:align-middle [&_th]:px-3 [&_th]:py-2 [&_th]:whitespace-nowrap">
            <thead>
              <tr>
                <th>使用</th>
                <th>開催日</th>
                <th>イベント名</th>
                <th>メモ</th>
                <th>タグ</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="text-center">
                    <input
                      type="radio"
                      name="currentEvent"
                      className="relative size-[22px] cursor-pointer appearance-none rounded border-2 border-[#ccc] bg-white align-middle transition-all duration-200 hover:border-[#007bff] checked:border-[#007bff] checked:bg-[#007bff] checked:before:absolute checked:before:top-[-1px] checked:before:left-[6px] checked:before:h-3 checked:before:w-1 checked:before:rotate-45 checked:before:border-r-[3px] checked:before:border-b-[3px] checked:before:border-white"
                      checked={currentEventId === event.id}
                      onChange={() => onSelectCurrentEvent(event.id)}
                    />
                  </td>
                  <td className="whitespace-nowrap">{event.date}</td>
                  <td className="min-w-[8em] break-words">{event.name}</td>
                  <td className="min-w-[10em] text-sm break-words whitespace-pre-wrap">
                    {event.memo || "-"}
                  </td>
                  <td className="min-w-[6em]">
                    <div className="flex flex-wrap gap-1">
                      {/* event.tags?.length で安全にチェック */}
                      {(event.tags?.length ?? 0) > 0 ? (
                        event.tags?.map((tag, i) => (
                          <span key={i} className="rounded bg-[#e1ecf4] px-1.5 py-0.5 text-[0.85em] whitespace-nowrap text-[#39739d]">
                            #{tag}
                          </span>
                        ))
                      ) : (
                        "-"
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2 whitespace-nowrap [&_button]:px-3 [&_button]:py-1 [&_button]:text-sm">
                      <button onClick={() => onOpenEventHistory(event.id)}>
                        売上履歴
                      </button>
                      <button onClick={() => onOpenEventSetting(event.id)}>
                        設定
                      </button>
                      <button
                        className="text-[red]"
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
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3>イベントを追加</h3>
      <form
        className="flex max-w-[480px] flex-col gap-4 rounded-lg border border-[#ddd] p-4 [&_input]:px-2 [&_input]:py-1.5 [&_textarea]:px-2 [&_textarea]:py-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold">
            イベント名<span className="ml-1 text-[#b45309]">*</span>
          </span>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="例: コミティア●●●"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold">
            開催日<span className="ml-1 text-[#b45309]">*</span>
          </span>
          <input
            type="date"
            className="w-fit"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold">
            メモ<span className="ml-1 text-xs font-normal opacity-70">（任意）</span>
          </span>
          <textarea
            className="leading-relaxed"
            value={newMemo}
            onChange={(e) => setNewMemo(e.target.value)}
            placeholder="スペース番号や配置メモなど"
            rows={3}
          />
        </label>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs opacity-70">* は必須項目です</span>
          <button type="submit">イベントを追加</button>
        </div>
      </form>
    </div>
  );
}
