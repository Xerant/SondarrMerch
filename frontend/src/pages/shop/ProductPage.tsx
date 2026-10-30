import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import merchService from '../../services/merchService';
import type { Product } from '../../types/merch';
import { formatPrice } from '../../lib/format';
import { QuantityStepper } from '../../components/QuantityStepper';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addLine } = useCart();
  const { status: authStatus } = useAuth();
  const signedIn = authStatus === 'authenticated';

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addFailed, setAddFailed] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setAdded(false);
    (async () => {
      try {
        const p = await merchService.getProduct(id);
        if (cancelled) return;
        setProduct(p);
        setVariantId(p.variants.find((v) => v.available)?.id ?? p.variants[0]?.id ?? null);
      } catch {
        if (!cancelled) setError('Could not load this product right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <div style={{ padding: '60px 48px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading&hellip;</div>;
  }
  if (error || !product) {
    return (
      <div style={{ padding: '60px 48px', textAlign: 'center', color: 'var(--red)' }}>
        {error || 'Product not found.'}
      </div>
    );
  }

  const selectedVariant = product.variants.find((v) => v.id === variantId) ?? null;
  const price = selectedVariant?.price ?? product.price;
  const currency = selectedVariant?.currency ?? product.currency;
  const canAdd = !!variantId && (selectedVariant?.available ?? product.available);

  const handleAddToCart = async () => {
    if (!variantId) return;
    if (!signedIn) {
      // Browsing is public; buying needs a Sondarr account.
      navigate(`/login?returnTo=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setAdding(true);
    setAdded(false);
    setAddFailed(false);
    try {
      const ok = await addLine(variantId, qty);
      setAdded(ok);
      setAddFailed(!ok);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{ padding: '40px 48px' }}>
      <button
        className="navlink"
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}
      >
        <ArrowLeft size={12} />
        Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 48, marginBottom: 56 }}>
        <div style={{ aspectRatio: '1/1', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div className="img-placeholder">{product.title}</div>
          )}
        </div>
        <div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 32, marginBottom: 10, lineHeight: 1.1 }}>
            {product.title}
          </h1>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>
            {formatPrice(price, currency)}
          </div>
          {product.description && (
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              {product.description}
            </p>
          )}

          {product.variants.length > 1 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10 }}>Option</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    disabled={!v.available}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 10,
                      cursor: v.available ? 'pointer' : 'not-allowed',
                      fontSize: 13,
                      border: variantId === v.id ? '1.5px solid var(--border-gold-strong)' : '1.5px solid var(--border-strong)',
                      background: variantId === v.id ? 'rgba(212,146,14,0.15)' : 'rgba(255,255,255,0.03)',
                      color: v.available ? (variantId === v.id ? 'var(--gold)' : 'var(--text)') : 'var(--text-dim)',
                      opacity: v.available ? 1 : 0.5,
                    }}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <QuantityStepper value={qty} onChange={setQty} />
            <button
              onClick={handleAddToCart}
              disabled={!canAdd || adding}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: 12,
                border: 'none',
                background: canAdd ? 'var(--gold-gradient)' : 'rgba(255,255,255,0.08)',
                color: canAdd ? '#000' : 'var(--text-dim)',
                fontFamily: 'Syne,sans-serif',
                fontWeight: 700,
                fontSize: 14,
                cursor: canAdd && !adding ? 'pointer' : 'not-allowed',
              }}
            >
              {adding ? 'Adding…' : !canAdd ? 'Sold Out' : signedIn ? 'Add to Cart' : 'Sign in to Buy'}
            </button>
          </div>

          {addFailed && (
            <div style={{ fontSize: 13, color: 'var(--red)' }}>Could not add that item to your cart. Please try again.</div>
          )}

          {added && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: 'var(--green)',
              }}
            >
              <Check size={14} />
              Added to cart —{' '}
              <Link to="/cart" style={{ color: 'var(--green)', textDecoration: 'underline' }}>
                view cart
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
