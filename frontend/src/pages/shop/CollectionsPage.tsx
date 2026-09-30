import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import merchService from '../../services/merchService';
import type { Collection } from '../../types/merch';

export function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await merchService.getCollections();
        if (!cancelled) setCollections(items);
      } catch {
        if (!cancelled) setError('Could not load collections right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ padding: '40px 48px' }}>
      <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 38, letterSpacing: '-0.02em', marginBottom: 8 }}>
        Collections
      </h1>
      <p style={{ fontSize: 15, fontWeight: 300, color: 'var(--text-muted)', marginBottom: 32 }}>
        Browse merch by collection.
      </p>

      {error && <div style={{ padding: '16px 0', color: 'var(--red)', fontSize: 13 }}>{error}</div>}
      {loading && <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-dim)' }}>Loading collections&hellip;</div>}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
          {collections.map((c) => (
            <Link key={c.id} to={`/collections/${encodeURIComponent(c.id)}`} className="pcard">
              <div style={{ aspectRatio: '16/9', position: 'relative' }}>
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div className="img-placeholder">{c.title}</div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(6,8,18,0.92), transparent 60%)',
                  }}
                />
                <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 18 }}>{c.title}</div>
                </div>
              </div>
            </Link>
          ))}
          {collections.length === 0 && (
            <div style={{ gridColumn: '1/-1', padding: '60px 0', textAlign: 'center', color: 'var(--text-dim)' }}>
              No collections yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
