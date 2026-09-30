import { Link } from 'react-router-dom';
import type { Product } from '../types/merch';
import { formatPrice } from '../lib/format';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${encodeURIComponent(product.id)}`} className="pcard">
      <div style={{ aspectRatio: '4/5', position: 'relative' }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div className="img-placeholder">{product.title}</div>
        )}
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div
          style={{
            fontFamily: 'Syne,sans-serif',
            fontWeight: 700,
            fontSize: 15,
            marginBottom: 6,
          }}
        >
          {product.title}
        </div>
        <div style={{ fontSize: 14, color: 'var(--gold)', fontWeight: 600 }}>
          {formatPrice(product.price, product.currency)}
        </div>
        {!product.available && (
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>Sold out</div>
        )}
      </div>
    </Link>
  );
}
