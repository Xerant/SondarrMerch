import { Link } from 'react-router-dom';
import { Logo } from '../../components/Logo';

const SONDARR_APP_URL = import.meta.env.VITE_SONDARR_APP_URL || 'http://localhost:5173';

interface SellHeaderProps {
  mode: 'wizard' | 'dashboard';
  onPreviewDashboard: () => void;
}

export function SellHeader({ mode, onPreviewDashboard }: SellHeaderProps) {
  return (
    <header
      style={{
        height: 64,
        padding: '0 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-header)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <Logo tag="SELL MERCH" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link to="/" style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          Merch Shop
        </Link>
        <a href={SONDARR_APP_URL} style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          Back to Sondarr
        </a>
        {mode !== 'dashboard' && (
          <button className="navlink" onClick={onPreviewDashboard} style={{ color: 'var(--gold)' }}>
            Preview Dashboard &rarr;
          </button>
        )}
      </div>
    </header>
  );
}
