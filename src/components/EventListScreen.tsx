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
  //onOpenEventDetail,
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
        <table
          border={1}
          cellPadding={4}
          style={{ borderCollapse: "collapse", marginTop: 16, marginBottom: 24 }}
        >
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
                <td style={{ textAlign: "center" }}>
                  <input
                    type="radio"
                    name="currentEvent"
                    className="custom-check-radio"
                    checked={currentEventId === event.id}
                    onChange={() => onSelectCurrentEvent(event.id)}
                  />
                </td>
                <td>{event.date}</td>
                <td>
                  {event.name}
                </td>
                <td>{event.memo ?? "-"}</td>
                <td>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {/* event.tags?.length で安全にチェック */}
                    {(event.tags?.length ?? 0) > 0 ? (
                      event.tags?.map((tag, i) => (
                        <span key={i} style={{
                          backgroundColor: "#e1ecf4",
                          color: "#39739d",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "0.85em"
                        }}>
                          #{tag}
                        </span>
                      ))
                    ) : (
                      "-"
                    )}
                  </div>
                </td>
                <td>
                  <button onClick={() => onOpenEventHistory(event.id)}>
                    売上履歴
                  </button>
                  <button
                    style={{ marginLeft: 8,color:"red" }}
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
                </td>
                <td>
                  <button style={{ marginLeft: 8 }} onClick={() => onOpenEventSetting(event.id)}>
                    設定
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>イベントを追加</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400 }}>
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
        />
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="イベント名（例: コミティア●●●）"
        />
        <textarea
          value={newMemo}
          onChange={(e) => setNewMemo(e.target.value)}
          placeholder="スペース番号や配置メモなど（任意）"
          rows={3}
        />

        <button onClick={handleSubmit}>イベントを追加</button>
      </div>
    </div>
  );
}
