import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BentoGrid } from "@/components/home/bento-grid";
import { Faq } from "@/components/home/faq";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { Problem } from "@/components/home/problem";
import { Pricing } from "@/components/home/pricing";
import { PrivacyTrust } from "@/components/home/privacy-trust";
import { SafeConfig } from "@/components/home/safe-config";
import { UnifiedApps } from "@/components/home/unified-apps";
import { PageMotion } from "@/components/motion/page-motion";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { homeJsonLd, jsonLd, pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { alternates: pageAlternates(lang, "/") };
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { meta, home } = await getDictionary(lang);

  return (
    <>
      <Hero lang={lang} dict={home.hero} />
      <Problem lang={lang} dict={home.problem} />
      <UnifiedApps dict={home.unifiedApps} />
      <SafeConfig dict={home.safeConfig} />
      <BentoGrid lang={lang} dict={home.bento} />
      <PrivacyTrust lang={lang} dict={home.privacy} />
      <Pricing dict={home.pricing} />
      <Faq dict={home.faq} />
      <FinalCta lang={lang} dict={home.cta} hero={home.hero} />
      {/* Last on purpose: its effect runs once the page above has hydrated. */}
      <PageMotion />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            homeJsonLd(lang, meta.description, home.hero.videoAlt, {
              personal: home.pricing.plans.personal.description,
              team: home.pricing.plans.team.description,
            }),
          ),
        }}
      />
    </>
  );
}
