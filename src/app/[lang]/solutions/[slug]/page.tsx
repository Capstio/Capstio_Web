import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoon, comingSoonMetadata } from "@/components/page/coming-soon";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { lastSegment, solutionHref, solutionKeys, type SolutionKey } from "@/lib/site-nav";

// Only the solutions in the navigation exist; any other slug is a 404 (the
// lookup below; cacheComponents rules out dynamicParams).
export function generateStaticParams() {
  return solutionKeys.map((key) => ({ slug: lastSegment(solutionHref[key]) }));
}

function solutionFor(slug: string): SolutionKey | undefined {
  return solutionKeys.find((key) => lastSegment(solutionHref[key]) === slug);
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/solutions/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const key = solutionFor(slug);
  if (!hasLocale(lang) || !key) return {};
  const { solutions } = await getDictionary(lang);
  return comingSoonMetadata(lang, solutionHref[key], solutions[key].title);
}

export default async function SolutionPage({ params }: PageProps<"/[lang]/solutions/[slug]">) {
  const { lang, slug } = await params;
  const key = solutionFor(slug);
  if (!hasLocale(lang) || !key) notFound();
  const { solutions } = await getDictionary(lang);
  return <ComingSoon lang={lang} path={solutionHref[key]} title={solutions[key].title} />;
}
