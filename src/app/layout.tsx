import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { site } from "@/lib/portfolio";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} - Software Engineer fullstack SaaS`,
    template: `%s - ${site.name}`,
  },
  description:
    "Portfolio de Yao David Logan, Software Engineer fullstack spécialisé en plateformes SaaS, Node.js, Next.js, automatisation et architectures scalables.",
  keywords: [
    "Yao David Logan",
    "Software Engineer Togo",
    "Développeur Fullstack",
    "Next.js",
    "Node.js",
    "SaaS",
    "Architecture backend",
    "Automatisation",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: site.url,
    siteName: site.name,
    title: `${site.name} - Software Engineer fullstack SaaS`,
    description:
      "Plateformes SaaS rapides, sécurisées et prêtes à scaler: backend, produit web/mobile, automatisation et dashboards métier.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} - Software Engineer fullstack SaaS`,
    description:
      "Développement fullstack, architectures SaaS, automatisation et produits web/mobile orientés impact business.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: site.url,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
