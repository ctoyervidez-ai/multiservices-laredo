import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ethrovsdraft.com"),
  title: "Multiservices Laredo | Más que empleos",
  description:
    "Staffing bilingüe, reclutamiento, transporte y soporte operativo para empresas y candidatos en Laredo, Texas.",
  openGraph: {
    title: "Multiservices Laredo | Más que empleos",
    description:
      "Creamos oportunidades y conectamos operaciones con talento preparado en Laredo, Texas.",
    type: "website",
    locale: "es_US",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Multiservices Laredo | Más que empleos",
    description:
      "Staffing bilingüe, reclutamiento, transporte y soporte operativo en Laredo.",
  },
  icons: {
    icon: "/images/multiservices-logo.png",
    shortcut: "/images/multiservices-logo.png",
    apple: "/images/multiservices-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
