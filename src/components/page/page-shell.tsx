import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { withArrow } from "@/components/home/with-arrow";
import { PageMotion } from "@/components/motion/page-motion";
import { Container, DownloadButton, Section } from "@/components/ui";
import { getDictionary, getPageCopy } from "@/lib/dictionaries";
import { localizePath, type Locale } from "@/lib/i18n";
import { breadcrumbJsonLd, jsonLd, type Crumb } from "@/lib/seo";
import { downloadHref, topLinkHref } from "@/lib/site-nav";

const ctaHeadingId = "page-cta-heading";

// The frame of every sub-page, inside the [lang] layout's header and footer:
// breadcrumb (Home › … › this page), the page's only h1 and its intro, the
// page content, then a closing download band that reuses the home call to
// action. Calm and document-like: no sea scene. It also writes the
// BreadcrumbList structured data from the same trail, so the visible
// breadcrumb and search engines always agree.
//
// `trail` runs from the first step after Home to this page; its last crumb
// is the current page (not a link). Every crumb needs a real path: leave out
// sections that have no page of their own.
//
// Children are page blocks that bring their own Section (PageSection, or a
// home section such as Pricing), so they get a color context.
export async function PageShell({
  lang,
  trail,
  title,
  intro,
  children,
}: {
  lang: Locale;
  trail: Crumb[];
  title: string;
  // Phrasing content only (text, links, code): it is rendered in a <p>.
  intro?: ReactNode;
  children?: ReactNode;
}) {
  const [{ home }, common] = await Promise.all([
    getDictionary(lang),
    getPageCopy(lang, "common"),
  ]);
  const crumbs: Crumb[] = [{ name: common.breadcrumb.home, path: "/" }, ...trail];

  return (
    <>
      <Section surface="light" spacing="pt-6 pb-6 lg:pt-10 lg:pb-10">
        <Container className="flex flex-col gap-6 lg:gap-8">
          <nav aria-label={common.breadcrumb.label}>
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-soft">
              {crumbs.map((crumb, index) => {
                const current = index === crumbs.length - 1;
                return (
                  <li key={crumb.path} className="inline-flex items-center gap-1.5">
                    {index > 0 && (
                      <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 opacity-60" />
                    )}
                    {current ? (
                      <span aria-current="page" className="font-medium text-strong">
                        {crumb.name}
                      </span>
                    ) : (
                      <Link
                        href={localizePath(lang, crumb.path)}
                        className="underline-offset-4 hover:text-strong hover:underline"
                      >
                        {crumb.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="flex max-w-200 flex-col gap-4">
            <h1 className="type-h1 text-balance text-strong">{title}</h1>
            {intro && <p className="text-lg leading-7 text-soft">{intro}</p>}
          </div>
        </Container>
      </Section>

      {children}

      <Section surface="light" aria-labelledby={ctaHeadingId} spacing="pt-6 pb-12 lg:pt-10 lg:pb-16">
        <Container>
          <div className="flex flex-col items-center gap-4 rounded-[20px] border border-cta-line bg-(image:--sp-cta-bg) px-4.75 py-10 text-center lg:gap-5 lg:rounded-[24px] lg:px-11.75 lg:py-14">
            <h2
              id={ctaHeadingId}
              className="text-[1.75rem] leading-[2.125rem] font-bold text-balance text-strong lg:text-[2.25rem] lg:leading-[2.75rem]"
            >
              <span className="md:block">{home.hero.title}</span> {home.hero.titleAccent}
            </h2>
            <p className="max-w-180 text-base leading-6 text-soft">{home.cta.subtitle}</p>
            <DownloadButton href={downloadHref} size="lg" className="h-13 w-full md:w-57">
              {home.hero.cta}
            </DownloadButton>
            {/* Muted text is under 4.5:1 on the light card, so light uses soft. */}
            <p className="text-[0.8125rem] leading-4 text-soft dark:text-muted">
              {home.cta.requirement} ·{" "}
              <Link
                href={localizePath(lang, topLinkHref.releaseNotes)}
                className="whitespace-nowrap underline-offset-4 hover:text-strong hover:underline"
              >
                {withArrow(home.cta.releaseNotes)}
              </Link>
            </p>
          </div>
        </Container>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd(lang, crumbs)) }}
      />
      {/* Last on purpose: reused home blocks are hidden by CSS until page
          motion reveals them, and its effect must run after the content above
          has hydrated. */}
      <PageMotion />
    </>
  );
}
