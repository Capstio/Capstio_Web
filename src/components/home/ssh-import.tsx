"use client";

import { KeyRound, Lock, Server } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionaries";
import { fill } from "@/lib/i18n";
import { exampleSshConfig, parseSshConfig } from "@/lib/ssh-config";

type MigrateDict = Dictionary["home"]["migrate"];

// The file name of a key path, for example ~/.ssh/id_ed25519 → id_ed25519.
function keyName(path: string) {
  return path.split(/[\\/]/).pop() ?? path;
}

const smallButton =
  "type-small h-9 rounded-md border border-line-strong px-3 font-medium text-heading transition-colors hover:bg-heading/10 motion-reduce:transition-none";

// "Switching is easy" (brief 8.4), the import half of Get started: paste
// ~/.ssh/config and see the hosts Capstio would import. The text is parsed in
// this component only: no request, no storage. Server-rendered with the
// example config, so the list is there before JavaScript runs. It sits under
// the section's h2, so its title is an h3 and the result title an h4. The
// editor and the result sit side by side when there is room for both.
export function SshImportColumn({ dict, className }: { dict: MigrateDict; className?: string }) {
  const [text, setText] = useState(exampleSshConfig);
  const { hosts, skippedPatterns } = useMemo(() => parseSshConfig(text), [text]);
  const id = useId();

  return (
    <div id="migrate" className={cn("flex flex-col gap-5 lg:gap-6", className)}>
      <div data-reveal-self className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-kicker uppercase">{dict.overline}</p>
        <h3 className="text-xl leading-7 font-bold text-balance text-strong lg:text-2xl lg:leading-8">
          {dict.title}
        </h3>
        <p className="text-sm leading-[1.3125rem] text-soft lg:text-[0.9375rem] lg:leading-6">
          {dict.subtitle}
        </p>
      </div>

      <div data-reveal className="grid gap-4 md:grid-cols-2 xl:gap-5">
        <div className="flex flex-col gap-3 rounded-[20px] border border-bento-line bg-bento-card p-4.75 lg:rounded-xl lg:p-5.75">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={`${id}-config`} className="font-mono text-sm font-medium text-strong">
              {dict.inputLabel}
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setText(exampleSshConfig)} className={smallButton}>
                {dict.example}
              </button>
              <button type="button" onClick={() => setText("")} className={smallButton}>
                {dict.clear}
              </button>
            </div>
          </div>
          <textarea
            id={`${id}-config`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={dict.placeholder}
            rows={14}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className="min-h-64 w-full resize-y rounded-xl border border-line bg-code p-4 font-mono text-[0.8125rem] leading-5 text-strong outline-none focus-visible:border-kicker"
          />
          <p className="flex items-center gap-2 text-sm text-soft">
            <Lock aria-hidden="true" className="size-4 shrink-0 text-tile-success" />
            {dict.privacy}
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-[20px] border border-bento-line bg-bento-card p-4.75 lg:rounded-xl lg:p-5.75">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="text-base font-semibold text-strong">{dict.resultTitle}</h4>
            <p aria-live="polite" className="text-sm text-soft">
              {fill(dict.count, { n: hosts.length })}
            </p>
          </div>

          {hosts.length === 0 ? (
            <p className="py-8 text-center text-sm text-soft">{dict.empty}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-bento-line">
              {hosts.map((host, index) => (
                <li key={`${host.alias}-${index}`} className="flex items-start gap-3 py-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-kicker/14 text-kicker"
                  >
                    <Server className="size-4" strokeWidth={1.8} />
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="truncate font-mono text-sm font-medium text-strong">{host.alias}</p>
                    <p className="truncate font-mono text-xs text-soft">
                      {host.user ? `${host.user}@` : ""}
                      {host.hostName ?? host.alias}
                      {host.port ? `:${host.port}` : ""}
                      {host.proxyJump ? ` · ${fill(dict.via, { host: host.proxyJump })}` : ""}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-soft">
                      <KeyRound aria-hidden="true" className="size-3" />
                      {host.identityFile ? keyName(host.identityFile) : dict.defaultKey}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {skippedPatterns > 0 && (
            <p className="mt-auto text-xs text-soft">{fill(dict.skipped, { n: skippedPatterns })}</p>
          )}
        </div>
      </div>
    </div>
  );
}
