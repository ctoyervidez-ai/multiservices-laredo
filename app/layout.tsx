import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Multiservices Laredo | Staffing & Recruitment',
  description: 'Soluciones de staffing, reclutamiento y talento para empresas y candidatos en Laredo, Texas.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
