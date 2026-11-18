import { Box, FileText, TriangleAlert, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Container, Section } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionaries";
import { localizePath, type Locale } from "@/lib/i18n";
import { topLinkHref } from "@/lib/site-nav";
import { withCode } from "./inline-code";
import { LegMark } from "./leg-mark";
import { withArrow } from "./with-arrow";

type ProblemDict = Dictionary["home"]["problem"];

const headingId = "problem-heading";

// Icon and tint of each problem card (Figma "Icon tile 1-3": amber, red, blue
// at 15%, same in both themes).
const cards: {
  id: keyof ProblemDict["cards"];
  icon: LucideIcon;
  tone: string;
}[] = [
  { id: "terminal", icon: TriangleAlert, tone: "bg-tile-warning/15 text-tile-warning" },
  { id: "config", icon: FileText, tone: "bg-tile-danger/15 text-tile-danger" },
  { id: "dashboard", icon: Box, tone: "bg-tile-info/15 text-tile-info" },
];

const chip =
  "type-mono-s rounded-[5px] border border-chip-line bg-chip px-1 py-0.5 whitespace-nowrap text-chip-text";

// Home "The problem" section (Figma "Problem & Core Feature" desktop and
// "Problem / Mobile"): heading, three problem cards and one line that hands
// off to the full comparison of a plain terminal, a web dashboard and Capstio
// on /compare. Block and text colors come
// from the section palette in globals.css (exact Figma values per theme); the
// background matches the hero.
export function Problem({
  lang,
  leg,
  dict,
}: {
  lang: Locale;
  leg: string;
  dict: ProblemDict;
}) {
  return (
    <Section
      id="problem"
      surface="light"
      aria-labelledby={headingId}
      spacing="py-10 lg:py-16"
    >
      <Container className="flex flex-col gap-6 lg:gap-10">
        <div data-reveal className="flex flex-col items-center gap-3 text-center lg:gap-4">
          <LegMark leg={leg}>{dict.overline}</LegMark>
          {/* Figma lets these wrap naturally in 900px and 760px boxes on
              desktop; balanced wrapping only on small screens. */}
          <h2
            id={headingId}
            className="type-section-title max-w-225 text-balance text-strong lg:text-wrap"
          >
            {dict.title}
          </h2>
          <p className="max-w-190 text-base leading-[1.2] text-balance text-soft lg:text-lg lg:leading-[1.375rem] lg:text-wrap">
            {dict.subtitle}
          </p>
        </div>

        <div data-reveal className="grid gap-3 lg:grid-cols-3 lg:gap-6">
          {cards.map(({ id, icon: Icon, tone }) => (
            <div
              key={id}
              className="flex flex-col gap-3.5 rounded-lg border border-card-line bg-card p-5 shadow-(--sp-card-shadow) lg:gap-2.5 lg:p-6"
            >
              <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-5">
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-flex size-11 shrink-0 items-center justify-center rounded-[12px]",
                    tone,
                  )}
                >
                  <Icon className="size-5.5" strokeWidth={1.75} />
                </span>
                <h3 className="type-h4 text-strong lg:text-[1.25rem] lg:leading-6">
                  {dict.cards[id].title}
                </h3>
              </div>
              <p className="type-small text-soft">{withCode(dict.cards[id].body, chip)}</p>
            </div>
          ))}
        </div>

        <p data-reveal className="type-small text-center text-balance text-soft">
          {dict.comparison.subtitle}{" "}
          <Link
            href={localizePath(lang, topLinkHref.compare)}
            className="font-semibold text-section-link underline-offset-4 hover:underline"
          >
            {withArrow(dict.comparison.link)}
          </Link>
        </p>
      </Container>
    </Section>
  );
}
