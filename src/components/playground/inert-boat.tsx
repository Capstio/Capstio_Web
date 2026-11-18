"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { VoyageBoat } from "@/components/home/voyage-boat";
import { cn } from "@/lib/cn";

// Where the boat pops up: next to the control that was clicked, in px from the
// playground's top left. `below` puts it under the control (for the upper
// part of the window), otherwise above it; `width` is the bubble's width and
// `tail` is where its tail points, measured from its left edge.
export type InertSpot = {
  left: number;
  top: number;
  width: number;
  below: boolean;
  tail: number;
  // Centred across the playground instead of placed by `left`.
  centered?: boolean;
};

export const bubbleWidth = 272;

// The voyage boat sails up beside a part of the app this demo does not
// simulate and says so in a speech bubble, with a way to get the real app.
// Drawn at the site's size, outside the scaled window, so it reads at every
// width and is never clipped by the window.
export function InertBoat({
  spot,
  text,
  cta,
  href,
  onClose,
  spin = false,
}: {
  spot: InertSpot;
  text: string;
  spin?: boolean;
  cta: string;
  href: string;
  onClose: () => void;
}) {
  const tail = (
    <span
      aria-hidden="true"
      className={cn(
        "absolute size-3 -translate-x-1/2 rotate-45 bg-page",
        spot.below
          ? "-top-1.5 border-t border-l border-kicker/50"
          : "-bottom-1.5 border-r border-b border-kicker/50",
      )}
      style={{ left: spot.tail }}
    />
  );

  return (
    <div
      role="status"
      className="absolute z-40"
      style={{
        ...(spot.centered ? { left: "50%", transform: "translateX(-50%)" } : { left: spot.left }),
        ...(spot.below ? { top: spot.top } : { bottom: spot.top }),
      }}
    >
      <div style={{ width: spot.width }} className="boat-say relative rounded-xl border border-kicker/50 bg-page p-3 pr-8 text-sm leading-5 text-strong shadow-lg">
        {tail}
        {/* A small boat sails along the bubble's top edge, on the side away
            from the tail, its waterline on the border. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -top-5.5 block h-6.5 w-9",
            spin && "boat-spin",
            spot.tail > spot.width / 2 ? "left-4" : "right-9",
          )}
        >
          <span className="pg-boat-bob absolute inset-0">
            <VoyageBoat still className="inset-0 size-full" />
          </span>
        </span>
        <p className="font-medium">{text}</p>
        <Link
          href={href}
          className="mt-2 inline-flex rounded-md bg-action px-2.5 py-1 text-xs font-semibold text-on-action hover:bg-action-hover"
        >
          {cta}
        </Link>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-2 right-2 inline-flex size-5 items-center justify-center rounded-sm text-muted hover:text-heading"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
