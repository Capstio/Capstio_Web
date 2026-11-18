import { Anchor } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// The overline of a home section, marked as a leg of the voyage:
// "⚓ LEG 03 · SAFE CONFIG". Without `leg` (the harbor at the end) only the
// anchor and the text show. One style for every section's overline.
export function LegMark({
  leg,
  children,
  className,
}: {
  // "Chặng 03" / "Leg 03", built by the page from lib/voyage.
  leg?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 text-[0.8125rem] leading-4 font-semibold text-kicker uppercase",
        className,
      )}
    >
      <Anchor aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2.2} />
      {leg && (
        <>
          <span className="font-mono tracking-normal">{leg}</span>
          <span aria-hidden="true" className="opacity-50">
            ·
          </span>
        </>
      )}
      <span>{children}</span>
    </p>
  );
}
