import type { Metadata } from "next";
import { getDictionary } from "./dictionaries";
import { defaultLocale, localizePath, locales, type Locale } from "./i18n";
import { currency, planIds, plans, type PlanId } from "./pricing";
import { downloadHref } from "./site-nav";

// Plan names as search engines see them (the same in every language).
const planNames: Record<PlanId, string> = { personal: "Personal", team: "Team" };

export const siteUrl = "https://capstio.app";
export const siteName = "Capstio";

// Open Graph locale of each language.
export const ogLocales: Record<Locale, string> = { vi: "vi_VN", en: "en_US" };

// Canonical URL and two-way hreflang links of one page (path without a
// language prefix). x-default points to the default language.
export function pageAlternates(
  lang: Locale,
  path: string,
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const locale of locales) languages[locale] = localizePath(locale, path);
  languages["x-default"] = localizePath(defaultLocale, path);
  return { canonical: localizePath(lang, path), languages };
}

// Absolute URL of one page in one language.
export function absoluteUrl(lang: Locale, path: string): string {
  return siteUrl + localizePath(lang, path);
}

// Absolute URLs of one page in every language, for the sitemap.
export function absoluteAlternates(path: string): Record<Locale, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, siteUrl + localizePath(locale, path)]),
  ) as Record<Locale, string>;
}

// Serializes JSON-LD for a <script> tag. `<` is escaped so a value can never
// close the tag.
export function jsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// Metadata of one sub-page: its own title and description, canonical and
// hreflang (pageAlternates), and the shared preview image with this page's
// title. Open Graph and Twitter are restated in full because a page's
// openGraph replaces the layout's instead of merging with it. `noindex`
// keeps a page out of search results (coming-soon pages); crawlers may still
// follow its links.
export async function pageMetadata(
  lang: Locale,
  path: string,
  { title, description, noindex = false }: { title: string; description: string; noindex?: boolean },
): Promise<Metadata> {
  const { home } = await getDictionary(lang);
  const fullTitle = `${title} · ${siteName}`;
  const images = [
    { url: "/hero/poster-light.jpg", width: 2200, height: 1238, alt: home.hero.videoAlt },
  ];
  return {
    title,
    description,
    alternates: pageAlternates(lang, path),
    openGraph: {
      type: "website",
      siteName,
      title: fullTitle,
      description,
      url: localizePath(lang, path),
      locale: ogLocales[lang],
      alternateLocale: locales.filter((l) => l !== lang).map((l) => ogLocales[l]),
      images,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images },
    ...(noindex && { robots: { index: false } }),
  };
}

// One step of a breadcrumb: its visible name and its path without a language
// prefix.
export type Crumb = { name: string; path: string };

// BreadcrumbList structured data of a page, from the home page to the page
// itself, matching the visible breadcrumb.
export function breadcrumbJsonLd(lang: Locale, trail: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(lang, crumb.path),
    })),
  };
}

// FAQPage structured data built from the visible questions, so the two
// cannot drift.
export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

const organizationId = `${siteUrl}/#organization`;

// The app as a SoftwareApplication node (no @context: it is meant for a
// @graph, see homeJsonLd). Offers mirror the visible pricing (lib/pricing)
// and carry the visible plan descriptions; `offersUrl` is the absolute URL
// of the page that shows them (by default the home page's #pricing).
export function softwareApplicationJsonLd(
  lang: Locale,
  {
    description,
    imageAlt,
    planDescriptions,
    offersUrl = `${absoluteUrl(lang, "/")}#pricing`,
  }: {
    description: string;
    imageAlt: string;
    planDescriptions: Record<PlanId, string>;
    offersUrl?: string;
  },
) {
  return {
    "@type": "SoftwareApplication",
    "@id": `${siteUrl}/#app`,
    name: siteName,
    description,
    url: absoluteUrl(lang, "/"),
    applicationCategory: "DeveloperApplication",
    operatingSystem: "macOS 15 or later",
    softwareVersion: "0.1.0",
    downloadUrl: downloadHref,
    image: {
      "@type": "ImageObject",
      url: `${siteUrl}/hero/poster-light.jpg`,
      caption: imageAlt,
    },
    inLanguage: [...locales],
    publisher: { "@id": organizationId },
    offers: planIds.map((id) => ({
      "@type": "Offer",
      name: planNames[id],
      description: planDescriptions[id],
      price: String(plans[id].price),
      priceCurrency: currency,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: String(plans[id].price),
        priceCurrency: currency,
        billingDuration: plans[id].period,
      },
      url: offersUrl,
    })),
  };
}

// Structured data of the home page: the organization, the website and the
// app itself, linked by @id. `offersUrl` as in softwareApplicationJsonLd.
export function homeJsonLd(
  lang: Locale,
  description: string,
  imageAlt: string,
  planDescriptions: Record<PlanId, string>,
  offersUrl?: string,
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteName,
        url: siteUrl,
        logo: `${siteUrl}/apple-icon.png`,
        sameAs: ["https://github.com/Capstio"],
        parentOrganization: { "@type": "Organization", name: "Tekmium Solutions" },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteName,
        url: siteUrl,
        inLanguage: [...locales],
        publisher: { "@id": organizationId },
      },
      softwareApplicationJsonLd(lang, { description, imageAlt, planDescriptions, offersUrl }),
    ],
  };
}
