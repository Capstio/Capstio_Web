import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { Container, DownloadButton, Section } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionaries";
import { fill, localizePath, type Locale } from "@/lib/i18n";
import { plans, trialDays } from "@/lib/pricing";
import { downloadHref } from "@/lib/site-nav";
import { HeroModes } from "./hero-modes";
import { HeroPoster } from "./hero-poster";

// Wraps each word of the headline in its own span, rendered by the server, so
// the page motion can bring the words in one by one without touching the text
// React hydrates.
function words(text: string) {
  return text.split(" ").map((word, index) => (
    <Fragment key={index}>
      {index > 0 && " "}
      <span data-word className="inline-block">
        {word}
      </span>
    </Fragment>
  ));
}

const headingId = "hero-heading";

// Values for the announcement copy, from the one place prices are set.
const announcementValues = { price: plans.personal.price, days: trialDays };

// Home hero (Figma "Hero / Desktop" and "Hero / Mobile"): headline, subtitle
// that follows the Apps / Docker / Terminal switch, download button and the
// product film, whose window floats on the open sea where the voyage's boat
// leaves its pier (hero-video.tsx). The announcement opens /pricing; the
// requirement line links to the installation guide on /download, while the
// button itself downloads the newest release. Colors follow the active theme. The
// section isolates the sea's layers and clips the full-bleed water with
// overflow: clip, not hidden, so it is not a scroll container and the content
// can stick to the viewport while the window shrinks and the sea rises
// ([data-hero-pin] and the spacer after it, globals.css). It ends where the
// sea fades out.
export function Hero({
  lang,
  dict,
  guide,
}: {
  lang: Locale;
  dict: Dictionary["home"]["hero"];
  // Label of the link to the installation guide.
  guide: string;
}) {
  return (
    <Section
      surface="light"
      aria-labelledby={headingId}
      data-hero-scroll
      spacing="pb-6"
      className="relative isolate overflow-clip"
    >
      <div
        aria-hidden="true"
        className="hero-dots pointer-events-none absolute inset-x-0 top-0 hidden h-130 md:block"
      />

      {/* The top padding lives in the pinned block so it sticks from the first
          pixel of scroll, right under the fixed header. */}
      <div data-hero-pin className="pt-16 md:pt-20 lg:pt-10">
        <Container className="relative flex flex-col items-center gap-8 md:gap-10 lg:gap-6">
          {/* Display size from Figma: 64/72 from tablet up, 40/48 on mobile; the
              longer Vietnamese headline uses 34/42 on mobile (the H1 size). Each
              Figma line is its own block and wraps, balanced, only when the
              screen is too narrow for it at full size. */}
          {/* One-line announcement (brief 8.4, block 1), written as a terminal
              command and its output: page motion types the command, then the
              answer appears ([data-pill]). It sits in the hero because the bar
              above the header was removed on purpose. Screen readers get the
              plain sentence. */}
          <Link
            href={localizePath(lang, "/pricing")}
            aria-label={fill(dict.announcement.label, announcementValues)}
            className="pill-shimmer group -mb-2 inline-flex max-w-full rounded-full p-px md:-mb-4 lg:-mb-2"
          >
            <span
              aria-hidden="true"
              data-pill
              className="inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-1.5 font-mono text-xs whitespace-nowrap text-body sm:text-[0.8125rem]"
            >
              <span className="text-tile-success">$</span>
              <span data-pill-command>{dict.announcement.command}</span>
              <span data-pill-output className="inline-flex items-center gap-2 text-strong">
                <span className="text-muted">→</span>
                {fill(dict.announcement.output, announcementValues)}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </span>
            </span>
          </Link>

          <h1
            id={headingId}
            data-split
            className={cn(
              "type-display text-center text-balance text-heading max-md:-mb-2",
              lang === "vi" && "max-md:type-h1",
            )}
          >
            <span className="md:block">{words(dict.title)}</span>{" "}
            <span className="block text-link">{words(dict.titleAccent)}</span>
          </h1>

          <HeroModes dict={dict} poster={<HeroPoster alt={dict.videoAlt} />}>
            {/* Side by side from 1024px, to keep the window and the boat above
                the fold. */}
            <div data-hero-fade className="flex w-full flex-col items-center gap-4 lg:flex-row lg:justify-center lg:gap-5">
              <DownloadButton
                href={downloadHref}
                size="lg"
                className="h-13 w-full md:w-60"
              >
                {dict.cta}
              </DownloadButton>
              <p className="type-caption text-center text-muted">
                {dict.requirement} ·{" "}
                <Link
                  href={localizePath(lang, "/download")}
                  className="whitespace-nowrap text-link underline-offset-4 hover:underline"
                >
                  {guide}
                </Link>
              </p>
            </div>
          </HeroModes>
        </Container>
      </div>
      {/* Scroll length of the pin, reserved by CSS before first paint. */}
      <div data-hero-pin-spacer aria-hidden="true" />
    </Section>
  );
}
