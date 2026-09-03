import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getPortalAccessState, getPortalIdentityFromCookie } from '@/lib/portal-auth';
import { getPortalContext, getPortalSnapshot } from '@/lib/site-repository';
import PortalAuthForm, { PortalLogoutButton } from './portal-auth-form';
import PortalClient from './portal-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Portal de propietarios | Multiservices Laredo',
  description: 'Administra vacantes, candidatos y contenido del sitio.',
  robots: { index: false, follow: false },
};

type AccessResult =
  | { mode: 'setup' | 'signin' | 'recovery' | 'error' }
  | { mode: 'denied'; email: string }
  | { mode: 'portal'; snapshot: Awaited<ReturnType<typeof getPortalSnapshot>> };

export default async function PortalPage({ searchParams }: { searchParams: Promise<{ reason?: string | string[] }> }) {
  const sessionExpired = (await searchParams).reason === 'session-expired';
  let result: AccessResult;
  try {
    const requestHeaders = await headers();
    const identity = await getPortalIdentityFromCookie(requestHeaders.get('cookie'), requestHeaders.get('host') || '');
    const context = await getPortalContext(identity);
    if (context?.authorized) result = { mode: 'portal', snapshot: await getPortalSnapshot(context) };
    else if (context) result = { mode: 'denied', email: context.user.email };
    else result = { mode: await getPortalAccessState() };
  } catch {
    result = { mode: 'error' };
  }

  if (result.mode === 'portal') return <PortalClient initialSnapshot={result.snapshot} />;
  return <PortalAccess result={result} sessionExpired={sessionExpired} />;
}

function PortalAccess({ result, sessionExpired }: { result: Exclude<AccessResult, { mode: 'portal' }>; sessionExpired: boolean }) {
  const content = result.mode === 'setup'
    ? {
        eyebrow: 'Activación segura',
        title: 'Crea la cuenta administradora.',
        text: 'Configura el acceso privado de la empresa con el código de activación entregado por Ethrov. El código funciona una sola vez.',
      }
    : result.mode === 'signin'
      ? {
          eyebrow: 'Portal privado',
          title: 'Todo lo importante, bajo tu control.',
          text: 'Inicia sesión con el correo y la contraseña que creó tu empresa para administrar vacantes, candidatos, fotografías e información principal.',
        }
      : result.mode === 'denied'
        ? {
            eyebrow: 'Acceso protegido',
            title: 'Esta cuenta no tiene acceso.',
            text: `La cuenta ${result.email} ya no está asignada a esta empresa. Cierra la sesión para usar otra cuenta.`,
          }
        : result.mode === 'recovery'
          ? {
              eyebrow: 'Recuperación segura',
              title: 'Protegimos el acceso de esta empresa.',
              text: 'La cuenta inicial ya fue activada o el código venció. Contacta a Ethrov para restablecer al administrador sin exponer la información del portal.',
            }
          : {
              eyebrow: 'Portal temporalmente no disponible',
              title: 'No pudimos abrir el panel.',
              text: 'La página pública sigue funcionando. Intenta entrar nuevamente en unos minutos.',
            };

  return <main className="portal-access-page">
    <div className="portal-access-brand">
      <img src="/logo-optimized.webp" alt="" />
      <span>MULTISERVICES<small>LAREDO</small></span>
    </div>
    <section>
      <p>{content.eyebrow}</p>
      <h1>{content.title}</h1>
      <span>{content.text}</span>
      {result.mode === 'signin' && sessionExpired && <p className="portal-auth-session-message" role="status">Tu sesión terminó por seguridad. Vuelve a iniciar sesión.</p>}
      {(result.mode === 'setup' || result.mode === 'signin') && <PortalAuthForm mode={result.mode} />}
      {result.mode === 'denied' && <PortalLogoutButton />}
      {(result.mode === 'recovery' || result.mode === 'error') && <Link href="/">Volver al sitio</Link>}
      <small>El acceso y cada modificación se verifican de forma segura.</small>
    </section>
  </main>;
}
