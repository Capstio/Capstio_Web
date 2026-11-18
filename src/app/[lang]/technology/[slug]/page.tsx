import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoon, comingSoonMetadata } from "@/components/page/coming-soon";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { lastSegment, technologyHref, technologyKeys, type TechnologyKey } from "@/lib/site-nav";

// Only the technology pages in the footer exist; any other slug is a 404 (the
// lookup below; cacheComponents rules out dynamicParams).
export function generateStaticParams() {
  return technologyKeys.map((key) => ({ slug: lastSegment(technologyHref[key]) }));
}

function technologyFor(slug: string): TechnologyKey | undefined {
  return technologyKeys.find((key) => lastSegment(technologyHref[key]) === slug);
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/technology/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const key = technologyFor(slug);
  if (!hasLocale(lang) || !key) return {};
  const { footer } = await getDictionary(lang);
  return comingSoonMetadata(lang, technologyHref[key], footer.links[key]);
}

export default async function TechnologyPage({
  params,
}: PageProps<"/[lang]/technology/[slug]">) {
  const { lang, slug } = await params;
  const key = technologyFor(slug);
  if (!hasLocale(lang) || !key) notFound();
  const { footer } = await getDictionary(lang);
  return <ComingSoon lang={lang} path={technologyHref[key]} title={footer.links[key]} />;
}
