import { Check, EyeOff, History, ShieldCheck, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionaries";
import { fill } from "@/lib/i18n";

// The "Safe config" view of the product tour: the icons of its three points
// (home.safeConfig) and the two callouts that float over the playground's
// .env editor and repeat what it does, live.

type SafeConfigDict = Dictionary["home"]["safeConfig"];
export type ConfigCalloutsDict = Pick<
  SafeConfigDict,
  "syntaxValid" | "syntaxError" | "backupTitle" | "backupMeta" | "restore"
>;

// Icons of the three points, in dictionary order (Figma "icon/syntax-guard",
// "icon/backup-history", "icon/secret-mask").
export const configPointIcons: LucideIcon[] = [ShieldCheck, History, EyeOff];

const callout =
  "flex w-fit items-center rounded-lg border bg-callout text-xs leading-[1.36] font-semibold text-callout-text";

// The syntax result of the open .env and its latest backup, with a working
// Restore. They sit in the empty space under the file list, so they never
// cover a control; phones only get the syntax one, as in Figma.
export function ConfigCallouts({
  dict,
  errorLine,
  file,
  backupTime,
  versions,
  onRestore,
  className,
}: {
  dict: ConfigCalloutsDict;
  errorLine: number | null;
  file: string;
  backupTime: string;
  versions: number;
  onRestore: () => void;
  className?: string;
}) {
  const valid = errorLine === null;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p
        aria-live="polite"
        className={cn(
          callout,
          "gap-2 py-2 pr-3 pl-2.5",
          valid
            ? "border-callout-good-line shadow-(--sp-callout-good-shadow)"
            : "border-pg-red/50 shadow-(--sp-callout-shadow)",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex size-4 items-center justify-center rounded-full",
            valid ? "bg-callout-check text-callout-check-mark" : "bg-pg-red text-pg-on-accent",
          )}
        >
          {valid ? <Check className="size-2.5" strokeWidth={4} /> : <TriangleAlert className="size-2.5" strokeWidth={3} />}
        </span>
        {valid ? dict.syntaxValid : fill(dict.syntaxError, { line: errorLine })}
      </p>

      <div className={cn(callout, "gap-2.5 border-callout-line p-2.25 shadow-(--sp-callout-shadow) max-md:hidden")}>
        <span className="inline-flex size-6 items-center justify-center rounded-md bg-callout-tile text-kicker">
          <History aria-hidden="true" className="size-3.5" strokeWidth={2.2} />
        </span>
        <span className="flex flex-col gap-px">
          <span>{dict.backupTitle}</span>
          <span className="font-mono text-[0.85em] leading-[1.3] font-normal text-callout-meta">
            {fill(dict.backupMeta, { file, time: backupTime, count: versions })}
          </span>
        </span>
        <button
          type="button"
          onClick={onRestore}
          className="ml-2.5 rounded-md bg-callout-button px-2.25 py-1 text-[0.9em] text-kicker hover:underline"
        >
          {dict.restore}
        </button>
      </div>
    </div>
  );
}
