import { h } from 'preact';
import { useState } from 'preact/hooks';
import { LockIcon } from './Icons';

interface PasswordGateProps {
  onSubmit: (password: string) => Promise<boolean>;
}

export function PasswordGate({ onSubmit }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!password.trim() || submitting) return;

    setSubmitting(true);
    setError(false);

    const ok = await onSubmit(password);
    if (!ok) {
      setError(true);
      setSubmitting(false);
    }
  };

  return (
    <div class="password-card">
      <div class="lock-icon-badge">
        <LockIcon size={32} />
      </div>

      <div class="password-card-title">Password Protected</div>
      <div class="password-card-sub">
        This computer requires a password to browse and download shared files.
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '320px', marginTop: '1rem' }}>
        <input
          type="password"
          class="password-input"
          placeholder="Enter access passcode..."
          value={password}
          onInput={(e) => {
            setPassword((e.target as HTMLInputElement).value);
            setError(false);
          }}
          autoFocus
        />

        {error && (
          <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>
            Incorrect password. Please try again.
          </div>
        )}

        <button
          type="submit"
          class="unlock-btn"
          disabled={!password.trim() || submitting}
        >
          {submitting ? 'Verifying...' : 'Unlock Files'}
        </button>
      </form>
    </div>
  );
}
