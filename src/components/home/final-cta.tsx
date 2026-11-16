import Link from "next/link";
import { Container, DownloadButton, Section } from "@/components/ui";
import type { Dictionary } from "@/lib/dictionaries";
import { localizePath, type Locale } from "@/lib/i18n";
import { downloadHref, topLinkHref } from "@/lib/site-nav";
import { withArrow } from "./with-arrow";

type CtaDict = Dictionary["home"]["cta"];
type HeroDict = Dictionary["home"]["hero"];

const headingId = "final-cta-heading";

// Closing call to action of the home page (Figma "Final CTA"). The headline
// and button repeat the hero on purpose, so they are read from the hero copy
// instead of being kept twice. Figma strokes take no space; the 1px border
// does, so the card paddings are 1px smaller than Figma (44/20, 72/48 from lg).
export function FinalCta({
  lang,
  dict,
  hero,
}: {
  lang: Locale;
  dict: CtaDict;
  hero: HeroDict;
}) {
  return (
    <Section surface="light" aria-labelledby={headingId} spacing="py-10 lg:py-20">
      <Container>
        <div data-reveal className="flex flex-col items-center gap-4 rounded-[20px] border border-cta-line bg-(image:--sp-cta-bg) px-4.75 py-10.75 text-center lg:gap-5 lg:rounded-[24px] lg:px-11.75 lg:py-17.75">
          {/* Written in capitals in the copy: CSS uppercase would turn "macOS" into "MACOS". */}
          <p className="text-[0.8125rem] leading-4 font-semibold text-kicker">
            {dict.overline}
          </p>
          <h2
            id={headingId}
            className="text-[1.75rem] leading-[2.125rem] font-bold text-balance text-strong lg:text-[2.75rem] lg:leading-[3.25rem]"
          >
            <span className="md:block">{hero.title}</span> {hero.titleAccent}
          </h2>
          <p className="max-w-180 text-base leading-[1.1875rem] text-soft lg:text-[1.0625rem] lg:leading-[1.3125rem]">
            {dict.subtitle}
          </p>
          <DownloadButton href={downloadHref} size="lg" className="h-13 w-full md:w-57">
            {hero.cta}
          </DownloadButton>
          {/* Muted text is under 4.5:1 on the light card, so light uses soft. */}
          <p className="text-[0.8125rem] leading-4 text-soft dark:text-muted">
            {dict.requirement} ·{" "}
            <Link
              href={localizePath(lang, topLinkHref.releaseNotes)}
              className="whitespace-nowrap underline-offset-4 hover:text-strong hover:underline"
            >
              {withArrow(dict.releaseNotes)}
            </Link>
          </p>
        </div>
      </Container>
    </Section>
  );
}
