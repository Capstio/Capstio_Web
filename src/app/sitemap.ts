import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { indexedPaths } from "@/lib/pages";
import { absoluteAlternates } from "@/lib/seo";

// One entry per indexed page (lib/pages) and language, each listing all its
// language versions. Coming-soon pages are left out until they have content.
export default function sitemap(): MetadataRoute.Sitemap {
  return indexedPaths.flatMap((path) => {
    const languages = absoluteAlternates(path);
    return locales.map((locale) => ({
      url: languages[locale],
      alternates: { languages },
    }));
  });
}
