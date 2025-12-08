type HistoryProps = {
  sales: Sale[];
  onSelectSale: (id: string) => void;
};

function HistoryScreen({ sales, onSelectSale }: HistoryProps) {
  return (
    <div>
      <h2>売上履歴</h2>
      {sales.length === 0 ? (
        <p>まだ売上はありません</p>
      ) : (
        <ul>
          {sales.map((sale) => (
            <li key={sale.id} style={{ marginBottom: 8 }}>
              <button onClick={() => onSelectSale(sale.id)}>
                {sale.datetime} - {sale.total} 円
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
