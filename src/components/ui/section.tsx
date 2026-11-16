import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type Surface = "light" | "subtle" | "dark";

// A page block that uses exactly one color context (see globals.css).
// Vertical rhythm: 96px desktop, 80px tablet, 64px mobile. A section with its
// own rhythm passes `spacing`, which replaces these classes: `cn` only joins
// class names, so padding classes in `className` would compete with the
// defaults instead of overriding them.
export function Section({
  surface = "light",
  spacing = "py-16 md:py-20 lg:py-24",
  className,
  ...props
}: ComponentProps<"section"> & { surface?: Surface; spacing?: string }) {
  return (
    <section
      data-surface={surface}
      className={cn(spacing, className)}
      {...props}
    />
  );
}
