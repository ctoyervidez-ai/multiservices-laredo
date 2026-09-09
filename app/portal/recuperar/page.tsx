import type { Metadata } from 'next';
import ResetForm from './reset-form';
export const metadata: Metadata = { title: 'Recuperar acceso | Multiservices Laredo', robots: { index: false, follow: false }, referrer: 'no-referrer' };
export default function ResetPage() { return <main className="portal-access-page"><section><p>Portal de empresa</p><h1>Recupera tu acceso.</h1><ResetForm /></section></main>; }
