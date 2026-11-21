"use client";

import { Check, Copy } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useClipboard } from "@/components/ui/use-clipboard";
import { useTypeOut } from "@/components/motion/use-type-out";
import { cn } from "@/lib/cn";
import {
  appActions,
  equivalentCommands,
  runtimeNames,
  runtimeShortNames,
  runtimes,
  type AppAction,
  type Runtime,
} from "@/lib/commands";
import type { Dictionary } from "@/lib/dictionaries";

type CommandDict = Dictionary["home"]["command"];

// The "equivalent command" console of the feature pages: pick how the
// example app runs and an action, and see the real shell command Capstio runs
// for it, typed out, with a copy button. Server-rendered on Docker Compose +
// Restart, so it reads correctly before (or without) JavaScript. The caller
// owns the section, heading and reveal motion.
export function CommandConsole({ dict }: { dict: CommandDict }) {
  const [runtime, setRuntime] = useState<Runtime>("compose");
  const [action, setAction] = useState<AppAction>("restart");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const commandRef = useRef<HTMLElement>(null);
  const id = useId();
  const { state, copy } = useClipboard();

  const command = equivalentCommands[runtime][action];
  useTypeOut(commandRef, command);

  // Arrow keys, Home and End move between runtimes (WAI-ARIA tabs pattern).
  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = runtimes.indexOf(runtime);
    const last = runtimes.length - 1;
    const next =
      event.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : event.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    setRuntime(runtimes[next]);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="flex w-full flex-col gap-6 rounded-[20px] border border-bento-line bg-bento-card p-4.75 lg:rounded-xl lg:p-7.75">
      {/* The example app, as a row of the Apps list. */}
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="size-2.5 rounded-full bg-tile-success" />
        <span className="font-mono text-base font-medium text-strong">api</span>
        <span className="text-sm text-soft">{dict.running}</span>
        <span className="ml-auto rounded-md border border-chip-line bg-chip px-2 py-0.5 text-xs font-medium text-chip-text">
          {runtimeNames[runtime]}
        </span>
      </div>

      {/* Controls as a two-row form: label on the left, control on the
          right from 640px; label above its control on phones. Both rows
          share the label column, so they always line up. */}
      <div className="grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-y-4">
          <p id={`${id}-runtime`} className="text-xs font-semibold text-soft uppercase">
            {dict.runtimeLabel}
          </p>
          {/* Each tab is as wide as its name, so "Docker Compose" never
              spills out of its pill. */}
          <div
            role="tablist"
            aria-labelledby={`${id}-runtime`}
            onKeyDown={onTabKeyDown}
            className="flex w-full rounded-full bg-control p-1 sm:w-fit"
          >
            {runtimes.map((item, index) => {
              const selected = item === runtime;
              return (
                <button
                  key={item}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`${id}-command`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setRuntime(item)}
                  className={cn(
                    "type-small h-9 flex-1 rounded-full px-4 whitespace-nowrap transition-colors motion-reduce:transition-none sm:flex-none",
                    selected ? "bg-action font-semibold text-on-action" : "text-muted hover:text-heading",
                  )}
                >
                  <span className="sm:hidden">{runtimeShortNames[item]}</span>
                  <span className="hidden sm:inline">{runtimeNames[item]}</span>
                </button>
              );
            })}
          </div>

          <p id={`${id}-action`} className="mt-2 text-xs font-semibold text-soft uppercase sm:mt-0">
            {dict.actionLabel}
          </p>
          <div role="group" aria-labelledby={`${id}-action`} className="flex flex-wrap gap-2">
            {appActions.map((item) => {
              const selected = item === action;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setAction(item)}
                  className={cn(
                    "type-small h-9 rounded-md border px-3 font-medium transition-colors motion-reduce:transition-none",
                    selected
                      ? "border-kicker bg-kicker/12 text-strong"
                      : "border-line-strong text-body hover:bg-heading/10",
                  )}
                >
                  {dict.actions[item]}
                </button>
              );
            })}
          </div>
      </div>

      {/* The equivalent command. Fixed height and no wrapping, so typing
          and switching never move anything around it. */}
      <div
        id={`${id}-command`}
        role="tabpanel"
        aria-live="polite"
        className="flex h-14 items-center gap-3 rounded-xl border border-line bg-code pr-2 pl-4"
      >
        <span aria-hidden="true" className="font-mono text-sm text-kicker">
          $
        </span>
        <div className="min-w-0 flex-1 overflow-x-auto">
          <code ref={commandRef} className="font-mono text-[0.8125rem] whitespace-nowrap text-strong sm:text-sm lg:text-[0.9375rem]">
            {command}
          </code>
        </div>
        <button
          type="button"
          onClick={() => copy(command)}
          aria-label={state === "idle" ? dict.copy : undefined}
          className="type-small inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-2.5 font-medium sm:px-3 text-body transition-colors hover:bg-heading/10 hover:text-heading motion-reduce:transition-none"
        >
          {state === "copied" ? (
            <Check aria-hidden="true" className="size-4 text-tile-success" />
          ) : (
            <Copy aria-hidden="true" className="size-4" />
          )}
          <span aria-live="polite" className={state === "idle" ? "max-sm:sr-only" : undefined}>
            {state === "copied" ? dict.copied : state === "failed" ? dict.copyFailed : dict.copy}
          </span>
        </button>
      </div>

      <p className="text-sm text-soft">{dict.note}</p>
    </div>
  );
}
