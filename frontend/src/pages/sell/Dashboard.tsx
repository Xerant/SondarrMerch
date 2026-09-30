import { Plus, RefreshCw, Store, Trash2 } from 'lucide-react';
import type { ManualProduct, ShopifyMockProduct, WizardStep } from './types';

interface DashboardProps {
  shopify: ShopifyMockProduct[] | null;
  manual: ManualProduct[];
  onDisconnect: () => void;
  onResync: () => void;
  onAddMore: (target: WizardStep) => void;
  onRemoveManual: (id: string) => void;
}

export function Dashboard({ shopify, manual, onDisconnect, onResync, onAddMore, onRemoveManual }: DashboardProps) {
  const totalProducts = (shopify?.length ?? 0) + manual.length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 32, marginBottom: 6 }}>Sell Merch</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {totalProducts} product{totalProducts !== 1 ? 's' : ''} live on Sondarr Merch
          </p>
        </div>
      </div>

      {shopify ? (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--gold-dim-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold)',
            }}
          >
            <Store size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
              Connected store{' '}
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Synced just now &middot; {shopify.length} products imported</div>
          </div>
          <button
            onClick={onResync}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid var(--border-strong)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
            Resync
          </button>
          <button
            onClick={onDisconnect}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid var(--red-border)',
              background: 'var(--red-bg)',
              color: 'var(--red)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={() => onAddMore('shopify-form')}
          className="card"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 28,
            cursor: 'pointer',
            border: '1px dashed rgba(255,255,255,0.15)',
          }}
        >
          <Store size={18} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Connect a Shopify store to sync your catalog automatically</span>
        </button>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17 }}>Your Products</h3>
        <button
          onClick={() => onAddMore('manual-form')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 10,
            border: '1px solid var(--border-gold-strong)',
            background: 'rgba(212,146,14,0.1)',
            color: 'var(--gold)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          <Plus size={12} />
          Add Product
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
        {shopify?.map((p) => (
          <div key={p.id} className="card" style={{ padding: 14 }}>
            <div style={{ aspectRatio: '1/1', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
              <div className="img-placeholder" />
            </div>
            <div style={{ fontSize: 9, letterSpacing: '0.06em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 4 }}>
              Shopify
            </div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text)' }}>${p.price}</div>
          </div>
        ))}
        {manual.map((p) => (
          <div key={p.id} className="card" style={{ padding: 14, position: 'relative' }}>
            <button
              onClick={() => onRemoveManual(p.id)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'rgba(6,8,18,0.7)',
                border: 'none',
                borderRadius: 6,
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 4,
              }}
              aria-label="Remove product"
            >
              <Trash2 size={12} />
            </button>
            <div style={{ aspectRatio: '1/1', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
              <div className="img-placeholder" />
            </div>
            <div style={{ fontSize: 9, letterSpacing: '0.06em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 4 }}>
              Manual &middot; {p.cat}
            </div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text)' }}>${p.price.toFixed(2)}</div>
          </div>
        ))}
        {totalProducts === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '40px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            No products yet — connect a store or add one manually.
          </div>
        )}
      </div>
    </div>
  );
}
