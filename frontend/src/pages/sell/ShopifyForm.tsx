import { useState } from 'react';
import { ArrowLeft, Key, Link as LinkIcon } from 'lucide-react';

interface ShopifyFormProps {
  onConnect: (url: string) => void;
  onBack: () => void;
}

export function ShopifyForm({ onConnect, onBack }: ShopifyFormProps) {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const canConnect = !!url && !!key;

  return (
    <div style={{ maxWidth: 460 }}>
      <button className="navlink" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        <ArrowLeft size={13} />
        Back
      </button>
      <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>
        Connect your Shopify store
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        Enter your store details. We&rsquo;ll request read access to your product catalog.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
            <LinkIcon size={14} />
          </span>
          <input
            className="field"
            style={{ paddingLeft: 38 }}
            placeholder="yourstore.myshopify.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
            <Key size={14} />
          </span>
          <input
            className="field"
            style={{ paddingLeft: 38 }}
            placeholder="Admin API access token"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </div>
      </div>
      <button
        onClick={() => onConnect(url)}
        disabled={!canConnect}
        style={{
          width: '100%',
          padding: 13,
          borderRadius: 12,
          border: 'none',
          background: canConnect ? 'var(--gold-gradient)' : 'rgba(255,255,255,0.08)',
          color: canConnect ? '#000' : 'var(--text-dim)',
          fontFamily: 'Syne,sans-serif',
          fontWeight: 700,
          fontSize: 14,
          cursor: canConnect ? 'pointer' : 'not-allowed',
        }}
      >
        Connect store
      </button>
      <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 14, lineHeight: 1.5 }}>
        Find your access token under Shopify Admin &rarr; Settings &rarr; Apps and sales channels &rarr; Develop apps.
      </p>
    </div>
  );
}
