"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { apps, appsHostId, drift, hosts, openAlerts, type Host } from "@/lib/playground-data";
import type { PlaygroundState, ScreenProps } from "./playground-state";

// All VPS: totals for the fleet and a card per server with live CPU, RAM and
// disk. A card opens that server's Apps.

type Filter = "all" | "ok" | "alerts" | "error";

const filters: { id: Filter; label: string; match: (host: Host) => boolean }[] = [
  { id: "all", label: "All", match: () => true },
  { id: "ok", label: "OK", match: (host) => !host.alert },
  { id: "alerts", label: "Alerts", match: (host) => Boolean(host.alert) },
  { id: "error", label: "Error / not connected", match: () => false },
];

// Containers that are up: those of Compose apps that run (a flapping one
// counts, as in Docker), so stopping an app in Apps lowers the total.
function runningContainers(state: PlaygroundState): number {
  return apps
    .filter((app) => app.runtime === "compose")
    .filter((app) => ["running", "flapping"].includes(state.runs[app.id].status))
    .reduce((total, app) => total + app.containers.length, 0);
}

export function FleetScreen({ state, send }: ScreenProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const containers = runningContainers(state);
  const shown = hosts.filter(filters.find((item) => item.id === filter)!.match);

  const totals = [
    { label: "Running containers", value: String(containers), note: "on 1 host with Docker" },
    { label: "Apps", value: String(apps.length), note: `on ${hosts.length} scanned hosts` },
    { label: "Open alerts", value: String(openAlerts), note: "See them in Alerts" },
    { label: "SSL expiring within 30 days", value: "—", note: "No domains to check yet" },
  ];

  return (
    <div className="h-full overflow-y-auto p-5 max-md:p-3">
      <div className="flex w-fit max-w-full gap-0.5 overflow-x-auto rounded-lg bg-pg-field p-0.5" role="group" aria-label="Filter servers">
        {filters.map((item) => {
          const selected = item.id === filter;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setFilter(item.id)}
              className={cn(
                "h-7 shrink-0 rounded-md px-10 text-base whitespace-nowrap max-md:px-3",
                selected ? "bg-pg-accent text-pg-on-accent" : "hover:bg-pg-selected",
              )}
            >
              {item.label} {hosts.filter(item.match).length}
            </button>
          );
        })}
      </div>

      <ul className="mt-4 grid grid-cols-4 gap-3 max-md:grid-cols-2">
        {totals.map((total) => (
          <li key={total.label} className="rounded-xl bg-pg-card p-4">
            <p className="text-pg-muted">{total.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{total.value}</p>
            <p className="mt-1 text-pg-muted">{total.note}</p>
          </li>
        ))}
      </ul>

      <ul className="mt-3 grid grid-cols-4 gap-3 max-md:grid-cols-1">
        {shown.map((host) => (
          <li key={host.id}>
            <HostCard host={host} tick={state.tick} containers={host.id === appsHostId ? containers : 0} onOpen={() => send({ type: "host", hostId: host.id, screen: "apps" })} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function HostCard({
  host,
  tick,
  containers,
  onOpen,
}: {
  host: Host;
  tick: number;
  containers: number;
  onOpen: () => void;
}) {
  const ping = Math.round(drift(host.port, tick, host.ping, Math.max(1, host.ping / 3))) || 1;
  const meters = [
    { label: "CPU", value: drift(host.port + 1, tick, host.cpu, 1.5), tone: "bg-pg-accent" },
    { label: "RAM", value: drift(host.port + 2, tick, host.ram, 2), tone: "bg-pg-accent" },
    { label: "Disk", value: host.disk, tone: "bg-pg-orange" },
  ];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col gap-1.5 rounded-xl bg-pg-card p-4 text-left hover:ring-1 hover:ring-pg-accent"
    >
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className={cn("size-2.5 rounded-full", host.alert ? "bg-pg-orange" : "bg-pg-green")} />
        <span className="text-lg font-semibold">{host.id}</span>
        <span className="ml-auto text-pg-muted">{containers ? `${containers} containers` : `${ping} ms`}</span>
      </span>
      <span className="truncate text-pg-muted">
        {host.os} · 127.0.0.1 · {ping} ms
      </span>
      {meters.map((meter) => (
        <span key={meter.label} className="grid grid-cols-[3em_1fr_3em] items-center gap-2">
          <span className="text-pg-muted">{meter.label}</span>
          <span className="h-3.5 overflow-hidden rounded-sm bg-pg-field">
            <span
              className={cn("block h-full rounded-sm transition-[width] duration-700 motion-reduce:transition-none", meter.tone)}
              style={{ width: `${Math.min(100, Math.max(0.5, meter.value))}%` }}
            />
          </span>
          <span className="text-right tabular-nums">{Math.round(meter.value)}%</span>
        </span>
      ))}
    </button>
  );
}
