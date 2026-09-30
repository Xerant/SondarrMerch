import { Link } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/format';
import { QuantityStepper } from '../../components/QuantityStepper';

export function CartPage() {
  const { cart, loading, error, updateLine, removeLine, startCheckout } = useCart();

  if (loading) {
    return <div style={{ padding: '60px 48px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading your cart&hellip;</div>;
  }

  const lines = cart?.lines ?? [];

  if (lines.length === 0) {
    return (
      <div
        style={{
          padding: '40px 48px',
          textAlign: 'center',
          minHeight: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <ShoppingBag size={40} />
        <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 22 }}>Your cart is empty</div>
        {error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{error}</div>}
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
          Continue Shopping
        </Link>
      </div>
    );
  }

  const subtotal = cart?.subtotal ?? lines.reduce((s, l) => s + (l.unitPrice ?? 0) * l.quantity, 0);
  const currency = cart?.currency ?? lines[0]?.currency ?? undefined;

  return (
    <div style={{ padding: '40px 48px' }}>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 34, marginBottom: 32 }}>Your Cart</h1>

      {error && <div style={{ padding: '0 0 16px', color: 'var(--red)', fontSize: 13 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {lines.map((line) => (
            <div
              key={line.id}
              style={{
                display: 'flex',
                gap: 16,
                padding: 16,
                borderRadius: 16,
                border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <div style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                {line.imageUrl ? (
                  <img src={line.imageUrl} alt={line.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div className="img-placeholder" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15 }}>{line.title}</div>
                <div style={{ fontSize: 14, color: 'var(--gold)', fontWeight: 600, marginTop: 6 }}>
                  {formatPrice(line.unitPrice, line.currency)}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <button
                  onClick={() => removeLine(line.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                  aria-label="Remove item"
                >
                  <X size={14} />
                </button>
                <QuantityStepper value={line.quantity} onChange={(q) => updateLine(line.id, q)} size="sm" />
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            padding: '22px 24px',
            height: 'fit-content',
          }}
        >
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Order Summary</h3>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'Syne,sans-serif',
              fontWeight: 700,
              fontSize: 17,
              marginBottom: 20,
            }}
          >
            <span>Subtotal</span>
            <span>{formatPrice(subtotal, currency)}</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 16 }}>
            Shipping and tax are calculated at checkout.
          </p>
          <button
            onClick={startCheckout}
            style={{
              width: '100%',
              padding: '14px',
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
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
