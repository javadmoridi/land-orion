interface OrionCardProps {
  name?: string;
  level?: number;
  price?: number;
}

export function OrionCard({
  name = 'Orion',
  level = 1,
  price = 0,
}: OrionCardProps) {
  return (
    <div
      style={{
        height: 220,
        borderRadius: 20,
        background:
          'rgba(255,255,255,.06)',
        border:
          '1px solid rgba(255,215,0,.2)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#fff',
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 900,
        }}
      >
        {name}
      </div>

      <div>
        Level: {level}
      </div>

      <div
        style={{
          color: '#ffd700',
          fontWeight: 900,
        }}
      >
        {price} Token
      </div>

      <button
        style={{
          border: 'none',
          borderRadius: 10,
          padding: 10,
          background: '#ffd700',
          fontWeight: 900,
          cursor: 'pointer',
        }}
      >
        BUY
      </button>
    </div>
  );
}