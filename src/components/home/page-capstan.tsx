import { Anchor } from "lucide-react";
import { voyage } from "@/lib/voyage";

export type PageLeg = { id: string; label: string };

// The page's own capstan and the map of the voyage. While the visitor scrolls,
// the capstan at the right edge turns and winds its rope in, lifting the
// anchor past one knot per leg (the section in view is the lit knot; a knot
// links to its leg); a counter under the capstan reads "Leg 03 / 14". When the
// "The name" band arrives, the big scene takes over and this fades out.
// From 1280px the capstan sits in the margin beside the content, compact
// until 1440px where the margin is wide enough for the full size. Narrower
// screens get a thin progress rope across the top, with a tick per leg and a
// small anchor riding its tip. The drawing is
// decorative and shown only when motion is allowed; a visually hidden list of
// the legs gives the same links to assistive technology. Page motion places
// the knots and ticks and drives everything ([data-page-capstan]).
export function PageCapstan({
  legs,
  legWord,
  navLabel,
}: {
  legs: PageLeg[];
  // "Chặng" / "Leg".
  legWord: string;
  navLabel: string;
}) {
  const total = String(voyage.length).padStart(2, "0");
  // Before page motion measures the page, legs are spread evenly.
  const evenly = (index: number) => `${(index / Math.max(legs.length - 1, 1)) * 100}%`;
  const number = (index: number) => String(index + 1).padStart(2, "0");

  return (
    <>
      <nav aria-label={navLabel} className="sr-only">
        <ol>
          {legs.map((leg, index) => (
            <li key={leg.id}>
              <a href={`#${leg.id}`}>
                {legWord} {number(index)} · {leg.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div aria-hidden="true" data-page-capstan className="pointer-events-none">
        <div className="fixed inset-x-0 top-0 z-60 h-1.5 min-[1280px]:hidden">
          <div data-progress className="h-0.5 origin-left scale-x-0 bg-kicker" />
          {/* As wide as the screen and slid in from the left with the progress,
              so the anchor on its right end stays at the rope's tip. */}
          <div
            data-progress-anchor
            className="absolute inset-x-0 top-0"
            style={{ transform: "translateX(-100%)" }}
          >
            <Anchor className="absolute top-1 right-0 size-3 translate-x-1/2 text-kicker" strokeWidth={2.5} />
          </div>
          {legs.map((leg, index) => (
            <span
              key={leg.id}
              data-tick={leg.id}
              style={{ left: evenly(index) }}
              className="absolute top-0 h-1.5 w-px bg-kicker/50"
            />
          ))}
        </div>

        <div className="fixed top-24 right-1 bottom-12 z-30 hidden w-6 flex-col items-center min-[1280px]:flex min-[1440px]:right-5 min-[1440px]:w-10">
          <svg data-capstan-drum viewBox="0 0 40 40" className="size-6 shrink-0 text-kicker min-[1440px]:size-10">
            <circle cx="20" cy="20" r="11" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="20" cy="20" r="3.5" fill="currentColor" />
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <line
                key={angle}
                x1="20"
                y1="20"
                x2="20"
                y2="2"
                transform={`rotate(${angle} 20 20)`}
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ))}
          </svg>
          <p
            data-leg-counter
            className="mt-1 font-mono text-[0.625rem] leading-3 whitespace-nowrap text-soft opacity-0 transition-opacity duration-300"
          >
            <span data-leg-current>01</span>/{total}
          </p>

          <div className="relative w-full flex-1">
            <div data-rope className="mx-auto h-full w-0 origin-top border-l-2 border-dashed border-soft/50" />
            {/* Knots: the first leg sits at the bottom, where the anchor starts. */}
            {legs.map((leg, index) => (
              <a
                key={leg.id}
                href={`#${leg.id}`}
                tabIndex={-1}
                data-knot={leg.id}
                data-state="ahead"
                style={{ top: `calc(100% - ${evenly(index)})` }}
                className="group pointer-events-auto absolute left-1/2 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              >
                <span className="size-2 rounded-full border-2 border-kicker bg-page transition-[width,height,background-color] duration-300 group-hover:size-3 group-data-[state=current]:size-3 group-data-[state=current]:bg-kicker group-data-[state=passed]:bg-kicker/60" />
                <span className="absolute right-6 rounded-md border border-line bg-surface px-2 py-1 text-xs whitespace-nowrap text-body opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  {legWord} {number(index)} · {leg.label}
                </span>
              </a>
            ))}
            {/* As tall as the rope's reach, so page motion can lift it by a
                share of its own height: the anchor at its bottom then follows
                the rope's end at any window size. Wrapped also because an
                <svg> has its own y attribute, which page motion would animate
                instead of moving the icon. */}
            <div data-anchor className="absolute inset-0">
              <Anchor className="absolute bottom-0 left-1/2 size-4 -translate-x-1/2 translate-y-1/2 text-kicker min-[1440px]:size-5" strokeWidth={2} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
