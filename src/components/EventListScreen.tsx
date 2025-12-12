import { useState } from "react";
import type { Event } from "../types";

type EventListProps = {
  events: Event[];
  currentEventId: string | null;
  onSelectCurrentEvent: (id: string) => void;
  onOpenEventHistory: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onAddEvent: (name: string, date: string, memo: string) => void;
};

export function EventListScreen({
  events,
  currentEventId,
  onSelectCurrentEvent,
  onOpenEventHistory,
  onDeleteEvent,
  onAddEvent,
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
                    checked={currentEventId === event.id}
                    onChange={() => onSelectCurrentEvent(event.id)}
                  />
                </td>
                <td>{event.date}</td>
                <td>
                  {event.name}
                  {currentEventId === event.id && (
                    <strong style={{ marginLeft: 8, color: "green" }}>
                      （現在のイベント）
                    </strong>
                  )}
                </td>
                <td>{event.memo ?? "-"}</td>
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
          placeholder="イベント名（例: コミティア148）"
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
