'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from '@/app/site-link';
export default function ResetForm() {
  const [token, setToken] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  useEffect(() => {
    // The reset fragment exists only in the browser and must not be server-rendered.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(new URLSearchParams(window.location.hash.slice(1)).get('token') || '');
    window.history.replaceState(null, '', window.location.pathname);
    setReady(true);
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/portal/auth/reset', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: token ? 'complete' : 'request', token, email: form.get('email'), password: form.get('password'), confirmPassword: form.get('confirmPassword') }) });
      const result = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error);
      setMessage(token ? 'Contraseña actualizada. Inicia sesión con tu nueva contraseña.' : result.message || 'Revisa tu correo.');
      if (token) { setToken(''); setComplete(true); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Inténtalo nuevamente.'); }
    finally { setBusy(false); }
  }
  return <><form className="portal-auth-form" onSubmit={submit}>{!complete && (token ? <><label className="portal-auth-field">Nueva contraseña<input name="password" type="password" autoComplete="new-password" required minLength={15} maxLength={128} /></label><label className="portal-auth-field">Repetir contraseña<input name="confirmPassword" type="password" autoComplete="new-password" required minLength={15} maxLength={128} /></label><p>Usa entre 15 y 128 caracteres.</p></> : <label className="portal-auth-field">Correo del administrador<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>)}{error && <p className="portal-auth-error" role="alert">{error}</p>}{message && <p role="status">{message}</p>}{!complete && <button className="portal-auth-submit" disabled={busy || !ready}>{busy ? 'Procesando…' : token ? 'Guardar contraseña' : 'Solicitar enlace'}</button>}</form><Link href="/portal">Volver al inicio de sesión</Link></>;
}
