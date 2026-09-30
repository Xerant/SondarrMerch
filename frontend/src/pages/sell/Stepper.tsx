import { Fragment } from 'react';
import type { WizardStep } from './types';

const STEPS = ['Method', 'Setup', 'Review'];

export function Stepper({ step }: { step: WizardStep }) {
  const idx = step === 'choose' ? 0 : step.includes('shopify') || step === 'manual-form' ? 1 : 2;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
      {STEPS.map((s, i) => (
        <Fragment key={s}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                background: i <= idx ? 'var(--gold-gradient)' : 'rgba(255,255,255,0.06)',
                color: i <= idx ? '#000' : 'var(--text-dim)',
              }}
            >
              {i + 1}
            </div>
            <span style={{ fontSize: 12, color: i <= idx ? 'var(--text)' : 'var(--text-dim)' }}>{s}</span>
          </div>
          {i < STEPS.length - 1 && <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.1)' }} />}
        </Fragment>
      ))}
    </div>
  );
}
