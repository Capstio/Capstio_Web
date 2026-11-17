import type { CSSProperties, Ref } from "react";
import { cn } from "@/lib/cn";

// The drawing's box, in viewBox units.
export const boatWidth = 160;
export const boatHeight = 120;

// Where the boat's waterline sits in its drawing, as a share of its height.
// Page motion puts this line on the swell's surface and tilts the boat around
// it, and the static layouts place it there with a -80% translate.
export const boatWaterline = 0.8;

// The tip of the bow at deck level (viewBox units), where the harbor's rope
// is tied.
export const boatBow = { x: 151, y: 80 };

// The boat of the whole voyage: it leaves the pier in the hero and is hauled
// into the harbor by the capstan at the end. One drawing for both, so it is
// recognizably the same boat. It sails to the right: bow on the right, the
// pennant streaming aft and a faint wake behind the stern. Decorative only.
//
// Page motion drives every [data-boat] on screen (see page-motion.tsx): it
// clears the CSS translate and moves the boat with a transform from the box
// its position classes give it (left/top, resolved to px), so the classes
// must position it with left/right and top.
export function VoyageBoat({
  className,
  style,
  ref,
}: {
  className?: string;
  style?: CSSProperties;
  ref?: Ref<SVGSVGElement>;
}) {
  return (
    <svg
      ref={ref}
      data-boat
      aria-hidden="true"
      viewBox={`0 0 ${boatWidth} ${boatHeight}`}
      className={cn("pointer-events-none absolute overflow-visible", className)}
      style={{ transformOrigin: `50% ${boatWaterline * 100}%`, ...style }}
    >
      {/* Wake behind the stern, along the waterline (y = 96). */}
      <path
        d="M24 97 Q12 96 0 99 M28 101 Q14 101 4 104"
        className="fill-none stroke-kicker"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />
      {/* Pennant at the masthead, streaming aft. */}
      <path d="M84 5 L66 9 L84 13 Z" className="fill-kicker" />
      {/* Mast. */}
      <path d="M85 5 V79" className="stroke-heading" strokeWidth="2.4" strokeLinecap="round" />
      {/* Mainsail aft of the mast, jib forward of it. */}
      <path d="M82 15 L82 73 L36 73 Q52 46 82 15 Z" className="fill-heading" fillOpacity="0.92" />
      <path d="M88 19 Q116 46 136 73 L88 73 Z" className="fill-heading" fillOpacity="0.62" />
      {/* Boom under the mainsail. */}
      <path d="M34 74.5 H84" className="stroke-heading" strokeWidth="1.8" strokeLinecap="round" />
      {/* Deckhouse with two windows. */}
      <rect x="44" y="70" width="28" height="10" rx="2" className="fill-heading" />
      <rect x="49" y="73" width="6" height="4" rx="1" className="fill-page" />
      <rect x="60" y="73" width="6" height="4" rx="1" className="fill-page" />
      {/* Hull, its waterline at y = 96, with the blue stripe under the deck. */}
      <path d="M12 80 H154 L141 99 Q82 104 24 99 Z" className="fill-heading" />
      <path d="M12 80 H154 L151.3 84 H14.5 Z" className="fill-kicker" />
      <path d="M22 92 H143" className="stroke-kicker" strokeWidth="1.4" strokeOpacity="0.55" />
    </svg>
  );
}
