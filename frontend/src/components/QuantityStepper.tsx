import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  size?: 'sm' | 'md';
}

export function QuantityStepper({ value, onChange, size = 'md' }: QuantityStepperProps) {
  const dims = size === 'sm' ? { w: 26, h: 28, icon: 11, text: 12, textW: 24 } : { w: 36, h: 40, icon: 14, text: 14, textW: 36 };
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid var(--border-strong)',
        borderRadius: size === 'sm' ? 8 : 10,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        style={{
          width: dims.w,
          height: dims.h,
          background: 'none',
          border: 'none',
          color: 'var(--text)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Decrease quantity"
      >
        <Minus size={dims.icon} />
      </button>
      <span style={{ width: dims.textW, textAlign: 'center', fontSize: dims.text }}>{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        style={{
          width: dims.w,
          height: dims.h,
          background: 'none',
          border: 'none',
          color: 'var(--text)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Increase quantity"
      >
        <Plus size={dims.icon} />
      </button>
    </div>
  );
}
