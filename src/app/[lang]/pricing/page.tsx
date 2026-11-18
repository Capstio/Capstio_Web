import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList } from "@/components/home/faq";
import { Pricing } from "@/components/home/pricing";
import { withArrow } from "@/components/home/with-arrow";
import { PageSection } from "@/components/page/page-section";
import { PageShell } from "@/components/page/page-shell";
import { getDictionary, getPageCopy } from "@/lib/dictionaries";
import { hasLocale, localizePath } from "@/lib/i18n";
import { plans, trialDays } from "@/lib/pricing";
import { absoluteUrl, jsonLd, pageMetadata, softwareApplicationJsonLd } from "@/lib/seo";
import { allFeaturesHref } from "@/lib/site-nav";

const path = "/pricing";

// Prices and the trial length live in lib/pricing only; the copy refers to
// them as {personal}, {team} and {days}, so the text can never disagree with
// the plan cards or the structured data.
const priceValues: Record<string, string> = {
  personal: String(plans.personal.price),
  team: String(plans.team.price),
  days: String(trialDays),
};

function fill(text: string): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => priceValues[key] ?? match);
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/pricing">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const copy = await getPageCopy(lang, "pricing");
  return pageMetadata(lang, path, {
    title: copy.meta.title,
    description: fill(copy.meta.description),
  });
}

export default async function PricingPage({ params }: PageProps<"/[lang]/pricing">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [{ home, header }, copy] = await Promise.all([
    getDictionary(lang),
    getPageCopy(lang, "pricing"),
  ]);
  const questions = copy.questions.items.map((item) => ({
    question: fill(item.question),
    answer: fill(item.answer),
  }));
  // Everything in Personal is part of every plan (Team starts with it).
  const included = [fill(copy.includes.trial), ...home.pricing.plans.personal.features];

  return (
    <PageShell lang={lang} trail={[{ name: header.nav.pricing, path }]} title={copy.title} intro={fill(copy.intro)}>
      <Pricing dict={home.pricing} />

      <PageSection id="includes" title={copy.includes.title} intro={copy.includes.intro}>
        <ul className="grid gap-3 rounded-[20px] border border-bento-line bg-bento-card p-4.75 sm:grid-cols-2 lg:rounded-xl lg:p-6.75">
          {included.map((feature) => (
            <li key={feature} className="flex gap-3">
              <span
                aria-hidden="true"
                className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-tile-success/16 text-tile-success"
              >
                <Check className="size-3" strokeWidth={2.2} />
              </span>
              <span className="text-[0.9375rem] leading-5 text-strong">{feature}</span>
            </li>
          ))}
        </ul>
        <Link
          href={localizePath(lang, allFeaturesHref)}
          className="w-fit text-sm font-medium text-kicker underline-offset-4 hover:underline"
        >
          {withArrow(copy.includes.allFeatures, "size-4")}
        </Link>
      </PageSection>

      <PageSection id="questions" title={copy.questions.title}>
        <FaqList items={questions} name="pricing-faq" className="max-w-200" />
      </PageSection>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@graph": [
              softwareApplicationJsonLd(lang, {
                description: fill(copy.meta.description),
                imageAlt: home.hero.videoAlt,
                planDescriptions: {
                  personal: home.pricing.plans.personal.description,
                  team: home.pricing.plans.team.description,
                },
                offersUrl: absoluteUrl(lang, path),
              }),
            ],
          }),
        }}
      />
    </PageShell>
  );
}
