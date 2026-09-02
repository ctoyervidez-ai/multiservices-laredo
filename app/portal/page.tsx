import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from '@/app/chatgpt-auth';
import { getPortalContext, getPortalSnapshot } from '@/lib/site-repository';
import PortalClient from './portal-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Portal de propietarios | Multiservices Laredo',
  description: 'Administra vacantes, candidatos y contenido del sitio.',
  robots: { index: false, follow: false },
};

export default async function PortalPage() {
  let result: { mode: 'signin' | 'denied' | 'error'; email?: string } | { mode: 'portal'; snapshot: Awaited<ReturnType<typeof getPortalSnapshot>> };
  try {
    const requestHeaders = await headers();
    const context = await getPortalContext(await getChatGPTUser(), requestHeaders.get('host') || '');
    if (!context) result = { mode: 'signin' };
    else if (!context.authorized) result = { mode: 'denied', email: context.user.email };
    else result = { mode: 'portal', snapshot: await getPortalSnapshot(context) };
  } catch {
    result = { mode: 'error' };
  }
  if (result.mode === 'portal') return <PortalClient initialSnapshot={result.snapshot} signOutPath={chatGPTSignOutPath('/')} />;
  return <PortalAccess mode={result.mode} email={result.email} />;
}

function PortalAccess({ mode, email }: { mode: 'signin' | 'denied' | 'error'; email?: string }) {
  const content = mode === 'signin'
    ? { eyebrow: 'Portal privado', title: 'Administra tu página sin tocar código.', text: 'Inicia sesión para publicar vacantes, revisar candidatos y actualizar fotografías o información principal.' }
    : mode === 'denied'
      ? { eyebrow: 'Acceso protegido', title: 'Esta cuenta todavía no tiene permiso.', text: `La cuenta ${email || ''} inició sesión correctamente, pero no está asignada a esta empresa.` }
      : { eyebrow: 'Portal temporalmente no disponible', title: 'No pudimos abrir el panel.', text: 'La información pública sigue funcionando. Intenta entrar nuevamente en unos minutos.' };
  return <main className="portal-access-page"><div className="portal-access-brand"><img src="/logo-optimized.webp" alt="" /><span>MULTISERVICES<small>LAREDO</small></span></div><section><p>{content.eyebrow}</p><h1>{content.title}</h1><span>{content.text}</span>{mode === 'signin' ? <a href={chatGPTSignInPath('/portal')} target="_top">Iniciar sesión con ChatGPT</a> : <Link href="/">Volver al sitio</Link>}<small>El acceso y cada modificación se verifican de forma segura.</small></section></main>;
}
