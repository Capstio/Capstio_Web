import type { ReactNode } from "react";
import { VoyageBoat } from "./voyage-boat";
import { SeaLayers } from "./wave-divider";

// The product window (children) floating on the open sea under the hero,
// where the voyage's boat leaves its pier. The sea box follows the window in
// the flow, full-bleed, so the water reaches both edges of the screen and
// never crosses the window: its top is pulled up by the transparent band
// above the highest crest (the far swell's mean crest is 18/96 down the box
// and it bobs 7% of the box each way), so the water starts right at the
// window's bottom. Without motion the boat rests level by the pier; with
// motion it sails to the right edge while the hero scrolls away
// (page-motion.tsx).
export function HeroSea({ children }: { children: ReactNode }) {
  return (
    <div data-voyage="hero" className="relative w-full">
      <div className="relative z-10">{children}</div>
      <div
        data-sea
        className="relative left-[calc(50%-50vw)] -mt-[calc(var(--sea-h)*0.1175)] h-(--sea-h) w-screen [--sea-h:140px] sm:[--sea-h:180px] lg:[--sea-h:220px] lg:[@media(max-height:50rem)]:[--sea-h:170px]"
      >
        <SeaLayers part="back" />
        <HeroPier />
        <SeaLayers part="front" className="z-20" />
        {/* Without motion the boat rests level by the pier, in the front
            swell's trough 180px from the left edge (83.3% down the box). */}
        <VoyageBoat className="top-[83.33%] left-45 z-30 w-20 -translate-x-1/2 -translate-y-[80%] sm:w-28 lg:w-34" />
      </div>
    </div>
  );
}

// The small pier the boat leaves from, at the left edge of the hero's sea:
// a deck at half the sea box's height (above the swell's crests), its posts
// fading into the water, and a small capstan on it. Hidden on phones, where
// the boat has the whole width to sail.
function HeroPier() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 112 150"
      className="absolute top-[calc(50%-39px)] left-0 z-20 w-22 max-sm:hidden lg:top-[calc(50%-50px)] lg:w-28"
      style={{ maskImage: "linear-gradient(to bottom, black 55%, transparent)" }}
    >
      {/* Posts, then the deck (its top at y = 50) and a bollard at its end. */}
      <path d="M10 54 h6 v96 h-6 Z M50 54 h6 v96 h-6 Z M88 54 h6 v96 h-6 Z" className="fill-heading" fillOpacity="0.5" />
      <rect x="-4" y="46" width="108" height="8" rx="1.5" className="fill-heading" fillOpacity="0.85" />
      <rect x="92" y="38" width="8" height="8" rx="2" className="fill-heading" />
      {/* Capstan: drum, cap and one bar seen side on. */}
      <rect x="30" y="27" width="16" height="19" rx="3" className="fill-heading" />
      <ellipse cx="38" cy="27" rx="12" ry="4" className="fill-kicker" />
      <path d="M22 33 H54" className="stroke-heading" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
