import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://multiservices-laredo.ethrovs.chatgpt.site'),
  title: 'Multiservices Laredo | Talento que mueve operaciones',
  description: 'Staffing bilingüe, reclutamiento y soluciones operativas para empresas y candidatos en Laredo, Texas.',
  openGraph: {
    title: 'Multiservices Laredo',
    description: 'Talento que mueve operaciones.',
    type: 'website',
    locale: 'es_US',
    images: [{ url: '/og.png', width: 1729, height: 910, alt: 'Multiservices Laredo - Talento que mueve operaciones.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Multiservices Laredo',
    description: 'Talento que mueve operaciones.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
