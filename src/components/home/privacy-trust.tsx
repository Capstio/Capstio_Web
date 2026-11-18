import { ArrowUpRight, Check, Globe, LockKeyhole, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionaries";
import { localizePath, type Locale } from "@/lib/i18n";
import { securityHref } from "@/lib/site-nav";
import { withArrow } from "./with-arrow";

type PrivacyDict = Dictionary["home"]["privacy"];

// Figma strokes sit inside the frame and take no space; CSS borders do, so
// the paddings are 1px smaller than the intended 20 / 24.
const column =
  "flex flex-col gap-5 rounded-lg border bg-bento-card p-4.75 lg:p-5.75";

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
          <h4 className="text-lg leading-[1.375rem] font-semibold text-strong">{title}</h4>
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

// The "What leaves your Mac, and where it goes" half of the Trust section
// (Figma "Feature - Privacy & Trust"): what never reaches Capstio servers, and
// what the app sends out with where and when. The two lists sit side by side
// from 1280px, where the column is wide enough, and stack below. The copy
// follows the brief's list of claims we may make. It sits under the section's
// h2, so its title is an h3 and each list title an h4.
export function PrivacyColumn({
  lang,
  dict,
  className,
  hideSecurityLink = false,
}: {
  lang: Locale;
  dict: PrivacyDict;
  className?: string;
  // The security page itself leaves out the link that points at it.
  hideSecurityLink?: boolean;
}) {
  return (
    <div id="privacy" className={className}>
      <div data-reveal-self className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-kicker uppercase">{dict.overline}</p>
        <h3 className="text-xl leading-7 font-bold text-balance text-strong lg:text-2xl lg:leading-8">
          {dict.title}
        </h3>
        <p className="text-sm leading-[1.3125rem] text-soft lg:text-[0.9375rem] lg:leading-6">
          {dict.subtitle}
        </p>
      </div>

      <div data-reveal className="grid gap-4 xl:grid-cols-2 xl:gap-5">
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

      <div data-reveal-self className="flex flex-col gap-2 text-[0.9375rem] leading-[1.125rem]">
        <p className="text-soft">{dict.footnote.note}</p>
        {!hideSecurityLink && (
          <Link
            href={localizePath(lang, securityHref)}
            className="w-fit font-medium text-kicker underline-offset-4 hover:underline"
          >
            {withArrow(dict.footnote.link, "size-4")}
          </Link>
        )}
      </div>
    </div>
  );
}
