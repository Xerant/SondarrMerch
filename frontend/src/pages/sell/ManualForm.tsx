import { useState } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { CATEGORIES } from './mockData';
import type { ManualProduct } from './types';

interface FormState {
  name: string;
  price: string;
  desc: string;
  cat: string;
  variants: string[];
  inv: string;
}

const BLANK: FormState = { name: '', price: '', desc: '', cat: 'Apparel', variants: [], inv: '' };

interface ManualFormProps {
  products: ManualProduct[];
  onAdd: (product: ManualProduct) => void;
  onFinish: () => void;
  onBack: () => void;
}

export function ManualForm({ products, onAdd, onFinish, onBack }: ManualFormProps) {
  const [f, setF] = useState<FormState>(BLANK);
  const [variantInput, setVariantInput] = useState('');
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setF((prev) => ({ ...prev, [key]: value }));

  const addVariant = () => {
    if (variantInput.trim()) {
      set('variants', [...f.variants, variantInput.trim()]);
      setVariantInput('');
    }
  };
  const removeVariant = (i: number) => set('variants', f.variants.filter((_, ix) => ix !== i));

  const canAdd = !!f.name && !!f.price;
  const add = () => {
    onAdd({
      id: 'm' + Date.now(),
      name: f.name,
      desc: f.desc,
      price: parseFloat(f.price) || 0,
      cat: f.cat,
      inv: parseInt(f.inv, 10) || 0,
      variants: f.variants,
    });
    setF(BLANK);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 36 }}>
      <div>
        <button className="navlink" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <ArrowLeft size={13} />
          Back
        </button>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 22, marginBottom: 20 }}>Add a product</h2>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 100, height: 100, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
            <div className="img-placeholder">Photo 1</div>
          </div>
          <div style={{ width: 100, height: 100, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
            <div className="img-placeholder">Photo 2</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input className="field" placeholder="Product name" value={f.name} onChange={(e) => set('name', e.target.value)} />
          <textarea
            className="field"
            placeholder="Description"
            rows={3}
            style={{ resize: 'vertical' }}
            value={f.desc}
            onChange={(e) => set('desc', e.target.value)}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input
              className="field"
              placeholder="Price (USD)"
              type="number"
              value={f.price}
              onChange={(e) => set('price', e.target.value)}
            />
            <select className="field" value={f.cat} onChange={(e) => set('cat', e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <input
            className="field"
            placeholder="Inventory count"
            type="number"
            value={f.inv}
            onChange={(e) => set('inv', e.target.value)}
          />
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>Variants (size, color, etc.)</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                className="field"
                placeholder="e.g. Large"
                value={variantInput}
                onChange={(e) => setVariantInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addVariant()}
              />
              <button
                onClick={addVariant}
                style={{
                  padding: '0 16px',
                  borderRadius: 10,
                  border: '1px solid var(--border-strong)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {f.variants.map((v, i) => (
                <span key={i} className="chip active" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {v}
                  <span onClick={() => removeVariant(i)} style={{ cursor: 'pointer', display: 'flex' }}>
                    <X size={10} />
                  </span>
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={add}
            disabled={!canAdd}
            style={{
              marginTop: 8,
              padding: 12,
              borderRadius: 12,
              background: canAdd ? 'rgba(212,146,14,0.15)' : 'rgba(255,255,255,0.05)',
              color: canAdd ? 'var(--gold)' : 'var(--text-dim)',
              fontFamily: 'Syne,sans-serif',
              fontWeight: 700,
              fontSize: 13,
              cursor: canAdd ? 'pointer' : 'not-allowed',
              border: '1px solid ' + (canAdd ? 'var(--border-gold-strong)' : 'var(--border)'),
            }}
          >
            + Add to catalog
          </button>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
          {products.length} product{products.length !== 1 ? 's' : ''} added
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {products.map((p) => (
            <div key={p.id} className="card" style={{ padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                <div className="img-placeholder" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontFamily: 'Syne,sans-serif',
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{p.cat}</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600 }}>${p.price.toFixed(2)}</div>
            </div>
          ))}
          {products.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Products you add will appear here.</div>
          )}
        </div>
        <button
          onClick={onFinish}
          disabled={products.length === 0}
          style={{
            width: '100%',
            padding: 13,
            borderRadius: 12,
            border: 'none',
            background: products.length ? 'var(--gold-gradient)' : 'rgba(255,255,255,0.08)',
            color: products.length ? '#000' : 'var(--text-dim)',
            fontFamily: 'Syne,sans-serif',
            fontWeight: 700,
            fontSize: 14,
            cursor: products.length ? 'pointer' : 'not-allowed',
          }}
        >
          Finish setup
        </button>
      </div>
    </div>
  );
}
