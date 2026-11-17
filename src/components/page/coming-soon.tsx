import type { Metadata } from "next";
import { withArrow } from "@/components/home/with-arrow";
import { ButtonLink, Container, Section } from "@/components/ui";
import { getPageCopy } from "@/lib/dictionaries";
import { localizePath, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { allFeaturesHref } from "@/lib/site-nav";
import { PageShell } from "./page-shell";

// Metadata of a coming-soon page: its nav label as the title, the shared
// "on its way" line as the description, and noindex, so search engines skip
// it until it has content (it is also left out of the sitemap, lib/pages).
export async function comingSoonMetadata(
  lang: Locale,
  path: string,
  title: string,
): Promise<Metadata> {
  const common = await getPageCopy(lang, "common");
  return pageMetadata(lang, path, { title, description: common.soon.body, noindex: true });
}

// A page linked from the navigation that is not written yet: breadcrumb, the
// nav label as its h1, one line saying it is on its way, and the ways on: the
// home page and all features. Pair it with comingSoonMetadata.
export async function ComingSoon({
  lang,
  path,
  title,
}: {
  lang: Locale;
  // The page's own path without a language prefix, for example /about.
  path: string;
  // The page's label in the header or footer.
  title: string;
}) {
  const common = await getPageCopy(lang, "common");

  return (
    <PageShell lang={lang} trail={[{ name: title, path }]} title={title} intro={common.soon.body}>
      <Section surface="light" spacing="pb-6 lg:pb-10">
        <Container className="flex flex-wrap items-center gap-3">
          <ButtonLink href={localizePath(lang, "/")} variant="secondary">
            {common.soon.home}
          </ButtonLink>
          <ButtonLink href={localizePath(lang, allFeaturesHref)} variant="link">
            <span>{withArrow(common.soon.features, "size-4")}</span>
          </ButtonLink>
        </Container>
      </Section>
    </PageShell>
  );
}
