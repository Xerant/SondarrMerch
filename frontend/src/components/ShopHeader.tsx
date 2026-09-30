import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { Logo } from './Logo';
import { useCart } from '../context/CartContext';

const SONDARR_APP_URL = import.meta.env.VITE_SONDARR_APP_URL || 'http://localhost:5173';

export function ShopHeader() {
  const { itemCount } = useCart();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        height: 64,
        padding: '0 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-header)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        <Link to="/" style={{ display: 'flex' }}>
          <Logo />
        </Link>
        <nav style={{ display: 'flex', gap: 24 }}>
          <NavLink to="/" end className={({ isActive }) => 'navlink' + (isActive ? ' active' : '')}>
            Shop
          </NavLink>
          <NavLink to="/collections" className={({ isActive }) => 'navlink' + (isActive ? ' active' : '')}>
            Collections
          </NavLink>
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <a
          href={SONDARR_APP_URL}
          style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={12} />
          Back to Sondarr
        </a>
        <Link
          to="/cart"
          style={{
            position: 'relative',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 999,
            padding: '9px 12px',
            color: 'var(--text)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ShoppingBag size={16} />
          {itemCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                background: 'var(--gold)',
                color: '#000',
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 999,
                minWidth: 17,
                height: 17,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
              }}
            >
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
