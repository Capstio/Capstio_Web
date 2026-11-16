import type { Metadata } from "next";
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

// Structured data of the home page: the organization, the website and the
// app itself, linked by @id. Offers mirror the visible pricing section and
// carry the visible plan descriptions.
export function homeJsonLd(
  lang: Locale,
  description: string,
  imageAlt: string,
  planDescriptions: Record<PlanId, string>,
) {
  const pageUrl = siteUrl + localizePath(lang, "/");
  const organizationId = `${siteUrl}/#organization`;
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
      {
        "@type": "SoftwareApplication",
        "@id": `${siteUrl}/#app`,
        name: siteName,
        description,
        url: pageUrl,
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
          url: `${pageUrl}#pricing`,
        })),
      },
    ],
  };
}
