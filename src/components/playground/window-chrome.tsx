"use client";

import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Command,
  PanelLeft,
  Plus,
  RotateCw,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { appsHostId, drift, hosts } from "@/lib/playground-data";
import type { Screen, ScreenProps } from "./playground-state";

// The frame of the Capstio window around the screens: traffic lights, the
// toolbar, the host tab bar and the status bar. Only the parts the
// playground simulates do something; the rest shows the inert hint.

export function TrafficLights() {
  return (
    <span aria-hidden="true" className="flex gap-2">
      {["bg-pg-red", "bg-pg-orange", "bg-pg-green"].map((tone) => (
        <span key={tone} className={cn("size-3 rounded-full", tone)} />
      ))}
    </span>
  );
}

export function SidebarToggle({ onInert }: { onInert: ScreenProps["onInert"] }) {
  return (
    <InertIcon icon={PanelLeft} label="Toggle sidebar" onInert={onInert} className="size-8 rounded-lg bg-pg-field" />
  );
}

function InertIcon({
  icon: Icon,
  label,
  onInert,
  className,
}: {
  icon: LucideIcon;
  label: string;
  onInert: ScreenProps["onInert"];
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled="true"
      onClick={onInert}
      className={cn("inline-flex size-7 items-center justify-center rounded-md text-pg-text hover:bg-pg-field", className)}
    >
      <Icon aria-hidden="true" className="size-4" strokeWidth={1.6} />
    </button>
  );
}

const tools: { icon: LucideIcon; label: string }[] = [
  { icon: Sparkles, label: "AI assistant" },
  { icon: Command, label: "Command palette" },
  { icon: Bell, label: "Alerts" },
  { icon: Settings, label: "Settings" },
  { icon: Plus, label: "Add host" },
  { icon: RotateCw, label: "Refresh" },
];

export function Toolbar({ state, onInert }: ScreenProps) {
  const host = hosts.find((item) => item.id === state.hostId) ?? hosts[0];
  const ping = Math.round(drift(host.port, state.tick, host.ping, 1)) || 1;
  const fleet = state.screen === "fleet";

  return (
    <div className="flex h-13 shrink-0 items-center gap-2 px-3">
      <span className="flex items-center rounded-full bg-pg-field p-0.5 max-md:hidden">
        <InertIcon icon={ChevronLeft} label="Back" onInert={onInert} />
        <InertIcon icon={ChevronRight} label="Forward" onInert={onInert} />
      </span>

      {fleet ? (
        <p className="px-1 text-lg font-semibold">All VPS</p>
      ) : (
        <>
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-pg-field px-3 whitespace-nowrap">
            <span aria-hidden="true" className="size-2 rounded-full bg-pg-green" />
            Connected · {ping}ms
          </span>
          <button
            type="button"
            aria-disabled="true"
            onClick={onInert}
            className="inline-flex h-7 items-center gap-1 rounded-full bg-pg-field px-3 whitespace-nowrap max-md:hidden"
          >
            deploy@127.0.0.1:{host.port}
            <ChevronDown aria-hidden="true" className="size-3.5" />
          </button>
          <p className="truncate px-1 text-lg font-semibold">{host.id}</p>
        </>
      )}

      <span className="ml-auto flex items-center gap-1 rounded-full bg-pg-field px-1.5 py-0.5 max-md:hidden">
        {tools.map((tool) => (
          <InertIcon key={tool.label} icon={tool.icon} label={tool.label} onInert={onInert} />
        ))}
      </span>
    </div>
  );
}

const hostTabs: { label: string; screen?: Screen }[] = [
  { label: "Overview" },
  { label: "Apps", screen: "apps" },
  { label: "Docker" },
  { label: "Files", screen: "files" },
  { label: "Terminal" },
  { label: "Recipes" },
  { label: "Logs" },
  { label: "Security" },
  { label: "Users" },
  { label: "Network" },
];

// ⌘1 … ⌘0 tabs of one host. Apps and Files switch screens; the others are
// beyond this demo.
export function HostTabs({ state, send, onInert }: ScreenProps) {
  return (
    <nav aria-label="Host views" className="shrink-0 border-b border-pg-line px-3 pb-2">
      <div className="mx-auto flex w-fit max-w-full gap-0.5 overflow-x-auto rounded-lg bg-pg-field p-0.5">
        {hostTabs.map((tab, index) => {
          const selected = tab.screen === state.screen;
          return (
            <button
              key={tab.label}
              type="button"
              aria-current={selected ? "page" : undefined}
              aria-disabled={tab.screen ? undefined : "true"}
              onClick={(event) => (tab.screen ? send({ type: "screen", screen: tab.screen }) : onInert(event))}
              className={cn(
                "h-6.5 shrink-0 rounded-md px-4 whitespace-nowrap",
                selected ? "bg-pg-accent text-pg-on-accent" : "hover:bg-pg-selected",
              )}
            >
              <span className="opacity-80">⌘{(index + 1) % 10}</span> {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function StatusBar({ note }: { note: string }) {
  return (
    <div className="flex h-6 shrink-0 items-center gap-4 border-t border-pg-line px-3 text-xs text-pg-muted">
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="size-2 rounded-full bg-pg-green" />
        6/6 hosts online
      </span>
      <span className="inline-flex items-center gap-1.5 max-md:hidden">
        <span aria-hidden="true" className="size-2 rounded-full bg-pg-muted" />
        Sync: not signed in
      </span>
      <span className="mx-auto font-medium text-pg-accent">{note}</span>
      <span className="max-md:hidden">Capstio 0.1.0</span>
    </div>
  );
}

// Shown when a host other than the demo one is open on a host screen: the
// sample data lives on prod-web-01 only.
export function OnlyOnDemoHost({
  hostId,
  what,
  onOpen,
}: {
  hostId: string;
  what: "apps" | "files";
  onOpen: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <p className="text-lg font-semibold">
        {what === "apps" ? `No apps found on ${hostId}` : `Nothing to edit on ${hostId} yet`}
      </p>
      <p className="max-w-90 text-pg-muted">
        This demo keeps its {what === "apps" ? "apps" : "config files"} on {appsHostId}.
      </p>
      <button type="button" onClick={onOpen} className="mt-2 rounded-md bg-pg-accent px-3 py-1 text-pg-on-accent">
        Open {appsHostId}
      </button>
    </div>
  );
}
