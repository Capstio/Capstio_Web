"use client";

import {
  Boxes,
  ChevronDown,
  CircleArrowDown,
  CircleArrowUp,
  CircleX,
  Copy,
  Ellipsis,
  FilePen,
  Play,
  RefreshCcw,
  RotateCw,
  ScrollText,
  Search,
  Settings2,
  Square,
  SquareTerminal,
  TriangleAlert,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useClipboard } from "@/components/ui/use-clipboard";
import { cn } from "@/lib/cn";
import {
  appCommand,
  playgroundActions,
  runtimeNames,
  runtimes,
  type PlaygroundAction,
  type Runtime,
} from "@/lib/commands";
import { isSecretKey } from "@/lib/env-file";
import { appConfig, apps, appsHostId, drift, type AppStatus, type DemoApp } from "@/lib/playground-data";
import { uptimeOf, type AppRun, type AppTab, type ScreenProps } from "./playground-state";
import { OnlyOnDemoHost } from "./window-chrome";

// Apps tab of one host: every Docker Compose, PM2 and systemd app Capstio
// found, and the selected app with the same controls for every runtime.

const runtimeIcon: Record<Runtime, LucideIcon> = { compose: Boxes, pm2: Workflow, systemd: Settings2 };
const runtimeTone: Record<Runtime, string> = {
  compose: "text-pg-accent",
  pm2: "text-pg-pm2",
  systemd: "text-pg-purple",
};

const statusDot: Record<AppStatus, string> = {
  running: "bg-pg-green",
  restarting: "bg-pg-orange",
  flapping: "bg-pg-orange",
  stopped: "bg-pg-muted",
  failed: "bg-pg-red",
};
const statusName: Record<AppStatus, string> = {
  running: "Running",
  restarting: "Restarting…",
  flapping: "Restarting",
  stopped: "Stopped",
  failed: "Failed",
};

const actionButton: Record<PlaygroundAction, { label: string; icon: LucideIcon }> = {
  restart: { label: "Restart", icon: RotateCw },
  stop: { label: "Stop", icon: Square },
  start: { label: "Start", icon: Play },
  pull: { label: "Pull & Up", icon: CircleArrowDown },
  reload: { label: "Reload", icon: RefreshCcw },
};

function duration(seconds: number): string {
  if (seconds < 60) return "a few seconds";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes === 1 ? "1 minute" : `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

const processes = (app: DemoApp) =>
  app.containers.length === 1 ? "1 process" : `${app.containers.length} processes`;

export function AppsScreen(props: ScreenProps) {
  const { state, send } = props;
  if (state.hostId !== appsHostId) {
    return <OnlyOnDemoHost hostId={state.hostId} what="apps" onOpen={() => send({ type: "host", hostId: appsHostId })} />;
  }

  return (
    <div className="flex h-full max-md:flex-col">
      <AppList {...props} />
      <AppDetail {...props} />
    </div>
  );
}

function AppList({ state, send }: ScreenProps) {
  const [query, setQuery] = useState("");
  const [closed, setClosed] = useState<Runtime[]>([]);
  const needle = query.trim().toLowerCase();

  return (
    <div className="flex w-75 shrink-0 flex-col border-r border-pg-line max-md:h-2/5 max-md:w-full max-md:border-r-0 max-md:border-b">
      <label className="m-2.5 flex h-7 shrink-0 items-center gap-2 rounded-lg bg-pg-field px-2.5 text-pg-muted">
        <Search aria-hidden="true" className="size-3.5" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter apps, sites…"
          aria-label="Filter apps"
          className="min-w-0 flex-1 bg-transparent text-pg-text outline-none placeholder:text-pg-muted"
        />
      </label>

      <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-2">
        {runtimes.map((runtime) => {
          const group = apps.filter((app) => app.runtime === runtime && app.id.includes(needle));
          if (group.length === 0) return null;
          const Icon = runtimeIcon[runtime];
          const open = !closed.includes(runtime);
          return (
            <section key={runtime} aria-label={runtimeNames[runtime]}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() =>
                  setClosed(open ? [...closed, runtime] : closed.filter((item) => item !== runtime))
                }
                className="flex w-full items-center gap-2 px-2 pt-3 pb-1 text-pg-muted"
              >
                <ChevronDown aria-hidden="true" className={cn("size-3.5 transition-transform motion-reduce:transition-none", !open && "-rotate-90")} />
                <Icon aria-hidden="true" className="size-3.5" strokeWidth={1.6} />
                {runtimeNames[runtime]}
                <span className="ml-auto">{group.length}</span>
              </button>
              {open && (
                <ul className="flex flex-col gap-0.5">
                  {group.map((app) => (
                    <AppRow
                      key={app.id}
                      app={app}
                      run={state.runs[app.id]}
                      selected={app.id === state.appId}
                      onSelect={() => send({ type: "app", appId: app.id })}
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })}

        <p className="mx-2 mt-4 flex gap-2 text-xs text-pg-muted">
          <TriangleAlert aria-hidden="true" className="size-3.5 shrink-0 text-pg-orange" />
          PM2 for “deploy” is not running (the server may have restarted without `pm2 startup` enabled).
        </p>
      </div>
    </div>
  );
}

function AppRow({
  app,
  run,
  selected,
  onSelect,
}: {
  app: DemoApp;
  run: AppRun;
  selected: boolean;
  onSelect: () => void;
}) {
  const busy = run.status === "restarting" || run.status === "flapping";
  return (
    <li>
      <button
        type="button"
        aria-current={selected ? "true" : undefined}
        onClick={onSelect}
        className={cn(
          "grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-2.5 rounded-lg px-2 py-1.5 text-left",
          selected ? "bg-pg-selected" : "hover:bg-pg-stripe",
        )}
      >
        <span aria-hidden="true" className={cn("size-2 rounded-full", statusDot[run.status])} />
        <span className="text-base">{app.id}</span>
        <span aria-hidden="true">
          {busy && <RotateCw className="size-3.5 text-pg-orange motion-safe:animate-spin" />}
          {run.status === "failed" && <CircleX className="size-3.5 text-pg-red" />}
        </span>
        <span className="col-start-2 col-end-4 truncate text-xs text-pg-muted">
          <span className={cn("font-semibold", runtimeTone[app.runtime])}>{app.runtime}</span>
          {app.user && <span className="font-semibold text-pg-red"> {app.user}</span>}
          {app.path && ` ${app.path}`} · {processes(app)}
          <span className="sr-only">, {statusName[run.status]}</span>
        </span>
      </button>
    </li>
  );
}

const tabs: AppTab[] = ["container", "config", "environment", "info"];

function AppDetail({ state, send, onInert }: ScreenProps) {
  const app = apps.find((item) => item.id === state.appId) ?? apps[0];
  const run = state.runs[app.id];
  const { state: copied, copy } = useClipboard();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();
  const command = appCommand(app.runtime, run.lastAction, { name: app.id, path: app.path, user: app.user });
  const down = run.status === "stopped" || run.status === "failed";
  const busy = run.status === "restarting";
  const actions = playgroundActions[app.runtime].map((action) => (action === "stop" && down ? "start" : action));
  const tabLabel: Record<AppTab, string> = {
    container: app.runtime === "compose" ? "Container" : "Process",
    config: "Config",
    environment: "Environment",
    info: "Info",
  };

  function onTabKey(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.indexOf(state.appTab);
    const next =
      event.key === "ArrowRight" ? (index + 1) % tabs.length
      : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length
      : null;
    if (next === null) return;
    event.preventDefault();
    send({ type: "appTab", tab: tabs[next] });
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-5 max-md:p-3">
      <div className="flex items-center gap-2.5">
        <h3 className="text-xl font-semibold">{app.id}</h3>
        <span className={cn("text-sm font-semibold", runtimeTone[app.runtime])}>{app.runtime}</span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-base text-pg-muted" aria-live="polite">
          <span aria-hidden="true" className={cn("size-2 rounded-full", statusDot[run.status])} />
          {statusName[run.status]}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {actions.map((action) => {
          const { label, icon: Icon } = actionButton[action];
          return (
            <button
              key={action}
              type="button"
              disabled={busy || (down && action !== "start" && action !== "restart")}
              onClick={() => send({ type: "act", appId: app.id, action })}
              className="inline-flex h-7.5 items-center gap-1.5 rounded-md border border-pg-line bg-pg-button px-3 text-base shadow-sm hover:bg-pg-stripe disabled:opacity-50"
            >
              <Icon aria-hidden="true" className="size-3.5" strokeWidth={action === "stop" ? 3 : 2} />
              {label}
            </button>
          );
        })}
        {app.runtime === "compose" && (
          <button
            type="button"
            aria-disabled="true"
            onClick={onInert}
            className="inline-flex h-7.5 items-center gap-1.5 rounded-md border border-pg-line bg-pg-button px-3 text-base max-md:hidden"
          >
            <CircleArrowUp aria-hidden="true" className="size-3.5" />
            Update images…
          </button>
        )}
        <span className="ml-auto flex gap-0.5 rounded-md bg-pg-field p-0.5 max-md:hidden">
          {[ScrollText, FilePen, SquareTerminal, Ellipsis].map((Icon, index) => (
            <button
              key={index}
              type="button"
              aria-label={["Logs", "Edit", "Terminal", "More"][index]}
              aria-disabled="true"
              onClick={onInert}
              className="inline-flex size-6.5 items-center justify-center rounded-sm hover:bg-pg-selected"
            >
              <Icon aria-hidden="true" className="size-3.5" strokeWidth={1.6} />
            </button>
          ))}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-lg border border-dashed border-pg-line bg-pg-stripe px-3 py-2">
        <span className="shrink-0 text-xs text-pg-muted max-md:hidden">Equivalent command</span>
        <code className="pg-mono min-w-0 flex-1 truncate text-xs">{command}</code>
        <button
          type="button"
          onClick={() => copy(command)}
          className="inline-flex shrink-0 items-center gap-1.5 text-pg-muted hover:text-pg-text"
        >
          <Copy aria-hidden="true" className="size-3.5" />
          {copied === "copied" ? "Copied" : copied === "failed" ? "Copy failed" : "Copy"}
        </button>
      </div>

      <div
        role="tablist"
        aria-label={`${app.id} details`}
        onKeyDown={onTabKey}
        className="mt-3 flex w-fit max-w-full gap-0.5 overflow-x-auto rounded-lg bg-pg-field p-0.5"
      >
        {tabs.map((tab, index) => {
          const selected = tab === state.appTab;
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
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => send({ type: "appTab", tab })}
              className={cn(
                "h-6.5 shrink-0 rounded-md px-5 text-base",
                selected ? "bg-pg-accent text-pg-on-accent" : "hover:bg-pg-selected",
              )}
            >
              {tabLabel[tab]}
            </button>
          );
        })}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${state.appTab}`} className="mt-3 flex-[1_0_auto]">
        {state.appTab === "container" && <ContainerTable app={app} run={run} tick={state.tick} />}
        {state.appTab === "config" && <ConfigView app={app} />}
        {state.appTab === "environment" && (
          <EnvList app={app} shown={state.secretsShown} onToggle={() => send({ type: "secrets", shown: !state.secretsShown })} />
        )}
        {state.appTab === "info" && <InfoView app={app} />}
      </div>

      {app.runtime === "compose" && (
        <p className="mt-3 text-xs text-pg-muted">Project {app.id} · docker runs as the login account</p>
      )}
    </div>
  );
}

function stateText(run: AppRun, tick: number): string {
  if (run.status === "running") return `Up ${duration(uptimeOf(run, tick))}`;
  if (run.status === "flapping") return `Restarting (1) ${duration(uptimeOf(run, tick))} ago`;
  if (run.status === "stopped") return "Exited (0)";
  if (run.status === "failed") return "Failed (exit-code)";
  return "Restarting…";
}

function ContainerTable({ app, run, tick }: { app: DemoApp; run: AppRun; tick: number }) {
  const live = run.status === "running";
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-150 text-left text-base">
        <thead className="border-b border-pg-line text-sm text-pg-muted">
          <tr>
            {["Name", "State", "PID", "CPU", "RAM", "Restart", "Image"].map((column) => (
              <th key={column} scope="col" className="px-2 py-1.5 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {app.containers.map((container, index) => {
            const seed = app.id.length * 7 + index;
            const cpu = live ? drift(seed, tick, container.cpu, 0.3) : 0;
            const pid = app.runtime === "compose" ? "—" : String(1100 + seed * 13);
            return (
              <tr key={container.name} className="odd:bg-pg-stripe">
                <td className="px-2 py-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span aria-hidden="true" className={cn("size-2 rounded-full", statusDot[run.status])} />
                    {container.name}
                  </span>
                </td>
                <td className="px-2 py-1.5">{stateText(run, tick)}</td>
                <td className="px-2 py-1.5">{live ? pid : "—"}</td>
                <td className="px-2 py-1.5 tabular-nums">{cpu.toFixed(1).replace(".", ",")}%</td>
                <td className="px-2 py-1.5 tabular-nums">{live ? container.ram : "—"}</td>
                <td className="px-2 py-1.5 tabular-nums">{run.restarts || "—"}</td>
                <td className="pg-mono px-2 py-1.5 text-xs">{container.image}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ConfigView({ app }: { app: DemoApp }) {
  const { file, text } = appConfig(app);
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-2 text-xs text-pg-muted">
        <span className="pg-mono">{file}</span>
        <span className="rounded-sm bg-pg-good-bg px-1.5 font-semibold text-pg-good-text">✓ valid</span>
        <span className="ml-auto">Read-only here · edit it in Files</span>
      </p>
      <pre className="pg-mono overflow-x-auto rounded-lg bg-pg-stripe p-3 text-xs leading-relaxed">{text}</pre>
    </div>
  );
}

function EnvList({ app, shown, onToggle }: { app: DemoApp; shown: boolean; onToggle: () => void }) {
  if (app.env.length === 0) return <p className="text-pg-muted">No environment variables set for this app.</p>;
  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={onToggle} className="w-fit rounded-md bg-pg-field px-2.5 py-1">
        {shown ? "Hide Secrets" : "Show Secrets"}
      </button>
      <dl className="overflow-hidden rounded-lg border border-pg-line">
        {app.env.map(([key, value]) => (
          <div key={key} className="grid grid-cols-[2fr_3fr] gap-3 px-3 py-1.5 odd:bg-pg-stripe">
            <dt className="pg-mono text-xs text-pg-code-key">{key}</dt>
            <dd className="pg-mono truncate text-xs">{isSecretKey(key) && !shown ? "••••••••••" : value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function InfoView({ app }: { app: DemoApp }) {
  const general: [string, string][] = [
    ["Directory", app.path ?? "—"],
    ["Domain", app.domain ?? "—"],
    ["Port", app.port ? String(app.port) : "—"],
    ["Owner", app.user ?? "—"],
    ["Source", "Discovered"],
  ];
  const runtime: [string, string][] =
    app.runtime === "compose"
      ? [["Project", app.id], ["Compose file", `${app.path}/docker-compose.yml`], ["Docker runs as", "login account"]]
      : app.runtime === "pm2"
        ? [["PM2 home", `/${app.user ?? "home/deploy"}/.pm2`], ["Runs as", app.user ?? "deploy"]]
        : [["Unit file", `/etc/systemd/system/${app.id}.service`], ["Enabled", "yes"]];
  return (
    <div className="mx-auto flex max-w-160 flex-col gap-4">
      <InfoCard rows={general} />
      <div>
        <p className="mb-2 text-base font-semibold">{runtimeNames[app.runtime]}</p>
        <InfoCard rows={runtime} />
      </div>
    </div>
  );
}

function InfoCard({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="rounded-lg bg-pg-card px-3">
      {rows.map(([term, value]) => (
        <div key={term} className="flex justify-between gap-4 border-b border-pg-line py-2 last:border-b-0">
          <dt className="text-base">{term}</dt>
          <dd className="pg-mono truncate text-xs text-pg-muted">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
