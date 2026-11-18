"use client";

import { Info, OctagonAlert, ShieldCheck, TriangleAlert, type LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { commandRisk, demoHost, exampleCommands, type RiskLevel } from "@/lib/command-risk";
import type { Dictionary } from "@/lib/dictionaries";
import { fill } from "@/lib/i18n";

type DangerDict = Dictionary["home"]["danger"];

const levelStyle: Record<RiskLevel, { icon: LucideIcon; tone: string; line: string }> = {
  safe: { icon: ShieldCheck, tone: "bg-tile-success/14 text-tile-success", line: "border-tile-success/40" },
  confirm: { icon: TriangleAlert, tone: "bg-tile-warning/14 text-tile-warning", line: "border-tile-warning/40" },
  dangerous: { icon: OctagonAlert, tone: "bg-tile-danger/14 text-tile-danger", line: "border-tile-danger/50" },
};

type Outcome = "pending" | "ran" | "confirmed" | "cancelled";

// The "dangerous commands" console of the home Try it section: a
// terminal-style input. Enter sorts the command by risk (lib/command-risk);
// commands that need confirmation get Run / Cancel, dangerous ones ask for the
// host name typed back. A browser simulation only: nothing is sent or run, and
// the disclaimer under the console says so. The caller owns the section,
// heading and reveal motion.
export function DangerConsole({ dict }: { dict: DangerDict }) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState<{ command: string; level: RiskLevel } | null>(null);
  const [outcome, setOutcome] = useState<Outcome>("pending");
  const [hostInput, setHostInput] = useState("");
  const hostRef = useRef<HTMLInputElement>(null);
  const id = useId();

  // A dangerous command moves focus to the host name field.
  useEffect(() => {
    if (submitted?.level === "dangerous" && outcome === "pending") hostRef.current?.focus();
  }, [submitted, outcome]);

  function run(command: string) {
    if (!command.trim()) return;
    const level = commandRisk(command);
    setSubmitted({ command: command.trim(), level });
    setOutcome(level === "safe" ? "ran" : "pending");
    setHostInput("");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    run(input);
  }

  function tryExample(command: string) {
    setInput(command);
    run(command);
  }

  const style = submitted && levelStyle[submitted.level];
  const level = submitted && dict.levels[submitted.level];
  const hostMatches = hostInput.trim() === demoHost;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="overflow-hidden rounded-[20px] border border-bento-line bg-bento-card lg:rounded-xl">
        {/* Window bar, as in the app's terminal. */}
        <div className="flex items-center gap-2 border-b border-bento-line px-4 py-3">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
          </span>
          <span className="mx-auto font-mono text-xs text-soft">deploy@{demoHost}</span>
        </div>

        <form onSubmit={onSubmit} className="flex items-center gap-2 px-4 py-4 lg:px-6">
          <label htmlFor={`${id}-command`} className="sr-only">
            {dict.inputLabel}
          </label>
          <span aria-hidden="true" className="shrink-0 font-mono text-sm text-tile-success">
            <span className="max-sm:hidden">deploy@{demoHost}:</span>~$
          </span>
          <input
            id={`${id}-command`}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={dict.placeholder}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            className="min-w-0 flex-1 bg-transparent font-mono text-sm text-strong outline-none placeholder:text-muted"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 border-t border-bento-line px-4 py-3 lg:px-6">
          <span className="text-xs font-medium text-soft">{dict.tryLabel}</span>
          {exampleCommands.map((command) => (
            <button
              key={command}
              type="button"
              onClick={() => tryExample(command)}
              className="rounded-md border border-chip-line bg-chip px-2 py-1 font-mono text-xs text-chip-text transition-colors hover:border-kicker motion-reduce:transition-none"
            >
              {command}
            </button>
          ))}
        </div>
      </div>

      {/* Result. role=status reads each verdict out; the panel keeps a
          minimum height so the page below does not jump. */}
      <div role="status" className="min-h-30">
        {submitted && style && level && (
          <div
            onKeyDown={(event) => {
              if (event.key === "Escape" && outcome === "pending") setOutcome("cancelled");
            }}
            className={cn("flex flex-col gap-3 rounded-lg border bg-bento-card p-4 lg:p-5", style.line)}
          >
            <div className="flex items-center gap-3">
              <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-[10px]", style.tone)}>
                <style.icon aria-hidden="true" className="size-4.5" strokeWidth={1.8} />
              </span>
              <div className="flex min-w-0 flex-col">
                <p className="text-[0.9375rem] font-semibold text-strong">{level.label}</p>
                <code className="truncate font-mono text-xs text-soft">{submitted.command}</code>
              </div>
            </div>
            <p className="text-sm text-body">{level.body}</p>

            {outcome === "pending" && submitted.level === "dangerous" && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (hostMatches) setOutcome("confirmed");
                }}
                className="flex flex-wrap items-center gap-2"
              >
                <label htmlFor={`${id}-host`} className="w-full text-sm text-soft">
                  {fill(dict.confirmPrompt, { host: demoHost })}
                </label>
                <input
                  ref={hostRef}
                  id={`${id}-host`}
                  value={hostInput}
                  onChange={(event) => setHostInput(event.target.value)}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="h-10 min-w-0 flex-1 rounded-md border border-line-strong bg-transparent px-3 font-mono text-sm text-strong outline-none focus-visible:border-kicker"
                />
                <button
                  type="submit"
                  disabled={!hostMatches}
                  className="type-small h-10 rounded-md bg-tile-danger px-4 font-semibold text-on-action transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {dict.run}
                </button>
                <button
                  type="button"
                  onClick={() => setOutcome("cancelled")}
                  className="type-small h-10 rounded-md border border-line-strong px-4 font-medium text-heading hover:bg-heading/10"
                >
                  {dict.cancel}
                </button>
              </form>
            )}

            {outcome === "pending" && submitted.level === "confirm" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOutcome("confirmed")}
                  className="type-small h-10 rounded-md bg-action px-4 font-semibold text-on-action hover:bg-action-hover"
                >
                  {dict.run}
                </button>
                <button
                  type="button"
                  onClick={() => setOutcome("cancelled")}
                  className="type-small h-10 rounded-md border border-line-strong px-4 font-medium text-heading hover:bg-heading/10"
                >
                  {dict.cancel}
                </button>
              </div>
            )}

            {outcome !== "pending" && (
              <p className="text-sm font-medium text-strong">
                {outcome === "ran" ? dict.ranSafe : outcome === "confirmed" ? dict.ranConfirmed : dict.cancelled}
              </p>
            )}
          </div>
        )}
      </div>

      <p className="flex items-start gap-2 text-sm text-soft">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        {dict.simulation}
      </p>
    </div>
  );
}
