import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeatureLinkCard, FeaturePoints, PlaygroundVisual } from "@/components/page/feature-page";
import { PageSection } from "@/components/page/page-section";
import { PageShell } from "@/components/page/page-shell";
import { getDictionary, getPageCopy } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { allFeaturesHref, featureKeys } from "@/lib/site-nav";

const path = allFeaturesHref;

export async function generateMetadata({ params }: PageProps<"/[lang]/features">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const copy = await getPageCopy(lang, "features");
  return pageMetadata(lang, path, copy.meta);
}

// The features overview: the All VPS view, every feature with a link to its
// page, and the principles every feature follows.
export default async function FeaturesPage({ params }: PageProps<"/[lang]/features">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [copy, { home, features }] = await Promise.all([
    getPageCopy(lang, "features"),
    getDictionary(lang),
  ]);
  const { overview } = copy;

  return (
    <PageShell lang={lang} trail={[{ name: copy.title, path }]} title={overview.title} intro={overview.intro}>
      <PageSection id="fleet" title={overview.fleet.title} intro={overview.fleet.intro}>
        <PlaygroundVisual home={home} screen="fleet" />
        <FeaturePoints points={overview.fleet.points} />
      </PageSection>

      <PageSection
        id="all-features"
        title={overview.all.title}
        intro={overview.all.intro}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        {featureKeys.map((key) => (
          <FeatureLinkCard key={key} lang={lang} featureKey={key} features={features} more={copy.labels.more} />
        ))}
      </PageSection>

      <PageSection id="principles" title={overview.principles.title} intro={overview.principles.intro}>
        <FeaturePoints points={overview.principles.points} />
      </PageSection>
    </PageShell>
  );
}
