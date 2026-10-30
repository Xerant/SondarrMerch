import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SONDARR_APP_URL = import.meta.env.VITE_SONDARR_APP_URL || 'http://localhost:5173';

export function LoginPage() {
  const { status, signIn, signInWithGoogle } = useAuth();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Same-site paths only, so ?returnTo can't bounce anyone to another origin.
  const requested = params.get('returnTo');
  const returnTo = requested?.startsWith('/') && !requested.startsWith('//') ? requested : '/';

  if (status === 'loading') {
    return <div style={{ padding: '60px 48px', textAlign: 'center', color: 'var(--text-dim)' }}>Loading&hellip;</div>;
  }
  if (status === 'authenticated') return <Navigate to={returnTo} replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '60px 48px', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: '32px 28px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 26 }}>Sign in to buy</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Use the same account you use on Sondarr.</p>

        <button
          type="button"
          onClick={() => signInWithGoogle(returnTo).catch((err: Error) => setError(err.message))}
          style={{
            marginTop: 28,
            width: '100%',
            padding: '12px 20px',
            borderRadius: 12,
            border: '1px solid var(--border-strong)',
            background: 'rgba(255,255,255,0.05)',
            color: 'var(--text)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <GoogleMark /> Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0', fontSize: 12, color: 'var(--text-dim)' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          or with email
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
          <input
            className="field"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="field"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div style={{ fontSize: 13, color: 'var(--red)' }}>{error}</div>}
          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 4,
              padding: '13px 20px',
              borderRadius: 12,
              border: 'none',
              background: 'var(--gold-gradient)',
              color: '#000',
              fontFamily: 'Syne,sans-serif',
              fontWeight: 700,
              fontSize: 14,
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {submitting ? 'Signing in…' : 'Sign in'} <ArrowRight size={14} />
          </button>
        </form>

        <p style={{ marginTop: 22, fontSize: 12, color: 'var(--text-dim)' }}>
          New to Sondarr? <a href={`${SONDARR_APP_URL}/login`}>Create your account</a> first.
        </p>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
