import { useState } from 'react';
import { Check } from 'lucide-react';
import { SHOPIFY_MOCK } from './mockData';
import type { ShopifyMockProduct } from './types';

interface ShopifySyncProps {
  storeUrl: string;
  onFinish: (products: ShopifyMockProduct[]) => void;
  onBack: () => void;
}

export function ShopifySync({ storeUrl, onFinish, onBack }: ShopifySyncProps) {
  const [included, setIncluded] = useState<string[]>(SHOPIFY_MOCK.map((p) => p.id));
  const toggle = (id: string) =>
    setIncluded((inc) => (inc.includes(id) ? inc.filter((x) => x !== id) : [...inc, id]));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ color: 'var(--green)', display: 'flex' }}>
          <Check size={18} />
        </div>
        <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18 }}>Connected to {storeUrl}</div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        We found {SHOPIFY_MOCK.length} products. Choose which ones to list on Sondarr.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {SHOPIFY_MOCK.map((p) => (
          <label key={p.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: '14px 16px' }}>
            <input
              type="checkbox"
              checked={included.includes(p.id)}
              onChange={() => toggle(p.id)}
              style={{ width: 16, height: 16, accentColor: 'var(--gold)' }}
            />
            <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
              <div className="img-placeholder" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: 14 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{p.inv} in stock</div>
            </div>
            <div style={{ fontSize: 14, color: 'var(--gold)', fontWeight: 600 }}>${p.price}</div>
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="navlink" onClick={onBack}>
          Cancel
        </button>
        <button
          onClick={() => onFinish(SHOPIFY_MOCK.filter((p) => included.includes(p.id)))}
          style={{
            marginLeft: 'auto',
            padding: '12px 24px',
            borderRadius: 12,
            border: 'none',
            background: 'var(--gold-gradient)',
            color: '#000',
            fontFamily: 'Syne,sans-serif',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Finish setup
        </button>
      </div>
    </div>
  );
}
