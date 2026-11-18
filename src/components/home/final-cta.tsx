import Link from "next/link";
import { Container, DownloadButton, Section } from "@/components/ui";
import type { Dictionary } from "@/lib/dictionaries";
import { localizePath, type Locale } from "@/lib/i18n";
import { downloadHref, topLinkHref } from "@/lib/site-nav";
import { LegMark } from "./leg-mark";
import { VoyageBoat } from "./voyage-boat";
import { SeaLayers } from "./wave-divider";
import { withArrow } from "./with-arrow";

type CtaDict = Dictionary["home"]["cta"];
type HeroDict = Dictionary["home"]["hero"];

const headingId = "final-cta-heading";
const storyId = "capstan-heading";

// The end of the voyage (#harbor): the harbor scene, the name story as its
// caption, then the closing call to action (Figma "Final CTA"). The headline
// and button repeat the hero on purpose, so they are read from the hero copy
// instead of being kept twice. Figma strokes take no space; the 1px border
// does, so the card paddings are 1px smaller than Figma (44/20, 72/48 from lg).
export function FinalCta({
  lang,
  dict,
  hero,
  capstan,
}: {
  lang: Locale;
  dict: CtaDict;
  hero: HeroDict;
  // The name story, told as the caption of the harbor scene.
  capstan: Dictionary["home"]["capstan"];
}) {
  return (
    <Section
      id="harbor"
      surface="light"
      aria-labelledby={headingId}
      spacing="pt-4 pb-10 lg:pt-8 lg:pb-16"
      className="relative isolate overflow-hidden"
    >
      <Harbor label={capstan.artLabel} />
      <Container className="flex flex-col gap-10 lg:gap-14">
        <div data-reveal className="mx-auto flex max-w-180 flex-col items-center gap-3 text-center">
          <LegMark>{capstan.overline}</LegMark>
          <h2 id={storyId} className="type-h2 text-balance text-strong">
            {capstan.title}
          </h2>
          <p className="text-base leading-7 text-soft">{capstan.body}</p>
        </div>

        <div
          data-reveal
          className="flex flex-col items-center gap-4 rounded-[20px] border border-cta-line bg-(image:--sp-cta-bg) px-4.75 py-10.75 text-center lg:gap-5 lg:rounded-[24px] lg:px-11.75 lg:py-17.75"
        >
          {/* Written in capitals in the copy: CSS uppercase would turn "macOS" into "MACOS". */}
          <LegMark className="normal-case!">{dict.overline}</LegMark>
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

// The harbor, full-bleed: open sea on the left, a pier with a large capstan
// on the right, and the voyage's boat tied to the capstan by a rope. Page
// motion ([data-voyage="harbor"]) turns the capstan with the scroll and hauls
// the boat from out at sea to the pier while it rides the swell; the rope is
// redrawn each frame from the capstan to the bow.
//
// Without motion the boat lies moored at the pier, level, and a short rope
// runs from the capstan to the bollard at the pier's end. The sea is laid
// from the right edge, so the moored spot is a flat part of the swell on
// every width: a trough 180px from the right below 1024px, a crest 360px
// from the right above (83.3% and 58.3% down the sea box).
function Harbor({ label }: { label: string }) {
  return (
    <div data-voyage="harbor" role="img" aria-label={label} className="relative mb-6 h-55 lg:mb-8 lg:h-90">
      <div data-sea className="absolute inset-x-0 bottom-0 h-[55%]">
        <SeaLayers part="back" anchor="right" />
        <SeaLayers part="front" anchor="right" className="z-20" />
        <VoyageBoat className="top-[83.33%] right-45 z-30 w-24 translate-x-1/2 -translate-y-[80%] lg:top-[58.33%] lg:right-90 lg:w-40" />
      </div>

      {/* Pier and capstan, drawn with the deck's top at y = 245 and the end
          of the deck (where the boat moors) at x = 0. The posts stand in the
          water, behind the near swell. */}
      <svg
        data-pier
        aria-hidden="true"
        viewBox="0 0 300 360"
        className="absolute right-0 bottom-0 z-10 w-36 overflow-visible lg:w-75"
        style={{ maskImage: "linear-gradient(to bottom, black 78%, transparent)" }}
      >
        <path
          d="M14 257 h10 v103 h-10 Z M104 257 h10 v103 h-10 Z M194 257 h10 v103 h-10 Z M272 257 h10 v103 h-10 Z"
          className="fill-heading"
          fillOpacity="0.5"
        />
        <rect x="0" y="245" width="320" height="12" rx="2" className="fill-heading" fillOpacity="0.85" />
        <rect x="4" y="231" width="13" height="14" rx="3" className="fill-heading" />
        {/* The capstan's barrel with the rope wound round it. */}
        <rect x="100" y="168" width="40" height="77" rx="6" className="fill-heading" />
        <path
          d="M100 186 L140 180 M100 196 L140 190 M100 206 L140 200 M100 216 L140 210"
          className="stroke-page"
          strokeWidth="2.5"
          strokeOpacity="0.5"
        />
        {/* The head seen from above, with its six bars: it turns. */}
        <g data-drum style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <path
              key={angle}
              d="M120 140 V58"
              transform={`rotate(${angle} 120 140)`}
              className="stroke-kicker"
              strokeWidth="7"
              strokeLinecap="round"
            />
          ))}
          <circle cx="120" cy="140" r="40" className="fill-page stroke-kicker" strokeWidth="6" />
          <circle cx="120" cy="140" r="12" className="fill-kicker" />
        </g>
        {/* Where the rope leaves the barrel, and the moored rope to the
            bollard (page motion replaces it with the live rope). */}
        <circle data-rope-from cx="100" cy="206" r="2" className="fill-heading" />
        <path
          data-rope-static
          d="M100 206 Q52 236 10 234"
          className="fill-none stroke-heading"
          strokeOpacity="0.75"
          strokeWidth="3"
          strokeDasharray="6 4"
        />
      </svg>

      {/* The live rope, in the scene's own pixels (drawn by page motion). */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 size-full overflow-visible">
        <line
          data-rope
          className="invisible stroke-heading"
          strokeOpacity="0.75"
          strokeWidth="2.5"
          strokeDasharray="6 4"
        />
      </svg>
    </div>
  );
}
