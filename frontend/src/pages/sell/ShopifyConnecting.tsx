import { Loader2 } from 'lucide-react';

export function ShopifyConnecting({ storeUrl }: { storeUrl: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '60px 0' }}>
      <div style={{ color: 'var(--gold)', animation: 'spin 0.8s linear infinite', display: 'flex' }}>
        <Loader2 size={28} />
      </div>
      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17 }}>Connecting to {storeUrl}&hellip;</div>
      <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Syncing product catalog</div>
    </div>
  );
}
