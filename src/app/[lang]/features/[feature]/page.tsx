import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeaturePage, featureKeyFromSlug, featureMetadata, featureSlug } from "@/components/page/feature-page";
import { hasLocale } from "@/lib/i18n";
import { featureKeys } from "@/lib/site-nav";

// One page per feature in the navigation; any other slug is a 404 through the
// lookup below (cacheComponents rules out the dynamicParams export).
export function generateStaticParams() {
  return featureKeys.map((key) => ({ feature: featureSlug(key) }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/features/[feature]">): Promise<Metadata> {
  const { lang, feature } = await params;
  const key = featureKeyFromSlug(feature);
  if (!hasLocale(lang) || !key) return {};
  return featureMetadata(lang, key);
}

export default async function FeatureRoute({ params }: PageProps<"/[lang]/features/[feature]">) {
  const { lang, feature } = await params;
  const key = featureKeyFromSlug(feature);
  if (!hasLocale(lang) || !key) notFound();
  return <FeaturePage lang={lang} featureKey={key} />;
}
