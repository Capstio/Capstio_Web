import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { absoluteAlternates } from "@/lib/seo";

// Public pages, by path without a language prefix. Add a page here once it
// has real content; pages still to be written are left out.
const pages = ["/"];

// One entry per page and language, each listing all its language versions.
export default function sitemap(): MetadataRoute.Sitemap {
  return pages.flatMap((path) => {
    const languages = absoluteAlternates(path);
    return locales.map((locale) => ({
      url: languages[locale],
      alternates: { languages },
    }));
  });
}
