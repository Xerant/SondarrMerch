import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import merchService from '../../services/merchService';
import type { Product } from '../../types/merch';
import { ProductCard } from '../../components/ProductCard';

export function CollectionPage() {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const items = await merchService.getCollectionProducts(id);
        if (!cancelled) setProducts(items);
      } catch {
        if (!cancelled) setError('Could not load this collection right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div style={{ padding: '40px 48px' }}>
      <Link to="/collections" className="navlink" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, width: 'fit-content' }}>
        <ArrowLeft size={12} />
        All Collections
      </Link>

      {error && <div style={{ padding: '16px 0', color: 'var(--red)', fontSize: 13 }}>{error}</div>}
      {loading && <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-dim)' }}>Loading&hellip;</div>}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {products.length === 0 && (
            <div style={{ gridColumn: '1/-1', padding: '60px 0', textAlign: 'center', color: 'var(--text-dim)' }}>
              No products in this collection yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
