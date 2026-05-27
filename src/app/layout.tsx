import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
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
  icons: {
    icon: [
      { url: "/brand/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    (() => {
      const storageKey = "ydl-theme";
      const root = document.documentElement;
      const preference = localStorage.getItem(storageKey) || "system";
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolved = preference === "system" ? (systemDark ? "dark" : "light") : preference;
      root.dataset.theme = resolved;
      root.dataset.themePreference = preference;
    })();
  `;

  return (
    <html
      lang="fr"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script id="theme-preference" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
          <ToastProvider />
        </QueryProvider>
      </body>
    </html>
  );
}
