"use client";

import { FileCode2, LayoutGrid, Server, type LucideIcon } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import {
  AppPlayground,
  PlaygroundFrame,
  type PlaygroundDict,
  type Screen,
} from "@/components/playground/app-playground";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionaries";

type TabId = keyof Dictionary["home"]["hero"]["tabs"];

const tabs: { id: TabId; icon: LucideIcon }[] = [
  { id: "apps", icon: LayoutGrid },
  { id: "config", icon: FileCode2 },
  { id: "fleet", icon: Server },
];

// Each tab opens one screen of the playground, and the playground moving to
// one of these screens selects its tab.
const tabScreen: Record<TabId, Screen> = { apps: "apps", config: "files", fleet: "fleet" };

// The hero's product window: the Apps / Safe config / Fleet tabs over the
// interactive app playground, in the place the product film used to play.
// The tabs and the window follow each other both ways.
export function HeroPlayground({
  dict,
  labels,
}: {
  dict: PlaygroundDict;
  labels: { tabs: Record<TabId, string>; tabsLabel: string };
}) {
  const [active, setActive] = useState<TabId>("apps");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();
  const panelId = `${id}-panel`;

  // Arrow keys, Home and End move between tabs and select them (WAI-ARIA
  // tabs pattern with automatic activation and a roving tabindex).
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.id === active);
    const last = tabs.length - 1;
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
    setActive(tabs[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="flex w-full flex-col items-center gap-4 lg:gap-5">
      {/* Phones drop the tab icons so the longest labels (vi) still fit on
          one row; the row scrolls sideways rather than overflow if not. */}
      <div
        role="tablist"
        aria-label={labels.tabsLabel}
        onKeyDown={onKeyDown}
        className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-control p-1"
      >
        {tabs.map(({ id: tab, icon: Icon }, index) => {
          const selected = tab === active;
          return (
            <button
              key={tab}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={`${id}-${tab}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab)}
              className={cn(
                "type-small inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-3 whitespace-nowrap sm:px-4 transition-colors duration-300 motion-reduce:transition-none",
                selected ? "bg-action font-bold text-on-action" : "text-muted hover:text-heading",
              )}
            >
              <Icon aria-hidden="true" className="hidden size-3.5 sm:block" strokeWidth={1.6} />
              {labels.tabs[tab]}
            </button>
          );
        })}
      </div>

      <div id={panelId} role="tabpanel" aria-labelledby={`${id}-${active}`} className="w-full">
        <PlaygroundFrame>
          <AppPlayground
            dict={dict}
            screen={tabScreen[active]}
            onScreenChange={(next) => {
              const tab = tabs.find(({ id: item }) => tabScreen[item] === next);
              if (tab) setActive(tab.id);
            }}
          />
        </PlaygroundFrame>
      </div>
    </div>
  );
}
