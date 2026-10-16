// src/components/StandbyScreen.tsx
// 待機画面コンポーネント
// 会計していない間に全画面でオーバーレイ表示する。画面のどこかをクリックすると閉じる

import type { Event } from "../logic/types";

type StandbyProps = {
  currentEvent: Event | null;
  onClose: () => void;
};

export function StandbyScreen({ currentEvent, onClose }: StandbyProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="待機画面を閉じる"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Escape") onClose();
      }}
      className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center gap-4 bg-[#111] text-white"
    >
      <div className="text-4xl font-bold">Rejistella</div>
      {currentEvent && <div className="text-xl opacity-80">{currentEvent.name}</div>}
      <div className="text-sm opacity-60">画面をタップするとレジに戻ります</div>
    </div>
  );
}
