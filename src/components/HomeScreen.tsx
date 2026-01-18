// src/components/HomeScreen.tsx
import type { Event } from "../types";

type HomeProps = {
  currentEvent: Event | null;//現在のイベントを持つ
  onGoRegister: () => void;
  onGoHistory: () => void;
  onGoEvents: () => void;
};

export function HomeScreen({ currentEvent,onGoRegister, onGoHistory,onGoEvents}: HomeProps) {
  return (
    <div>
      <h2>ホーム</h2>

      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, marginBottom: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>現在のイベント</div>

        {currentEvent ? (
          <>
            <div>{currentEvent.name}</div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>{currentEvent.date}</div>
            {currentEvent.memo && <div style={{ opacity: 0.7, fontSize: 12 }}>{currentEvent.memo}</div>}
          </>
        ) : (
          <>
            <div style={{ color: "#b45309" }}>未選択</div>
            <button onClick={onGoEvents} style={{ marginTop: 8 }}>
              イベントを選択する
            </button>
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onGoRegister} disabled={!currentEvent}>
          レジへ
        </button>
        <button onClick={onGoHistory}>売上履歴へ</button>
      </div>
    </div>
  );
}
