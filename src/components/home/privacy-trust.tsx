import { ArrowUpRight, Check, Globe, LockKeyhole, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Container, Section } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionaries";
import { securityHref } from "@/lib/site-nav";
import { withArrow } from "./with-arrow";

type PrivacyDict = Dictionary["home"]["privacy"];

const headingId = "privacy-heading";

// Figma strokes sit inside the frame and take no space; CSS borders do, so
// the paddings are 1px smaller than Figma (20 / 28) to keep the text width.
const column =
  "flex flex-col gap-5 rounded-lg border bg-bento-card p-4.75 lg:gap-6 lg:p-6.75";

// One column of the matrix: tile icon, label and title, a divider, then the
// rows. `marker` is the small round icon in front of each row.
function MatrixColumn({
  icon: Icon,
  tone,
  labelClassName,
  label,
  title,
  marker: Marker,
  markerTone,
  className,
  children,
}: {
  icon: LucideIcon;
  tone: string;
  labelClassName: string;
  label: string;
  title: string;
  marker: LucideIcon;
  markerTone: string;
  className: string;
  children: { title: string; body: string; meta?: string }[];
}) {
  return (
    <div className={cn(column, className)}>
      <div className="flex items-center gap-3.5">
        <span
          aria-hidden="true"
          className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-[12px]", tone)}
        >
          <Icon className="size-5" strokeWidth={1.8} />
        </span>
        <div className="flex flex-col gap-1">
          <p className={cn("text-xs leading-[0.9375rem] font-semibold uppercase", labelClassName)}>{label}</p>
          <h3 className="text-lg leading-[1.375rem] font-semibold text-strong lg:text-xl lg:leading-6">{title}</h3>
        </div>
      </div>
      <hr className="border-bento-line" />
      <ul className="flex flex-col gap-5">
        {children.map((row) => (
          <li key={row.title} className="flex gap-3">
            <span
              aria-hidden="true"
              className={cn("inline-flex size-5 shrink-0 items-center justify-center rounded-full", markerTone)}
            >
              <Marker className="size-3" strokeWidth={2.2} />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-[0.9375rem] leading-[1.125rem] font-semibold text-strong">
                {row.title}
              </p>
              <p className="text-sm leading-[1.3125rem] text-soft">{row.body}</p>
              {row.meta && (
                <p className="text-xs leading-[0.9375rem] font-medium text-privacy-meta">{row.meta}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Home section "What leaves your Mac, and where it goes" (Figma "Feature -
// Privacy & Trust" desktop and mobile). Two columns from 1024px: what never
// reaches Capstio servers, and what the app sends out with where and when;
// stacked below. The copy follows the brief's list of claims we may make.
export function PrivacyTrust({ dict }: { dict: PrivacyDict }) {
  return (
    <Section surface="light" aria-labelledby={headingId} spacing="py-10 lg:py-25">
      <Container className="flex flex-col gap-8 lg:gap-12">
        <div className="flex flex-col gap-4 lg:items-center lg:text-center">
          <p className="text-[0.8125rem] leading-4 font-semibold text-kicker uppercase">
            {dict.overline}
          </p>
          <h2 id={headingId} className="type-h2 text-strong">
            {dict.title}
          </h2>
          <p className="max-w-180 text-base leading-6 text-soft">{dict.subtitle}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          <MatrixColumn
            icon={LockKeyhole}
            tone="bg-tile-success/14 text-tile-success"
            labelClassName="text-privacy-good"
            label={dict.local.label}
            title={dict.local.title}
            marker={Check}
            markerTone="bg-tile-success/16 text-tile-success"
            className="border-privacy-local-line"
          >
            {dict.local.rows}
          </MatrixColumn>
          <MatrixColumn
            icon={Globe}
            tone="bg-kicker/14 text-kicker"
            labelClassName="text-privacy-label"
            label={dict.outbound.label}
            title={dict.outbound.title}
            marker={ArrowUpRight}
            markerTone="bg-kicker/14 text-kicker"
            className="border-privacy-line"
          >
            {dict.outbound.rows}
          </MatrixColumn>
        </div>

        <div className="flex flex-col items-center gap-2.5 text-center text-[0.9375rem] leading-[1.125rem]">
          <p className="text-soft">{dict.footnote.note}</p>
          <Link
            href={securityHref}
            className="font-medium text-kicker underline-offset-4 hover:underline"
          >
            {withArrow(dict.footnote.link, "size-4")}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
