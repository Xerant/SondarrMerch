interface LogoProps {
  tag?: string;
}

export function Logo({ tag = 'MERCH' }: LogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: 'var(--gold-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 14, color: '#000' }}>S</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>
          sondarr
        </span>
        <span style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--gold)', fontWeight: 600 }}>{tag}</span>
      </div>
    </div>
  );
}
