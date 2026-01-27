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
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
        <div style={{ fontSize: 12, opacity: 0.7 }}>タグなし</div>
      ) : (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {list.map((t) => (
            <span
              key={t}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 8px",
                border: "1px solid #ccc",
                borderRadius: 999,
                fontSize: 12,
              }}
            >
              #{t}
              <button
                type="button"
                onClick={() => onChange(list.filter((x) => x !== t))}
                style={{ border: "none", background: "transparent", cursor: "pointer" }}
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
