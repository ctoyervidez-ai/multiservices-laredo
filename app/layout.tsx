import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.ethrovsdraft.com'),
  title: 'Multiservices Laredo | Staffing y soluciones operativas',
  description: 'Staffing bilingüe, reclutamiento, cuadrillas temporales y soluciones operativas para empresas y candidatos en Laredo, Texas.',
  keywords: ['staffing Laredo', 'empleos Laredo TX', 'reclutamiento bilingüe', 'warehouse staffing', 'temp to hire', 'soluciones operativas'],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Multiservices Laredo | La gente correcta, en el momento correcto',
    description: 'Staffing bilingüe y soluciones operativas desde Laredo, Texas.',
    type: 'website',
    locale: 'es_US',
    url: '/',
    siteName: 'Multiservices Laredo',
    images: [{ url: '/og.png', width: 1729, height: 910, alt: 'Multiservices Laredo - Talento que mueve operaciones.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Multiservices Laredo | Staffing bilingüe',
    description: 'Talento y soluciones operativas para Laredo, Texas.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
