import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale, locales } from "@/lib/i18n";
import { ogLocales, siteName, siteUrl } from "@/lib/seo";
import { themeStorageKey } from "@/lib/theme";
import "../globals.css";

// Inter covers Latin, Vietnamese, Cyrillic and Greek; JetBrains Mono is for commands and paths.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "vietnamese", "cyrillic", "greek"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext", "vietnamese", "cyrillic", "greek"],
  weight: "400",
  display: "swap",
});

// Applies the saved theme (or the system one) before first paint to avoid a
// flash, and marks <html> with .motion when the visitor allows motion (see the
// page motion rules in globals.css).
const themeScript = `try{var e=document.documentElement;var t=localStorage.getItem(${JSON.stringify(themeStorageKey)});var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;e.classList.toggle("dark",d)}catch(x){}try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("motion")}catch(x){}`;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta, home } = await getDictionary(lang);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: meta.title, template: "%s · Capstio" },
    description: meta.description,
    applicationName: siteName,
    // Shared preview for links to any page; the image is the hero still of the app.
    openGraph: {
      type: "website",
      siteName,
      title: meta.title,
      description: meta.description,
      locale: ogLocales[lang],
      alternateLocale: locales.filter((l) => l !== lang).map((l) => ogLocales[l]),
      images: [
        {
          url: "/hero/poster-light.jpg",
          width: 2200,
          height: 1238,
          alt: home.hero.videoAlt,
        },
      ],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader lang={lang} dict={dict} />
        <main className="flex-1">{children}</main>
        <SiteFooter lang={lang} dict={dict} />
      </body>
    </html>
  );
}
