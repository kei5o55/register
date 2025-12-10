// src/components/EventListScreen.tsx
import type { Event } from "../types";

type EventListProps = {
  events: Event[];
  onSelectEvent: (id: string) => void;
};

export function EventListScreen({ events, onSelectEvent }: EventListProps) {
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
          style={{ borderCollapse: "collapse", marginTop: 16 }}
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
