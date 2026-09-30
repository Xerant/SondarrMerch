import { Link } from 'react-router-dom';

export function ShopFooter() {
  return (
    <footer
      style={{
        padding: '40px 48px',
        borderTop: '1px solid var(--border)',
        marginTop: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}
    >
      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>&copy; {new Date().getFullYear()} Sondarr Merch</span>
      <Link to="/sell" style={{ fontSize: 12 }}>
        Artist? Sell your merch on Sondarr &rarr;
      </Link>
    </footer>
  );
}
