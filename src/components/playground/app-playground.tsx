"use client";

import { useParams } from "next/navigation";
import {
  useEffect,
  useEffectEvent,
  useReducer,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import type { ConfigCalloutsDict } from "@/components/home/safe-config";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionaries";
import { fill, hasLocale, localizePath } from "@/lib/i18n";
import { downloadGuideHref } from "@/lib/site-nav";
import { AppsScreen } from "./apps-screen";
import { FilesScreen } from "./files-screen";
import { FleetScreen } from "./fleet-screen";
import { HostSidebar } from "./host-sidebar";
import { bubbleWidth, InertBoat, type InertSpot } from "./inert-boat";
import { initialState, reducer, tickSeconds, type Screen, type ScreenProps } from "./playground-state";
import { HostTabs, StatusBar, Toolbar } from "./window-chrome";

export type { Screen } from "./playground-state";

export type PlaygroundDict = Dictionary["home"]["playground"] & { config: ConfigCalloutsDict };

const reducedMotion = "(prefers-reduced-motion: reduce)";
const hintMs = 5000;
const boatRoom = 8;
// Every fifth click the boat spins and asks again; the third gets its own line.
const persistentAt = 3;
const inviteEvery = 5;
const allScreens: readonly Screen[] = ["apps", "files", "fleet"];

type Hint = { spot: InertSpot; text: string; spin?: boolean };

// The name of the clicked control for the boat's line: its label, or its
// text without the ⌘ shortcut and a trailing count ("⌘3 Docker", "Alerts2").
function controlName(element: HTMLElement): string {
  const raw = element.getAttribute("aria-label") ?? element.textContent ?? "";
  return raw.replace(/^⌘\d\s*/, "").replace(/\d+$/, "").trim();
}

// The Capstio window as an interactive demo, in place of the product
// screenshots: hosts, Apps, the Files .env editor and All VPS work on sample
// data in the browser; nothing is sent anywhere. The home hero's tabs control the
// screen (`screen` + `onScreenChange`, kept in sync both ways); other pages
// just pick the first one (`initialScreen`).
export function AppPlayground({
  dict,
  screen,
  onScreenChange,
  initialScreen = "apps",
}: {
  dict: PlaygroundDict;
  screen?: Screen;
  onScreenChange?: (screen: Screen) => void;
  initialScreen?: Screen;
}) {
  const [state, send] = useReducer(reducer, screen ?? initialScreen, initialState);
  const [hint, setHint] = useState<Hint | null>(null);
  const [hintHeld, setHintHeld] = useState(false);
  const hintRef = useRef<HTMLDivElement>(null);
  const showHint = (next: Hint | null) => {
    setHint(next);
    setHintHeld(false);
  };
  const [visited, setVisited] = useState<Screen[]>([screen ?? initialScreen]);
  const rootRef = useRef<HTMLDivElement>(null);
  const hintCount = useRef(0);
  const { lang } = useParams<{ lang?: string }>();
  const downloadHref =
    typeof lang === "string" && hasLocale(lang) ? localizePath(lang, downloadGuideHref) : downloadGuideHref;

  // Follow the hero tabs: a new `screen` from outside moves the window.
  const [followed, setFollowed] = useState(screen);
  if (screen !== followed) {
    setFollowed(screen);
    if (screen && screen !== state.screen) send({ type: "screen", screen });
  }

  // And tell the hero tabs when the window moves itself.
  const reportScreen = useEffectEvent((next: Screen) => {
    if (next !== screen) onScreenChange?.(next);
  });
  useEffect(() => reportScreen(state.screen), [state.screen]);

  // Live readings tick only while the window is on screen and motion is
  // welcome.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const motion = window.matchMedia(reducedMotion);
    let visible = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const update = () => {
      clearInterval(timer);
      if (visible && !motion.matches) timer = setInterval(() => send({ type: "tick" }), tickSeconds * 1000);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) showHint(null);
      update();
    });
    observer.observe(node);
    motion.addEventListener("change", update);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", update);
      clearInterval(timer);
    };
  }, []);

  // A restart takes a moment, or none with reduced motion.
  const restarting = Object.keys(state.runs).filter((id) => state.runs[id].status === "restarting").join();
  useEffect(() => {
    if (!restarting) return;
    const delay = window.matchMedia(reducedMotion).matches ? 0 : 1500;
    const timer = setTimeout(() => {
      for (const appId of restarting.split(",")) send({ type: "settle", appId });
    }, delay);
    return () => clearTimeout(timer);
  }, [restarting]);

  // The boat leaves after a while, but stays while the visitor reads it.
  useEffect(() => {
    if (!hint || hintHeld) return;
    const timer = setTimeout(() => setHint(null), hintMs);
    return () => clearTimeout(timer);
  }, [hint, hintHeld]);

  // A click or tap anywhere else, or Escape, sends the boat away at once.
  useEffect(() => {
    if (!hint) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!hintRef.current?.contains(event.target as Node)) showHint(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") showHint(null);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [hint]);

  // Once all three screens have been seen, the boat congratulates the
  // visitor at the top of the window.
  if (!visited.includes(state.screen)) {
    const next = [...visited, state.screen];
    setVisited(next);
    if (allScreens.every((item) => next.includes(item))) {
      showHint({
        spot: { left: 0, top: 64, width: bubbleWidth, below: true, tail: bubbleWidth / 2, centered: true },
        text: dict.tourDone,
        spin: true,
      });
    }
  }

  // What the boat says: a line about the clicked view when it has one, the
  // general lines in turn otherwise, and a word on persistence now and then.
  function inertLine(name: string): { text: string; spin: boolean } {
    const count = ++hintCount.current;
    if (count % inviteEvery === 0) return { text: dict.inertInvite, spin: true };
    if (count === persistentAt) return { text: dict.inertPersistent, spin: false };
    const views: Record<string, string> = dict.inertViews;
    const line = views[name] ?? dict.inertLines[count % dict.inertLines.length];
    return { text: fill(line, { view: name }), spin: false };
  }

  // A part of the app the demo does not simulate: the boat sails up next to
  // it, under it in the upper part of the window and above it lower down, so
  // the line shows where the visitor is looking.
  function onInert(event: MouseEvent<HTMLElement>) {
    const wrapper = rootRef.current;
    if (!wrapper) return;
    const box = wrapper.getBoundingClientRect();
    const target = event.currentTarget.getBoundingClientRect();
    const width = Math.min(bubbleWidth, box.width - boatRoom - 8);
    const center = target.left + target.width / 2 - box.left;
    const left = Math.min(Math.max(center - width / 2, 0), box.width - width - boatRoom);
    const below = target.top + target.height / 2 - box.top < box.height * 0.55;
    const top = below ? target.bottom - box.top + 10 : box.bottom - target.top + 10;
    const tail = Math.min(Math.max(center - left, 16), width - 16);
    showHint({ spot: { left, top, width, below, tail }, ...inertLine(controlName(event.currentTarget)) });
  }

  const props: ScreenProps = { state, send, onInert };
  const screens: Record<Screen, ReactNode> = {
    apps: <AppsScreen {...props} />,
    files: <FilesScreen {...props} dict={dict.config} />,
    fleet: <FleetScreen {...props} />,
  };

  return (
    <div ref={rootRef} className="@container relative h-full w-full md:h-auto md:w-[93%] md:aspect-video">
      <div
        role="region"
        aria-label={dict.label}
        className="pg-window relative flex h-full w-full overflow-hidden rounded-xl border border-pg-line bg-pg-bg text-pg-text shadow-window"
      >
        <HostSidebar {...props} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Toolbar {...props} />
          {state.screen !== "fleet" && <HostTabs {...props} />}
          <div className="min-h-0 flex-1">{screens[state.screen]}</div>
          <StatusBar note={dict.demoNote} />
        </div>

      </div>

      {hint && (
        <div
          ref={hintRef}
          onMouseEnter={() => setHintHeld(true)}
          onMouseLeave={() => setHintHeld(false)}
          onFocus={() => setHintHeld(true)}
          onBlur={() => setHintHeld(false)}
        >
          <InertBoat
            key={hint.text + hint.spot.left + hint.spot.top}
            spot={hint.spot}
            text={hint.text}
            spin={hint.spin}
            cta={dict.inertCta}
            href={downloadHref}
            onClose={() => showHint(null)}
          />
        </div>
      )}
    </div>
  );
}

// The glow stage that frames the playground wherever a screenshot used to
// be: the wide window on desktop, a taller compact one on phones. Without
// `stage` (the home hero, where the window floats on the sea) the box hugs
// the window from tablets up, so the water starts right at its bottom.
export function PlaygroundFrame({ children, stage = true }: { children: ReactNode; stage?: boolean }) {
  const box = (
    <div
      className={cn(
        "flex aspect-[4/5] items-center justify-center",
        stage ? "md:aspect-[3000/1810]" : "md:aspect-auto",
      )}
    >
      {children}
    </div>
  );
  if (!stage) return box;
  return (
    <div className="rounded-lg border border-stage-line bg-(image:--sp-stage) p-2 md:p-4 lg:rounded-xl lg:p-6">
      {box}
    </div>
  );
}
