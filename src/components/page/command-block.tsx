"use client";

import { Check, Copy } from "lucide-react";
import { useClipboard } from "@/components/ui/use-clipboard";

// One real shell command in a code line with a copy button, the static
// sibling of the home command console: same look, no typing effect, so it is
// fully readable without JavaScript. `caption` names what the command is
// for (for example "Docker Compose"); `labels` is the `copy` group of the
// common page copy (getPageCopy(lang, "common").copy).
export function CommandBlock({
  command,
  caption,
  labels,
}: {
  command: string;
  caption?: string;
  labels: { copy: string; copied: string; copyFailed: string };
}) {
  const { state, copy } = useClipboard();

  return (
    <figure className="flex flex-col gap-2">
      {caption && <figcaption className="text-sm font-medium text-soft">{caption}</figcaption>}
      <div className="flex min-h-14 items-center gap-3 rounded-xl border border-line bg-code pr-2 pl-4">
        <span aria-hidden="true" className="font-mono text-sm text-kicker">
          $
        </span>
        <div className="min-w-0 flex-1 overflow-x-auto py-3">
          <code className="font-mono text-[0.8125rem] whitespace-nowrap text-strong sm:text-sm lg:text-[0.9375rem]">
            {command}
          </code>
        </div>
        <button
          type="button"
          onClick={() => copy(command)}
          aria-label={state === "idle" ? labels.copy : undefined}
          className="type-small inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-2.5 font-medium text-body transition-colors hover:bg-heading/10 hover:text-heading sm:px-3 motion-reduce:transition-none"
        >
          {state === "copied" ? (
            <Check aria-hidden="true" className="size-4 text-tile-success" />
          ) : (
            <Copy aria-hidden="true" className="size-4" />
          )}
          <span aria-live="polite" className={state === "idle" ? "max-sm:sr-only" : undefined}>
            {state === "copied" ? labels.copied : state === "failed" ? labels.copyFailed : labels.copy}
          </span>
        </button>
      </div>
    </figure>
  );
}
