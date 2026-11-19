"use client";

import {
  ChevronRight,
  ChevronUp,
  Code,
  Eye,
  EyeOff,
  FileCode2,
  FileLock2,
  Folder,
  History,
  IndentIncrease,
  Lock,
  Search,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState, type KeyboardEvent, type SyntheticEvent } from "react";
import { ConfigCallouts, type ConfigCalloutsDict } from "@/components/home/safe-config";
import { cn } from "@/lib/cn";
import { isSecretKey, splitEnvLine, validateEnv } from "@/lib/env-file";
import { appsHostId, envFileName, files, filesFolder, type DemoFile } from "@/lib/playground-data";
import { envDirty, type ScreenProps } from "./playground-state";
import { OnlyOnDemoHost } from "./window-chrome";

// Files tab of one host: the shop-web folder and the safe editor with the
// .env open. The editor checks syntax as you type, hides secrets until asked,
// and keeps a backup of every save that the callouts can restore.

const fileIcon: Record<DemoFile["kind"], { icon: LucideIcon; tone: string }> = {
  env: { icon: FileLock2, tone: "text-pg-orange" },
  yaml: { icon: FileCode2, tone: "text-pg-accent" },
  nginx: { icon: SlidersHorizontal, tone: "text-pg-purple" },
};
const syntaxName: Record<DemoFile["kind"], string> = { env: "ENV", yaml: "YAML", nginx: "NGINX" };

const clock = () =>
  new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export function FilesScreen({ dict, ...props }: ScreenProps & { dict: ConfigCalloutsDict }) {
  const { state, send } = props;
  if (state.hostId !== appsHostId) {
    return <OnlyOnDemoHost hostId={state.hostId} what="files" onOpen={() => send({ type: "host", hostId: appsHostId })} />;
  }

  const check = validateEnv(state.envText);
  const latest = state.backups.at(-1);

  return (
    <div className="relative flex h-full">
      <FileList {...props} />
      <Editor {...props} />
      {latest && (
        <ConfigCallouts
          dict={dict}
          errorLine={check.ok ? null : check.line}
          file={envFileName}
          backupTime={latest.time}
          versions={state.backups.length}
          onRestore={() => send({ type: "restoreEnv", time: clock() })}
          className="absolute bottom-4 left-4 max-md:bottom-9 max-md:left-3"
        />
      )}
    </div>
  );
}

function FileList({ state, send, onInert }: ScreenProps) {
  return (
    <div className="flex w-115 shrink-0 flex-col border-r border-pg-line max-md:hidden">
      <div className="flex h-10 items-center gap-1 px-3 text-base text-pg-muted">
        <button type="button" aria-label="Up one folder" aria-disabled="true" onClick={onInert}>
          <ChevronUp aria-hidden="true" className="size-4" />
        </button>
        <span className="ml-1">/</span>
        {filesFolder.map((part) => (
          <span key={part} className="inline-flex items-center gap-1">
            <ChevronRight aria-hidden="true" className="size-3" />
            <Folder aria-hidden="true" className="size-4 fill-pg-accent/70 text-pg-accent" strokeWidth={1.4} />
            {part}
          </span>
        ))}
      </div>
      <table className="w-full text-left text-base">
        <thead className="border-b border-pg-line text-sm text-pg-muted">
          <tr>
            <th scope="col" className="px-4 py-1.5 font-medium">Name</th>
            <th scope="col" className="px-2 py-1.5 text-right font-medium">Size</th>
            <th scope="col" className="px-4 py-1.5 font-medium">Date Modified</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const { icon: Icon, tone } = fileIcon[file.kind];
            const selected = file.name === state.file;
            return (
              <tr key={file.name} className={selected ? "bg-pg-accent text-pg-on-accent" : "even:bg-pg-stripe"}>
                <td className="p-0">
                  <button
                    type="button"
                    onClick={() => send({ type: "openFile", name: file.name })}
                    className="flex w-full items-center gap-2 px-4 py-1.5 text-left font-medium"
                  >
                    <Icon aria-hidden="true" className={cn("size-4", selected ? "" : tone)} strokeWidth={1.6} />
                    {file.name}
                  </button>
                </td>
                <td className={cn("px-2 py-1.5 text-right", !selected && "text-pg-muted")}>{file.size}</td>
                <td className={cn("px-4 py-1.5", !selected && "text-pg-muted")}>23:34</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Editor({ state, send, onInert }: ScreenProps) {
  const [caret, setCaret] = useState({ line: 1, column: 1 });
  const file = files.find((item) => item.name === state.file);
  const isEnv = file?.kind === "env";
  const text = isEnv ? state.envText : (file?.text ?? "");
  const check = isEnv ? validateEnv(text) : ({ ok: true } as const);
  const dirty = isEnv && envDirty(state);
  const editable = isEnv && state.secretsShown;
  const lines = text.split("\n");

  function save() {
    send({ type: "saveEnv", time: clock() });
  }

  function trackCaret(event: SyntheticEvent<HTMLTextAreaElement>) {
    const before = event.currentTarget.value.slice(0, event.currentTarget.selectionStart).split("\n");
    setCaret({ line: before.length, column: before[before.length - 1].length + 1 });
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      save();
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-10 shrink-0 items-center gap-1 overflow-x-auto px-2">
        {state.openFiles.map((name) => {
          const selected = name === state.file;
          return (
            <span
              key={name}
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-md pr-1 pl-3",
                selected ? "bg-pg-accent text-pg-on-accent" : "bg-pg-field",
              )}
            >
              <button type="button" aria-current={selected ? "true" : undefined} onClick={() => send({ type: "openFile", name })}>
                {name}
              </button>
              <button
                type="button"
                aria-label={`Close ${name}`}
                onClick={() => send({ type: "closeFile", name })}
                className="inline-flex size-5 items-center justify-center rounded-sm hover:bg-pg-selected"
              >
                <X aria-hidden="true" className="size-3" />
              </button>
            </span>
          );
        })}
      </div>

      {!file ? (
        <p className="flex flex-1 items-center justify-center text-pg-muted">Select a file to open it.</p>
      ) : (
        <>
          <div className="flex h-9 shrink-0 items-center gap-2 border-y border-pg-line px-3">
            <span className="pg-mono truncate text-xs text-pg-muted">
              /home/deploy/apps/shop-web/{file.name}
            </span>
            <span
              aria-live="polite"
              className={cn(
                "shrink-0 rounded-sm px-1.5 text-xs font-semibold",
                check.ok ? "bg-pg-good-bg text-pg-good-text" : "bg-pg-bad-bg text-pg-red",
              )}
            >
              {syntaxName[file.kind]} {check.ok ? "✓ valid" : `✕ line ${check.line}: ${check.message}`}
            </span>
            <span className="ml-auto flex items-center gap-0.5 max-md:hidden">
              {isEnv && (
                <button
                  type="button"
                  aria-label={state.secretsShown ? "Hide secrets" : "Show secrets"}
                  aria-pressed={state.secretsShown}
                  onClick={() => send({ type: "secrets", shown: !state.secretsShown })}
                  className="inline-flex size-6.5 items-center justify-center rounded-md hover:bg-pg-field"
                >
                  {state.secretsShown ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
                </button>
              )}
              {[
                { icon: Search, label: "Find" },
                { icon: IndentIncrease, label: "Indent" },
                { icon: History, label: "Version history" },
                { icon: Code, label: "Syntax" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  aria-disabled="true"
                  onClick={onInert}
                  className="inline-flex size-6.5 items-center justify-center rounded-md hover:bg-pg-field"
                >
                  <Icon aria-hidden="true" className="size-4" strokeWidth={1.6} />
                </button>
              ))}
            </span>
            {isEnv && (
              <button
                type="button"
                onClick={save}
                disabled={!dirty || !check.ok}
                className="ml-1 rounded-md bg-pg-accent px-3 py-0.5 text-pg-on-accent disabled:bg-pg-field disabled:text-pg-muted max-md:ml-auto"
              >
                Save
              </button>
            )}
          </div>

          {isEnv && !state.secretsShown && (
            <div className="flex shrink-0 items-center gap-2 bg-pg-banner px-3 py-1.5">
              <Lock aria-hidden="true" className="size-3.5 text-pg-orange" />
              <span className="min-w-0 flex-1">Secret values are hidden. Click “Show Secrets” to edit them.</span>
              <button
                type="button"
                onClick={() => send({ type: "secrets", shown: true })}
                className="shrink-0 rounded-md bg-pg-field px-2.5 py-0.5"
              >
                Show Secrets
              </button>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-auto">
            <div className="pg-mono grid min-h-full grid-cols-[auto_1fr] text-sm leading-5">
              <div aria-hidden="true" className="border-r border-pg-line px-3 py-2 text-right text-pg-muted select-none">
                {lines.map((_, index) => (
                  <div key={index}>{index + 1}</div>
                ))}
              </div>
              <div className="relative min-w-0 px-3 py-2">
                <pre aria-hidden={editable} className="whitespace-pre">
                  {lines.map((line, index) => (
                    <div key={index}>
                      {isEnv ? <EnvLine line={line} masked={!state.secretsShown} /> : line || " "}
                    </div>
                  ))}
                </pre>
                {editable && (
                  <textarea
                    value={text}
                    onChange={(event) => send({ type: "editEnv", text: event.target.value })}
                    onSelect={trackCaret}
                    onKeyDown={onKeyDown}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                    wrap="off"
                    aria-label={`Edit ${file.name}`}
                    className="absolute inset-0 resize-none overflow-hidden bg-transparent px-3 py-2 whitespace-pre text-transparent caret-pg-text outline-none"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex h-6 shrink-0 items-center gap-4 border-t border-pg-line px-3 text-xs text-pg-muted">
            <span>{dirty ? "● Unsaved" : "✓ Saved"}</span>
            <span className="ml-auto">
              Line {caret.line}, column {caret.column}
            </span>
            <span className="max-md:hidden">UTF-8 · LF · {syntaxName[file.kind]}</span>
            <span className="max-md:hidden">Automatic backup: on</span>
          </div>
        </>
      )}
    </div>
  );
}

// One .env line with the key coloured and, until "Show Secrets", the value
// of a secret key replaced by dots.
function EnvLine({ line, masked }: { line: string; masked: boolean }) {
  const pair = splitEnvLine(line);
  if (!pair) return <span className={line.trimStart().startsWith("#") ? "text-pg-muted" : ""}>{line || " "}</span>;
  const hidden = masked && isSecretKey(pair.key.trim());
  return (
    <>
      <span className="text-pg-code-key">{pair.key}</span>
      <span className="text-pg-muted">=</span>
      {hidden ? "••••••••••" : pair.value}
    </>
  );
}
