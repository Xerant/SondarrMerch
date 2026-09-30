import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import merchService from '../../services/merchService';
import type { Product } from '../../types/merch';
import { ProductCard } from '../../components/ProductCard';

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await merchService.getProducts(search || undefined);
        if (!cancelled) setProducts(items);
      } catch {
        if (!cancelled) setError('Could not load products right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [search]);

  return (
    <div style={{ padding: '40px 48px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 38, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Shop
        </h1>
        <p style={{ fontSize: 15, fontWeight: 300, color: 'var(--text-muted)' }}>
          Official merch from Sondarr artists.
        </p>
      </div>

      <div style={{ position: 'relative', maxWidth: 360, marginBottom: 32 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', display: 'flex' }}>
          <Search size={14} />
        </span>
        <input
          className="field"
          style={{ paddingLeft: 38 }}
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div style={{ padding: '16px 0', color: 'var(--red)', fontSize: 13 }}>{error}</div>}

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-dim)' }}>Loading products&hellip;</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-dim)' }}>
          No products match this search.
        </div>
      )}
    </div>
  );
}
