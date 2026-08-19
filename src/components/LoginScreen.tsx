import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../state/useAuth';

export function LoginScreen() {
  const { login, loginError } = useAuth();
  const [password, setPassword] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password) login.mutate(password);
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24 }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>Patrick Group</div>
      <div style={{ fontSize: 13, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)', marginBottom: 24 }}>
        Sign in to the operating system
      </div>
      <form onSubmit={onSubmit}>
        <div className="field" style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            className="input"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>
        {loginError && (
          <div style={{ fontSize: 12, color: 'var(--color-accent)', marginBottom: 12 }}>{loginError}</div>
        )}
        <button type="submit" className="btn btn-primary btn-block" style={{ justifyContent: 'center' }} disabled={login.isPending || !password}>
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
