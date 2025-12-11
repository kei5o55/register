import { useState } from "react";
import type { Event } from "../types";

type EventListProps = {
  events: Event[];
  onSelectEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onAddEvent: (name: string, date: string, memo: string) => void;
};

export function EventListScreen({
  events,
  onSelectEvent,
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
      <p>参加したイベントごとの記録を一覧表示します。</p>

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
              <th>開催日</th>
              <th>イベント名</th>
              <th>メモ</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.date}</td>
                <td>{event.name}</td>
                <td>{event.memo ?? "-"}</td>
                <td>
                  <button onClick={() => onSelectEvent(event.id)}>
                    詳細を見る
                  </button>
                  <button
                    style={{ marginLeft: 8 }}
                    onClick={() => {
                      if (
                        window.confirm(
                          `"${event.name}" を削除しますか？関連する売上履歴も消える可能性があります。`
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
          placeholder="開催日"
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
