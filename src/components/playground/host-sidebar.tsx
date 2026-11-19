"use client";

import {
  Bell,
  CircleDot,
  CircleUser,
  ClipboardList,
  KeyRound,
  LayoutGrid,
  ListChecks,
  Search,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { drift, hosts, openAlerts } from "@/lib/playground-data";
import type { ScreenProps } from "./playground-state";
import { SidebarToggle, TrafficLights } from "./window-chrome";

const nav: { label: string; icon: LucideIcon; fleet?: boolean; count?: number }[] = [
  { label: "All VPS", icon: LayoutGrid, fleet: true },
  { label: "Alerts", icon: Bell, count: openAlerts },
  { label: "Recipe Library", icon: ListChecks },
  { label: "SSH Keys", icon: KeyRound },
  { label: "Recorded sessions", icon: CircleDot },
  { label: "Activity log", icon: ClipboardList },
  { label: "Account & Team", icon: CircleUser },
];

// The left column: the host list (searchable, live ping) and the global
// views. Hosts and All VPS navigate; the other global views are inert.
export function HostSidebar({ state, send, onInert }: ScreenProps) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const shown = hosts.filter((host) => `${host.id} 127.0.0.1:${host.port}`.includes(needle));
  const fleet = state.screen === "fleet";

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-pg-line bg-pg-sidebar max-md:hidden">
      <div className="flex h-13 items-center justify-between px-4">
        <TrafficLights />
        <SidebarToggle onInert={onInert} />
      </div>

      <label className="mx-2.5 flex h-7 items-center gap-2 rounded-lg bg-pg-field px-2.5 text-pg-muted">
        <Search aria-hidden="true" className="size-3.5" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search hosts, IPs, tags…"
          aria-label="Search hosts"
          className="min-w-0 flex-1 bg-transparent text-pg-text outline-none placeholder:text-pg-muted"
        />
      </label>

      <p className="mt-4 px-3.5 text-xs font-semibold text-pg-muted">UNGROUPED</p>
      <ul className="mt-1 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2.5">
        {shown.map((host) => {
          const selected = !fleet && host.id === state.hostId;
          const ping = Math.round(drift(host.port, state.tick, host.ping, Math.max(1, host.ping / 3))) || 1;
          return (
            <li key={host.id}>
              <button
                type="button"
                aria-current={selected ? "true" : undefined}
                onClick={() => send({ type: "host", hostId: host.id })}
                className={cn(
                  "grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-2 rounded-lg px-2 py-1.5 text-left",
                  selected
                    ? state.screen === "apps"
                      ? "bg-pg-accent text-pg-on-accent"
                      : "bg-pg-selected"
                    : "hover:bg-pg-selected",
                )}
              >
                <span aria-hidden="true" className="row-span-2 size-2 rounded-full bg-pg-green" />
                <span className="text-base">{host.id}</span>
                <span className={cn("row-span-2 text-xs", selected && state.screen === "apps" ? "" : "text-pg-muted")}>
                  {ping} ms
                </span>
                <span className={cn("text-xs", selected && state.screen === "apps" ? "opacity-80" : "text-pg-muted")}>
                  127.0.0.1:{host.port}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <ul className="flex flex-col gap-0.5 border-t border-pg-line px-2.5 py-2">
        {nav.map(({ label, icon: Icon, fleet: isFleet, count }) => (
          <li key={label}>
            <button
              type="button"
              aria-current={isFleet && fleet ? "page" : undefined}
              aria-disabled={isFleet ? undefined : "true"}
              onClick={(event) => (isFleet ? send({ type: "screen", screen: "fleet" }) : onInert(event))}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-base",
                isFleet && fleet ? "bg-pg-selected" : "hover:bg-pg-selected",
              )}
            >
              <Icon aria-hidden="true" className="size-4.5 text-pg-accent" strokeWidth={1.6} />
              {label}
              {count !== undefined && <span className="ml-auto text-xs text-pg-muted">{count}</span>}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
