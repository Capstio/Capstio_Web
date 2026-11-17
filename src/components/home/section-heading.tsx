import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { LegMark } from "./leg-mark";

// Overline, title and subtitle that open a home section, centered from 1024px
// like the existing sections. The lines come in one after another
// (data-reveal, see page motion).
export function SectionHeading({
  id,
  leg,
  overline,
  title,
  subtitle,
  className,
}: {
  // Id of the h2, for the section's aria-labelledby.
  id: string;
  // Leg number text, see LegMark.
  leg: string;
  overline: string;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-reveal
      className={cn("flex flex-col gap-4 lg:items-center lg:text-center", className)}
    >
      <LegMark leg={leg}>{overline}</LegMark>
      <h2 id={id} className="type-h2 text-balance text-strong">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-180 text-base leading-6 text-soft">{subtitle}</p>
      )}
    </div>
  );
}
