import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div
      style={{
        padding: '80px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 16,
      }}
    >
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 30 }}>Page not found</h1>
      <Link
        to="/"
        style={{
          padding: '12px 24px',
          borderRadius: 999,
          border: 'none',
          background: 'var(--gold-gradient)',
          color: '#000',
          fontFamily: 'Syne,sans-serif',
          fontWeight: 700,
        }}
      >
        Back to Shop
      </Link>
    </div>
  );
}
