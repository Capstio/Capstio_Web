import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Faq } from "@/components/home/faq";
import { FinalCta } from "@/components/home/final-cta";
import { PageCapstan } from "@/components/home/page-capstan";
import { Hero } from "@/components/home/hero";
import { ToolKeys } from "@/components/home/tool-keys";
import { Problem } from "@/components/home/problem";
import { Trust } from "@/components/home/trust";
import { PageMotion } from "@/components/motion/page-motion";
import { getDictionary, getPageCopy } from "@/lib/dictionaries";
import { hasLocale, localizePath } from "@/lib/i18n";
import { allFeaturesHref, featureHref, featureKeys } from "@/lib/site-nav";
import { legNumber, voyage, type LegId } from "@/lib/voyage";
import { absoluteUrl, homeJsonLd, jsonLd, pageAlternates } from "@/lib/seo";

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
  const [{ meta, home, voyage: voyageCopy, palette, features }, links] = await Promise.all([
    getDictionary(lang),
    getPageCopy(lang, "home-links"),
  ]);
  // "Chặng 03" / "Leg 03" for a section's overline (lib/voyage).
  const leg = (id: LegId) => `${voyageCopy.leg} ${legNumber(id)}`;

  return (
    <>
      {/* The home page explains Capstio in a few screens; pricing, getting
          started, release notes, the comparison and the security details
          live on their own pages, linked from the sections below. */}
      <Hero
        lang={lang}
        dict={home.hero}
        playground={{ ...home.playground, config: home.safeConfig }}
        guide={links.hero.guide}
      />
      <Problem lang={lang} leg={leg("problem")} dict={home.problem} />
      <ToolKeys
        leg={leg("features")}
        tools={featureKeys.map((key) => ({
          key,
          title: features[key].title,
          description: features[key].description,
          href: localizePath(lang, featureHref[key]),
          sample: links.keys.items[key],
        }))}
        labels={{
          ...links.keys,
          overline: home.bento.overline,
          title: home.bento.title,
          risk: {
            safe: home.danger.levels.safe.label,
            confirm: home.danger.levels.confirm.label,
            dangerous: home.danger.levels.dangerous.label,
          },
        }}
        native={[...home.native.items.map((item) => item.title), home.native.requirement]}
        allHref={localizePath(lang, allFeaturesHref)}
      />
      <Trust
        lang={lang}
        leg={leg("trust")}
        dict={home.trust}
        links={links.trust}
        securityLabel={home.privacy.footnote.link}
      />
      <Faq lang={lang} leg={leg("faq")} dict={home.faq} allLabel={links.faq.all} />
      <FinalCta lang={lang} dict={home.cta} hero={home.hero} capstan={home.capstan} />
      <PageCapstan
        legs={voyage.map((stop) => ({ id: stop.id, label: palette.sections[stop.key] }))}
        legWord={voyageCopy.leg}
        navLabel={voyageCopy.nav}
      />
      {/* Last on purpose: its effect runs once the page above has hydrated. */}
      <PageMotion />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            homeJsonLd(
              lang,
              meta.description,
              home.hero.videoAlt,
              {
                personal: home.pricing.plans.personal.description,
                team: home.pricing.plans.team.description,
              },
              // The plans are shown on /pricing, not on the home page.
              absoluteUrl(lang, "/pricing"),
            ),
          ),
        }}
      />
    </>
  );
}
