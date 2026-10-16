// src/components/TagEditor.tsx
// タグ編集コンポーネント
// タグの追加・削除を行うUIを提供する

import { useState } from "react";

type Props = {
  tags: string[] | undefined;
  onChange: (next: string[]) => void;
  placeholder?: string;
};

export function TagEditor({ tags, onChange, placeholder }: Props) {
  const [input, setInput] = useState("");
  const list = tags ?? [];

  const commit = () => {
    const t = input.trim();
    if (!t) return;
    if (list.includes(t)) {
      setInput("");
      return;
    }
    onChange([...list, t]);
    setInput("");
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <input
          value={input}
          placeholder={placeholder ?? "タグ名"}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
        />
        <button type="button" onClick={commit}>
          追加
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-xs opacity-70">タグなし</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {list.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#ccc] px-2 py-1 text-xs"
            >
              #{t}
              <button
                type="button"
                onClick={() => onChange(list.filter((x) => x !== t))}
                className="cursor-pointer border-none bg-transparent"
                aria-label={`remove ${t}`}
                title="削除"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
