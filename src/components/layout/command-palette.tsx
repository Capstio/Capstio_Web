"use client";

import { ArrowRight, Check, Command, Copy, Download, FileText, Languages, Search, SunMoon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useClipboard } from "@/components/ui/use-clipboard";
import { cn } from "@/lib/cn";
import { equivalentCommands } from "@/lib/commands";
import type { Dictionary } from "@/lib/dictionaries";
import { localizePath, locales, openInLocale, type Locale } from "@/lib/i18n";
import { downloadHref, palettePages } from "@/lib/site-nav";
import { voyage } from "@/lib/voyage";
import { toggleTheme } from "./theme-toggle";

type PaletteDict = Dictionary["palette"];
// Every equivalent command, once.
const commands = [
  ...new Set(Object.values(equivalentCommands).flatMap((byAction) => Object.values(byAction))),
];

// The event the header buttons send to open the palette, so desktop and
// mobile triggers can live in different places of the header.
const openEvent = "capstio:open-palette";

// What choosing an item does; carried as data so the list can be built
// during render and the action runs only in the event handler.
type Action =
  | { type: "navigate"; href: string }
  | { type: "download" }
  | { type: "theme" }
  | { type: "language"; locale: Locale }
  | { type: "copy"; text: string };

// Display order of the groups.
const groupOrder = ["goTo", "pages", "actions", "commands"] as const;
type Group = (typeof groupOrder)[number];

type Item = {
  id: string;
  group: Group;
  label: string;
  icon: typeof Search;
  action: Action;
  mono?: boolean;
};

// Lowercase without diacritics, so "bang gia" finds "Bảng giá".
function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();
}

// Opens the palette from anywhere in the header.
export function PaletteTrigger({
  label,
  shortcut,
  className,
  round = false,
}: {
  label: string;
  shortcut?: string;
  className?: string;
  // Round the key hint too, when the trigger itself is round.
  round?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(openEvent))}
      aria-label={label}
      aria-keyshortcuts="Meta+K Control+K"
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-md text-body transition-colors hover:bg-heading/10 hover:text-heading motion-reduce:transition-none",
        shortcut ? "w-9 justify-center xl:w-auto xl:px-2.5" : "w-9 justify-center",
        className,
      )}
    >
      <Search aria-hidden="true" className="size-4" />
      {shortcut && (
        <kbd
          className={cn(
            "hidden border border-line px-1.5 font-sans text-xs text-muted transition-[border-radius] duration-200 motion-reduce:transition-none xl:inline",
            round ? "rounded-full px-2" : "rounded",
          )}
        >
          {shortcut}
        </kbd>
      )}
    </button>
  );
}

// ⌘K / Ctrl+K command palette, like the app's quick command bar: jump to a
// home section or another page, download, switch theme or language, or copy an equivalent
// command. A native <dialog>: focus stays inside, Escape closes it and focus
// returns to the trigger.
export function CommandPalette({ lang, dict }: { lang: Locale; dict: PaletteDict }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState<"copied" | "failed" | null>(null);
  const { copy } = useClipboard();
  const router = useRouter();
  const id = useId();

  const close = useCallback(() => dialogRef.current?.close(), []);

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    setQuery("");
    setActive(0);
    dialog.showModal();
    inputRef.current?.focus();
  }, []);

  // ⌘K / Ctrl+K anywhere, and the header buttons.
  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(openEvent, open);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(openEvent, open);
    };
  }, [open, close]);

  const items = useMemo<Item[]>(() => {
    const home = localizePath(lang, "/");
    const otherLocale = locales.find((locale) => locale !== lang) ?? lang;
    return [
      // The home page's legs, in page order (lib/voyage).
      ...voyage.map((leg) => ({
        id: `section-${leg.key}`,
        group: "goTo" as const,
        label: dict.sections[leg.key],
        icon: ArrowRight,
        action: { type: "navigate" as const, href: `${home}#${leg.id}` },
      })),
      // The site's real pages (lib/site-nav).
      ...palettePages.map((page) => ({
        id: `page-${page.id}`,
        group: "pages" as const,
        label: dict.pages[page.id],
        icon: FileText,
        action: { type: "navigate" as const, href: localizePath(lang, page.href) },
      })),
      { id: "download", group: "actions", label: dict.actions.download, icon: Download, action: { type: "download" } },
      { id: "theme", group: "actions", label: dict.actions.theme, icon: SunMoon, action: { type: "theme" } },
      {
        id: "language",
        group: "actions",
        label: dict.actions.language,
        icon: Languages,
        action: { type: "language", locale: otherLocale },
      },
      ...commands.map((command) => ({
        id: `command-${command}`,
        group: "commands" as const,
        label: command,
        icon: Copy,
        mono: true,
        action: { type: "copy" as const, text: command },
      })),
    ];
  }, [lang, dict]);

  async function choose(item: Item) {
    const { action } = item;
    switch (action.type) {
      case "navigate":
        close();
        router.push(action.href);
        break;
      case "download":
        close();
        window.location.assign(downloadHref);
        break;
      case "theme":
        toggleTheme();
        close();
        break;
      case "language":
        openInLocale(action.locale);
        break;
      case "copy":
        setToast(await copy(action.text) === "copied" ? "copied" : "failed");
        close();
        setTimeout(() => setToast(null), 2500);
        break;
    }
  }

  const results = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    if (!words.length) return items;
    return items.filter((item) => {
      const text = normalize(`${item.label} ${dict.groups[item.group]}`);
      return words.every((word) => text.includes(word));
    });
  }, [items, query, dict.groups]);

  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));
  const activeItem = results[activeIndex];

  // Keep the highlighted option in view while moving with the arrow keys.
  useEffect(() => {
    if (!activeItem) return;
    document.getElementById(`${id}-${activeItem.id}`)?.scrollIntoView({ block: "nearest" });
  }, [activeItem, id]);

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((results.length + activeIndex + step) % Math.max(results.length, 1));
    } else if (event.key === "Enter" && activeItem) {
      event.preventDefault();
      void choose(activeItem);
    }
  }

  const groups = groupOrder
    .map((group) => ({ group, items: results.filter((item) => item.group === group) }))
    .filter(({ items: groupItems }) => groupItems.length > 0);

  return (
    <>
      <dialog
        ref={dialogRef}
        aria-label={dict.title}
        onClick={(event) => {
          // A click on the backdrop (the dialog element itself) closes it.
          if (event.target === event.currentTarget) close();
        }}
        className="m-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-line bg-surface p-0 text-body shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search aria-hidden="true" className="size-4 shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder={dict.placeholder}
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-list`}
            aria-activedescendant={activeItem ? `${id}-${activeItem.id}` : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            className="h-13 min-w-0 flex-1 bg-transparent text-[0.9375rem] text-strong outline-none placeholder:text-muted"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-sans text-xs text-muted">esc</kbd>
        </div>

        <div id={`${id}-list`} role="listbox" aria-label={dict.title} className="max-h-[min(24rem,60vh)] overflow-y-auto p-2">
          {groups.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted">{dict.empty}</p>}
          {groups.map(({ group, items: groupItems }) => (
            <div key={group} role="group" aria-label={dict.groups[group]} className="pb-1">
              <p className="px-3 pt-2 pb-1 text-xs font-semibold text-muted uppercase">{dict.groups[group]}</p>
              {groupItems.map((item) => {
                const selected = item === activeItem;
                return (
                  <div
                    key={item.id}
                    id={`${id}-${item.id}`}
                    role="option"
                    aria-selected={selected}
                    onMouseMove={() => setActive(results.indexOf(item))}
                    onClick={() => void choose(item)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm",
                      selected ? "bg-heading/10 text-heading" : "text-body",
                    )}
                  >
                    <item.icon aria-hidden="true" className="size-4 shrink-0 text-muted" />
                    <span className={cn("truncate", item.mono && "font-mono text-[0.8125rem]")}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-line px-4 py-2 text-xs text-muted">
          <Command aria-hidden="true" className="size-3.5" />
          {dict.title}
        </div>
      </dialog>

      <div
        role="status"
        className={cn(
          "pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 transition-opacity duration-200 motion-reduce:transition-none",
          toast ? "opacity-100" : "opacity-0",
        )}
      >
        {toast && (
          <span className="inline-flex items-center gap-2 rounded-full bg-heading px-4 py-2 text-sm font-medium text-page shadow-lg">
            {toast === "copied" && <Check aria-hidden="true" className="size-4" />}
            {toast === "copied" ? dict.copied : dict.copyFailed}
          </span>
        )}
      </div>
    </>
  );
}
