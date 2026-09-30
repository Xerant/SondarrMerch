import { ArrowLeft, Store, Upload } from 'lucide-react';
import type { WizardStep } from './types';

export function ChooseMethod({ onPick }: { onPick: (step: WizardStep) => void }) {
  return (
    <div>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 32, marginBottom: 8 }}>
        Start selling merch
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32, maxWidth: 520 }}>
        Plug in your existing Shopify store, or upload your own products directly. You set the price — Sondarr fans
        check out without leaving the app.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <button
          onClick={() => onPick('shopify-form')}
          className="card"
          style={{ textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14 }}
        >
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
          <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17 }}>Connect Shopify</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Sync your existing catalog automatically. Inventory and pricing stay in sync with your store.
          </div>
          <span style={{ fontSize: 13, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 6 }}>
            Connect store <ArrowLeft size={12} style={{ transform: 'rotate(180deg)' }} />
          </span>
        </button>
        <button
          onClick={() => onPick('manual-form')}
          className="card"
          style={{ textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14 }}
        >
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
            <Upload size={20} />
          </div>
          <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17 }}>Upload products manually</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            No storefront yet? Add products one at a time — set your own price, images, and variants.
          </div>
          <span style={{ fontSize: 13, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 6 }}>
            Add products <ArrowLeft size={12} style={{ transform: 'rotate(180deg)' }} />
          </span>
        </button>
      </div>
    </div>
  );
}
