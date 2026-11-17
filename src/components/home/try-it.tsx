"use client";

import { ShieldAlert, SquareTerminal, type LucideIcon } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Container, Section } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionaries";
import { CommandConsole } from "./command-equivalent";
import { DangerConsole } from "./danger-demo";
import { LegMark } from "./leg-mark";

type TryDict = Dictionary["home"]["try"];
type Tab = keyof TryDict["tabs"];

const headingId = "try-heading";

// Tab order, also the order of the arrow keys.
const tabs: { key: Tab; icon: LucideIcon }[] = [
  { key: "command", icon: SquareTerminal },
  { key: "danger", icon: ShieldAlert },
];

// Home section "Try it": the equivalent-command console and the
// dangerous-command console behind two tabs. Desktop: heading and tabs on the
// left, the active console on the right; phones stack the tabs above it.
// Both consoles stay mounted so each keeps its state across tab switches; the
// inactive one is hidden from sight, focus and screen readers.
export function TryIt({
  leg,
  dict,
  command,
  danger,
}: {
  leg: string;
  dict: TryDict;
  command: Dictionary["home"]["command"];
  danger: Dictionary["home"]["danger"];
}) {
  const [active, setActive] = useState<Tab>("command");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();

  // Arrow keys, Home and End move between tabs and select them (WAI-ARIA tabs
  // pattern with automatic activation). The tabs are stacked, so up/down
  // work as well as left/right.
  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.key === active);
    const last = tabs.length - 1;
    const next =
      event.key === "ArrowDown" || event.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : event.key === "ArrowUp" || event.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    setActive(tabs[next].key);
    tabRefs.current[next]?.focus();
  }

  return (
    <Section id="try" surface="light" aria-labelledby={headingId} spacing="py-10 lg:py-16">
      <Container className="grid gap-8 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-start lg:gap-14">
        <div data-reveal className="flex flex-col gap-5">
          <LegMark leg={leg}>{dict.overline}</LegMark>
          <h2 id={headingId} className="type-h2 text-balance text-strong">
            {dict.title}
          </h2>
          <p className="text-base leading-7 text-soft">{dict.subtitle}</p>

          <div
            role="tablist"
            aria-orientation="vertical"
            aria-labelledby={headingId}
            onKeyDown={onTabKeyDown}
            className="mt-1 flex flex-col gap-3"
          >
            {tabs.map(({ key, icon: Icon }, index) => {
              const selected = key === active;
              return (
                <button
                  key={key}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  id={`${id}-tab-${key}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`${id}-panel-${key}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[14px] border p-4 text-left transition-colors motion-reduce:transition-none",
                    selected
                      ? "border-kicker bg-kicker/10"
                      : "border-bento-line bg-point hover:border-line-strong",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-flex size-10 shrink-0 items-center justify-center rounded-[10px]",
                      selected ? "bg-kicker/15 text-kicker" : "bg-point-tile text-point-icon",
                    )}
                  >
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-base leading-5 font-semibold text-strong">
                      {dict.tabs[key].label}
                    </span>
                    <span className="text-sm leading-5 text-soft">{dict.tabs[key].body}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* From 1024px both panels share one grid cell, so the column is as
            tall as the taller console and switching tabs never moves the page;
            the inactive one is invisible (no focus, not read out). Phones use
            display: none instead, so the shorter console leaves no gap. */}
        <div data-reveal-self className="grid min-w-0">
          {tabs.map(({ key }) => {
            const selected = key === active;
            return (
              <div
                key={key}
                id={`${id}-panel-${key}`}
                role="tabpanel"
                aria-labelledby={`${id}-tab-${key}`}
                inert={!selected}
                className={cn("col-start-1 row-start-1 min-w-0", !selected && "max-lg:hidden lg:invisible")}
              >
                {key === "command" ? <CommandConsole dict={command} /> : <DangerConsole dict={danger} />}
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
