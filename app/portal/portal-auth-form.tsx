'use client';

import { FormEvent, useState } from 'react';

type AuthMode = 'setup' | 'signin';

export default function PortalAuthForm({ mode }: { mode: AuthMode }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') ?? '');
    if (mode === 'setup' && Array.from(password).length < 15) {
      setError('Usa una contraseña de al menos 15 caracteres.');
      setBusy(false);
      return;
    }
    const payload = mode === 'setup'
      ? {
          displayName: form.get('displayName'),
          email: form.get('email'),
          password,
          confirmPassword: form.get('confirmPassword'),
          activationCode: form.get('activationCode'),
        }
      : { email: form.get('email'), password };

    try {
      const response = await fetch(`/api/portal/auth/${mode === 'setup' ? 'setup' : 'login'}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || 'No pudimos completar el acceso.');
      window.location.replace('/portal');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos completar el acceso.');
      setBusy(false);
    }
  }

  return <form className="portal-auth-form" onSubmit={submit}>
    {mode === 'setup' && <label className="portal-auth-field">
      <span>Nombre del administrador</span>
      <input name="displayName" autoComplete="name" minLength={2} maxLength={80} required placeholder="Nombre y apellido" />
    </label>}
    <label className="portal-auth-field">
      <span>Correo del administrador</span>
      <input name="email" type="email" inputMode="email" autoComplete="username" maxLength={254} required placeholder="nombre@empresa.com" />
    </label>
    <label className="portal-auth-field">
      <span>Contraseña</span>
      <input name="password" type="password" autoComplete={mode === 'setup' ? 'new-password' : 'current-password'} minLength={mode === 'setup' ? 15 : undefined} maxLength={128} required placeholder={mode === 'setup' ? 'Mínimo 15 caracteres' : 'Tu contraseña'} />
    </label>
    {mode === 'setup' && <>
      <label className="portal-auth-field">
        <span>Confirmar contraseña</span>
        <input name="confirmPassword" type="password" autoComplete="new-password" minLength={15} maxLength={128} required placeholder="Repite la contraseña" />
      </label>
      <label className="portal-auth-field">
        <span>Código de activación</span>
        <input name="activationCode" autoComplete="one-time-code" spellCheck={false} required placeholder="Código entregado por Ethrov" />
      </label>
      <p className="portal-auth-note">Guarda el correo y la contraseña en un lugar seguro. El código de activación quedará invalidado al crear la cuenta.</p>
    </>}
    {mode === 'signin' && <p className="portal-auth-help">Si olvidaste la contraseña, contacta a Ethrov para verificar la empresa y restablecer el acceso.</p>}
    {error && <p className="portal-auth-error" role="alert">{error}</p>}
    <button className="portal-auth-submit" type="submit" disabled={busy}>
      {busy ? 'Verificando…' : mode === 'setup' ? 'Crear administrador' : 'Entrar al portal'}
    </button>
  </form>;
}

export function PortalLogoutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function logout() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/portal/auth/logout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      });
      if (!response.ok) throw new Error('No pudimos cerrar la sesión. Inténtalo nuevamente.');
      window.location.replace('/portal');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos cerrar la sesión.');
      setBusy(false);
    }
  }
  return <div className="portal-logout-control">
    {error && <p className="portal-auth-error" role="alert">{error}</p>}
    <button className="portal-auth-submit standalone" type="button" disabled={busy} onClick={logout}>
      {busy ? 'Cerrando…' : 'Cerrar sesión'}
    </button>
  </div>;
}
