// src/components/HomeScreen.tsx
type HomeProps = {
  onGoRegister: () => void;
  onGoHistory: () => void;
};

export function HomeScreen({ onGoRegister, onGoHistory }: HomeProps) {
  return (
    <div>
      <h2>ホーム</h2>
      <p>同人即売会用のWebレジアプリです。</p>
      <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
        <button onClick={onGoRegister}>レジ画面を開く</button>
        <button onClick={onGoHistory}>売上履歴を見る</button>
      </div>
    </div>
  );
}
