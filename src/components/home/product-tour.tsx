"use client";

import { FileCode2, LayoutGrid, Server, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Container, Section } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Dictionary, PageCopy } from "@/lib/dictionaries";
import { hasLocale, localizePath } from "@/lib/i18n";
import { allFeaturesHref, featureHref } from "@/lib/site-nav";
import { FleetScreenshot } from "./fleet-screenshot";
import { withCode } from "./inline-code";
import { ConfigScreenshot, configPointIcons } from "./safe-config";
import { SectionHeading } from "./section-heading";
import { AppsScreenshot, appsPointIcons } from "./unified-apps";
import { withArrow } from "./with-arrow";

type TourDict = Dictionary["home"]["tour"];
type ViewId = keyof TourDict["tabs"];

const headingId = "tour-heading";

const views: { id: ViewId; icon: LucideIcon }[] = [
  { id: "apps", icon: LayoutGrid },
  { id: "config", icon: FileCode2 },
  { id: "fleet", icon: Server },
];

// The screen frame is the container width minus the stage padding: 1152px on
// a wide desktop, the viewport minus gutters and padding below that.
const screenSizes = "(min-width: 1264px) 1152px, calc(100vw - 48px)";

const chip =
  "rounded-md bg-chip-solid px-1.5 py-0.5 font-mono text-sm whitespace-nowrap text-chip-text";

// Every view is rendered at once and stacked in one grid cell, so the box
// keeps the size of the largest view and nothing below moves when the view
// changes. Only opacity (and visibility, which hides the inactive views from
// the keyboard and assistive tech) changes; reduced motion switches at once.
const layer =
  "[grid-area:1/1] transition-[opacity,visibility] duration-300 ease-out motion-reduce:transition-none";
const shown = "opacity-100";
const hiddenLayer = "invisible opacity-0";

type View = {
  overline: string;
  title: string;
  body: ReactNode;
  points: { title: string; body: string }[];
  icons: LucideIcon[];
  link: { href: string; text: string };
  screen: ReactNode;
};

// Leg "Product tour": Apps, Safe config and Fleet, each with its real
// screenshot, in one tabbed view. The heading, then the tabs, then the wide
// screenshot on a glow stage, then that view's copy and points under it.
// Each view links on to its feature page (Fleet, which has none, to all
// features).
export function ProductTour({
  leg,
  dict,
  apps,
  config,
  links,
}: {
  leg: string;
  dict: TourDict;
  apps: Dictionary["home"]["unifiedApps"];
  config: Dictionary["home"]["safeConfig"];
  links: PageCopy<"home-links">["tour"];
}) {
  const [active, setActive] = useState<ViewId>("apps");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();
  const panelId = `${id}-panel`;

  // The page is rendered under /[lang]; the default language has no prefix.
  const { lang } = useParams<{ lang?: string }>();
  const href = (path: string) =>
    typeof lang === "string" && hasLocale(lang) ? localizePath(lang, path) : path;

  const content: Record<ViewId, View> = {
    apps: {
      overline: apps.overline,
      title: apps.title,
      body: withCode(apps.subtitle, chip),
      points: apps.points,
      icons: appsPointIcons,
      link: { href: href(featureHref.apps), text: links.apps },
      screen: <AppsScreenshot alt={apps.imageAlt} sizes={screenSizes} />,
    },
    config: {
      overline: config.overline,
      title: config.title,
      body: config.subtitle,
      points: config.points,
      icons: configPointIcons,
      link: { href: href(featureHref.safeConfig), text: links.config },
      screen: <ConfigScreenshot dict={config} sizes={screenSizes} />,
    },
    fleet: {
      overline: dict.fleet.overline,
      title: dict.fleet.title,
      body: dict.fleet.body,
      points: [],
      icons: [],
      link: { href: href(allFeaturesHref), text: dict.fleet.link },
      screen: <FleetScreenshot alt={dict.fleet.imageAlt} sizes={screenSizes} />,
    },
  };

  // Arrow keys, Home and End move between tabs and select them (WAI-ARIA
  // tabs pattern with automatic activation and a roving tabindex).
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = views.findIndex((view) => view.id === active);
    const last = views.length - 1;
    const next =
      event.key === "ArrowRight"
        ? index === last ? 0 : index + 1
        : event.key === "ArrowLeft"
          ? index === 0 ? last : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setActive(views[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <Section id="tour" surface="light" aria-labelledby={headingId} spacing="py-10 lg:py-16">
      <Container className="flex flex-col gap-6 lg:gap-8">
        <SectionHeading
          id={headingId}
          leg={leg}
          overline={dict.overline}
          title={dict.title}
          subtitle={dict.subtitle}
        />

        {/* Phones drop the tab icons so the longest labels (vi) still fit on
            one row; the row scrolls sideways rather than overflow if not. */}
        <div data-reveal-self className="flex lg:justify-center">
          <div
            role="tablist"
            aria-label={dict.overline}
            onKeyDown={onKeyDown}
            className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-control p-1"
          >
            {views.map(({ id: view, icon: Icon }, index) => {
              const selected = view === active;
              return (
                <button
                  key={view}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  id={`${id}-${view}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={panelId}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(view)}
                  className={cn(
                    "type-small inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-3 whitespace-nowrap sm:px-4 transition-colors duration-300 motion-reduce:transition-none",
                    selected
                      ? "bg-action font-bold text-on-action"
                      : "text-muted hover:text-heading",
                  )}
                >
                  <Icon aria-hidden="true" className="hidden size-3.5 sm:block" strokeWidth={1.6} />
                  {dict.tabs[view]}
                </button>
              );
            })}
          </div>
        </div>

        {/* One panel for the three tabs, labelled by the selected one. */}
        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={`${id}-${active}`}
          data-reveal-self
          className="flex flex-col gap-6 lg:gap-8"
        >
          <div className="rounded-lg border border-stage-line bg-(image:--sp-stage) p-2 md:p-4 lg:rounded-xl lg:p-6">
            {/* The frame has the ratio of the widest screenshot (Apps,
                3000x1810); the others are fitted whole inside it. */}
            <div className="grid">
              {views.map(({ id: view }) => (
                <div
                  key={view}
                  className={cn(
                    layer,
                    "relative aspect-[3000/1810]",
                    view === active ? shown : hiddenLayer,
                  )}
                >
                  {content[view].screen}
                </div>
              ))}
            </div>
          </div>

          <div className="grid">
            {views.map(({ id: view }) => (
              <ViewCopy
                key={view}
                view={content[view]}
                className={cn(layer, view === active ? shown : hiddenLayer)}
              />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

// A view's overline, title, text and link on the left, its three points
// beside them on desktop and under them on phones.
function ViewCopy({ view, className }: { view: View; className: string }) {
  return (
    <div
      className={cn(
        "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-8",
        className,
      )}
    >
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-kicker uppercase">{view.overline}</p>
        <h3 className="text-2xl leading-tight font-bold text-balance whitespace-pre-line text-strong lg:text-[1.75rem]">
          {view.title}
        </h3>
        <p className="text-[0.9375rem] leading-6 text-soft">{view.body}</p>
        <Link
          href={view.link.href}
          className="w-fit text-sm font-medium text-kicker underline-offset-4 hover:underline"
        >
          {withArrow(view.link.text)}
        </Link>
      </div>

      {view.points.length > 0 && (
        <ul className="grid gap-3 self-start sm:grid-cols-3">
          {view.points.map((point, index) => {
            const Icon = view.icons[index];
            return (
              <li
                key={point.title}
                className="flex items-center gap-3 rounded-[14px] bg-point p-4 sm:flex-col sm:items-start"
              >
                <span className="flex shrink-0 items-center gap-3">
                  <span className="w-6.5 font-mono text-xs text-kicker">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden="true"
                    className="inline-flex size-9 items-center justify-center rounded-[10px] bg-point-tile text-point-icon"
                  >
                    {Icon && <Icon className="size-4.5" strokeWidth={1.75} />}
                  </span>
                </span>
                <span className="flex min-w-0 flex-col gap-1.25">
                  <span className="text-[0.9375rem] leading-[1.125rem] font-semibold text-strong">
                    {point.title}
                  </span>
                  <span className="text-[0.8125rem] leading-[1.125rem] text-soft">
                    {point.body}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
