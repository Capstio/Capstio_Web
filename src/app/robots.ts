import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

// Everything may be crawled. Pages that must stay out of search results (the
// design system) say so with their own noindex, which crawlers can only read
// when the page is not blocked here.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
