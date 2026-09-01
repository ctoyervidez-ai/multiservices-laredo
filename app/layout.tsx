import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ethrovsdraft.com"),
  title: "Multiservices Laredo | Staffing & Recruitment",
  description:
    "Staffing, recruitment, online job applications and operational support for companies and candidates in Laredo, Texas.",
  openGraph: {
    title: "Multiservices Laredo | Staffing & Recruitment",
    description:
      "Bilingual staffing, recruiting and online job applications for companies and candidates in Laredo.",
    type: "website",
    locale: "es_US",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Multiservices Laredo | Staffing & Recruitment",
    description:
      "Bilingual staffing, recruiting and online job applications for companies and candidates in Laredo.",
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
