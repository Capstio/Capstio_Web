"use client";

import {
  Bell,
  Bot,
  Boxes,
  Check,
  Copy,
  FileCheck2,
  LayoutGrid,
  ListChecks,
  Network,
  ShieldCheck,
  SquareTerminal,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Container, Section } from "@/components/ui";
import { useClipboard } from "@/components/ui/use-clipboard";
import { cn } from "@/lib/cn";
import { commandRisk, type RiskLevel } from "@/lib/command-risk";
import { fill } from "@/lib/i18n";
import type { FeatureKey } from "@/lib/site-nav";
import { useBoatTalk, type BoatLines } from "./boat-talk";
import { LegMark } from "./leg-mark";
import { VoyageBoat, boatWaterline } from "./voyage-boat";
import { SeaLayers, frontWave, waveHeight, waveSurface, waveTile } from "./wave-divider";
import { withArrow } from "./with-arrow";

const icons: Record<FeatureKey, LucideIcon> = {
  apps: LayoutGrid,
  docker: Boxes,
  safeConfig: FileCheck2,
  terminal: SquareTerminal,
  recipes: ListChecks,
  alerts: Bell,
  sshSecurity: ShieldCheck,
  tunnels: Network,
  ai: Bot,
  teams: Users,
};

const riskTone: Record<RiskLevel, string> = {
  safe: "bg-tile-success/14 text-tile-success",
  confirm: "bg-tile-warning/14 text-tile-warning",
  dangerous: "bg-tile-danger/14 text-tile-danger",
};

// What a key shows: a real command (with its risk level), the question the AI
// was asked and the read-only command it proposes, or a team audit-log line.
export type ToolSample = { command: string } | { prompt: string; command: string } | { line: string };

export type ToolKey = {
  key: FeatureKey;
  title: string;
  description: string;
  href: string;
  sample: ToolSample;
};

type Labels = {
  overline: string;
  title: string;
  label: string;
  hint: string;
  copy: string;
  copied: string;
  copyFailed: string;
  more: string;
  approve: string;
  log: string;
  all: string;
  risk: Record<RiskLevel, string>;
  // What the boat says to the visitor.
  boat: BoatLines;
};

const headingId = "tool-keys-heading";
const autoplayMs = 3500;
const pauseAfterPressMs = 6000;
const holdMs = 800;

// Leg "All in one Mac app": the ten tools as the keys Capstio uses to switch
// tabs, ⌘1 to ⌘0, in the navigation's order. One key is pressed at a time and
// one card shows that tool: a line, a sample, a link to its page. The keys are
// a tablist (arrows, Home/End, and the digits 1 to 0 while focus is in the
// row). ⌘ or Ctrl with a digit is never intercepted: the browser uses it to
// switch tabs. While the leg is on screen the keys press themselves in turn
// (and the boat sails along); the pointer over the keys or card, focus inside
// them, or a press in the last few seconds pauses it, and it carries on when
// the visitor lets go. Reduced motion turns it off.
export function ToolKeys({
  leg,
  tools,
  labels,
  native,
  allHref,
}: {
  leg: string;
  tools: ToolKey[];
  labels: Labels;
  // The native Mac points, as one line of chips.
  native: string[];
  allHref: string;
}) {
  const [active, setActive] = useState(0);
  // Autoplay waits while the pointer or focus is inside, and for a few seconds
  // after any press (touch screens never "leave").
  const holding = useRef(false);
  const lastPress = useRef(0);
  const [presses, setPresses] = useState(0);
  useEffect(() => {
    if (presses > 0) lastPress.current = Date.now();
  }, [presses]);
  const section = useRef<HTMLElement>(null);
  const keys = useRef<Array<HTMLButtonElement | null>>([]);
  const row = useRef<HTMLDivElement>(null);
  // The boat's x (px from the row's left edge) and how many times it set off,
  // so pressing the selected key again sends it sailing again.
  // `dir` is the way it faces (1 right, -1 left), `ms` how long the current
  // sail takes (longer for longer trips).
  const [boat, setBoat] = useState<{ x: number; sailing: boolean; dir: 1 | -1; ms: number } | null>(null);
  const [trip, setTrip] = useState(0);
  // While the visitor drags the boat: its x under the pointer.
  const [dragX, setDragX] = useState<number | null>(null);
  const drag = useRef<{ startX: number; moved: boolean; pointer: number } | null>(null);
  // A tap on the boat makes it hop.
  const [hop, setHop] = useState(0);
  // The sea strip and the boat's parts, read every frame so the boat rides the
  // swell that is really rolling under it.
  const sea = useRef<HTMLDivElement>(null);
  const mover = useRef<HTMLDivElement>(null);
  const hull = useRef<SVGSVGElement>(null);
  const [rowW, setRowW] = useState(0);
  const edge = useRef<"left" | "right" | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const talk = useBoatTalk({ section, boat: mover, lines: labels.boat });

  // The boat sails to the middle of the selected key's column (a transform
  // transition). Pressing the selected key again replays a short sail-in
  // (.boat-resail, restarted by keying the element on `trip`).
  useLayoutEffect(() => {
    const place = () => {
      const key = keys.current[active];
      const box = row.current;
      if (!key || !box) return;
      setRowW(box.clientWidth);
      const middle = key.getBoundingClientRect().left - box.getBoundingClientRect().left + key.offsetWidth / 2;
      setBoat((current) => {
        const distance = current ? Math.abs(current.x - middle) : 0;
        return {
          x: middle,
          sailing: distance > 1,
          dir: current && distance > 1 ? (middle > current.x ? 1 : -1) : (current?.dir ?? 1),
          ms: Math.min(1500, 600 + distance * 0.9),
        };
      });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = section.current;
    if (!node) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const seen = new IntersectionObserver(([entry]) => {
      clearInterval(timer);
      if (entry.isIntersecting) {
        timer = setInterval(() => {
          if (holding.current || Date.now() - lastPress.current < pauseAfterPressMs) return;
          setActive((index) => (index + 1) % tools.length);
        }, autoplayMs);
      }
    });
    seen.observe(node);
    return () => {
      seen.disconnect();
      clearInterval(timer);
    };
  }, [tools.length]);

  const hasBoat = boat !== null;
  // The boat rides the real front swell, frame by frame: it takes the water's
  // height and slope at the spot it is in, from the live roll and bob of the
  // swell layer, so it is lifted and tilted by each crest as it passes, and
  // goes on being carried by the rhythm of the sea while it sails.
  useEffect(() => {
    const node = section.current;
    if (!node) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const shift = (element: Element) => new DOMMatrixReadOnly(getComputedStyle(element).transform);
    const tick = () => {
      const strip = sea.current;
      const roll = strip?.querySelector("[data-front-roll]");
      const bob = strip?.querySelector("[data-front-bob]");
      const at = mover.current;
      const boatEl = hull.current;
      if (strip && roll && bob && at && boatEl) {
        const scale = strip.clientHeight / waveHeight;
        const rolled = shift(roll).m41;
        const lifted = shift(bob).m42;
        const x = at.getBoundingClientRect().left - strip.getBoundingClientRect().left;
        const water = (px: number) => {
          const unit = (((px - rolled) % waveTile) + waveTile) % waveTile;
          return waveSurface(frontWave, unit) * scale + lifted;
        };
        const slope = (water(x + 6) - water(x - 6)) / 12;
        const tilt = Math.max(-9, Math.min(9, (Math.atan(slope) * 180) / Math.PI));
        const facing = Number(at.dataset.facing ?? 1);
        boatEl.style.transform = `translate(-50%, ${water(x) - boatEl.clientHeight * boatWaterline}px) rotate(${tilt * facing}deg)`;
      }
      if (!reduced) frame = requestAnimationFrame(tick);
    };
    const seen = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting) frame = requestAnimationFrame(tick);
    });
    seen.observe(node);
    return () => {
      seen.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [hasBoat]);

  const choose = (index: number, focus = false, again = false, by?: "click" | "hover" | "keyboard") => {
    setPresses((count) => count + 1);
    if (by) talk.press(tools[index].key, by);
    if (again && index === active) setTrip((count) => count + 1);
    setActive(index);
    if (focus) keys.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const last = tools.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = active === last ? 0 : active + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = active === 0 ? last : active - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else if (/^[0-9]$/.test(event.key)) next = (Number(event.key) + 9) % 10;
    if (next === null || next > last) return;
    event.preventDefault();
    choose(next, true, false, "keyboard");
  };

  // Dragging the boat along the keys: the key under it is selected as it goes,
  // and on release it sails (pushed by its wave) to that key's middle.
  const nearestKey = (x: number) => {
    const box = row.current?.getBoundingClientRect();
    if (!box) return active;
    let best = active;
    let gap = Infinity;
    keys.current.forEach((key, index) => {
      if (!key) return;
      const middle = key.getBoundingClientRect().left - box.left + key.offsetWidth / 2;
      if (Math.abs(middle - x) < gap) {
        gap = Math.abs(middle - x);
        best = index;
      }
    });
    return best;
  };
  const dragTo = (clientX: number) => {
    const box = row.current?.getBoundingClientRect();
    if (!box) return;
    const x = Math.min(Math.max(clientX - box.left, 0), box.width);
    setDragX(x);
    setBoat((current) => current && { ...current, dir: x >= current.x ? 1 : -1 });
    const index = nearestKey(x);
    if (index !== active) choose(index);
    // Told once each time it is pushed against a shore.
    const side = x <= 6 ? "left" : x >= box.width - 6 ? "right" : null;
    if (side !== edge.current) {
      edge.current = side;
      if (side) talk.say(side === "left" ? "edgeLeft" : "edgeRight");
    }
  };

  const tool = tools[active];

  return (
    <Section
      ref={section}
      id="features"
      surface="light"
      aria-labelledby={headingId}
      spacing="py-10 lg:py-16"
    >
      <Container className="flex flex-col gap-8 lg:gap-10">
        <div data-reveal className="flex flex-col gap-4 lg:items-center lg:text-center">
          <LegMark leg={leg}>{labels.overline}</LegMark>
          <h2 id={headingId} className="type-h2 text-strong">
            {labels.title}
          </h2>
          <p className="text-sm text-soft">{labels.hint}</p>
        </div>

        <div
          data-reveal
          className="flex flex-col gap-6 lg:gap-8"
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") holding.current = true;
          }}
          onPointerLeave={() => {
            holding.current = false;
          }}
          onFocus={(event) => {
            // Only keyboard focus holds autoplay: a mouse or touch press also
            // focuses the key, and would otherwise pause it until the next click
            // elsewhere.
            if (event.target.matches(":focus-visible")) holding.current = true;
          }}
          onBlur={() => {
            holding.current = false;
          }}
        >
          <p role="status" className="sr-only">
            {talk.line?.text}
          </p>
          <div ref={row} className="relative flex flex-col gap-0">
          {/* The voyage's boat sails over the keys to the selected one. */}
          <div ref={sea} aria-hidden="true" className="pointer-events-none relative mt-10 h-16 sm:h-20">
            <SeaLayers part="back" />
            {boat && (
              <div
                ref={mover}
                data-facing={boat.dir}
                className={cn(
                  "absolute top-0 left-0 z-10 cursor-grab touch-none ease-[cubic-bezier(0.45,0,0.2,1.12)] transition-transform select-none motion-reduce:transition-none",
                  dragX !== null && "cursor-grabbing",
                )}
                style={{
                  // The strip itself ignores the pointer; only the boat takes
                  // it (the keys do the same job for keyboards and readers).
                  pointerEvents: "auto",
                  transform: `translateX(${dragX ?? boat.x}px)`,
                  transitionDuration: dragX === null && boat.sailing ? `${boat.ms}ms` : "0ms",
                }}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") talk.greet();
                }}
                onDoubleClick={() => talk.spin()}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  drag.current = { startX: event.clientX, moved: false, pointer: event.pointerId };
                  holding.current = true;
                  talk.touch();
                  // Kept pressed without moving: it complains.
                  clearTimeout(holdTimer.current);
                  holdTimer.current = setTimeout(() => {
                    if (drag.current && !drag.current.moved) talk.say("hold");
                  }, holdMs);
                }}
                onPointerMove={(event) => {
                  const state = drag.current;
                  if (!state || state.pointer !== event.pointerId) return;
                  if (!state.moved && Math.abs(event.clientX - state.startX) < 5) return;
                  if (!state.moved) {
                    state.moved = true;
                    clearTimeout(holdTimer.current);
                    talk.touch();
                    talk.say("dragStart");
                  }
                  dragTo(event.clientX);
                }}
                onPointerUp={() => {
                  const state = drag.current;
                  drag.current = null;
                  holding.current = false;
                  clearTimeout(holdTimer.current);
                  setPresses((count) => count + 1);
                  if (!state?.moved) {
                    setHop((count) => count + 1);
                    talk.poke();
                    return;
                  }
                  if (!edge.current) talk.say("drop");
                  edge.current = null;
                  // Sail on from where it was let go, to the selected key.
                  setBoat((current) => current && { ...current, sailing: dragX !== null && Math.abs(dragX - current.x) > 2 });
                  setDragX(null);
                }}
                onPointerCancel={() => {
                  drag.current = null;
                  holding.current = false;
                  clearTimeout(holdTimer.current);
                  edge.current = null;
                  setDragX(null);
                }}
                onTransitionEnd={(event) => {
                  // Level again once it arrives.
                  if (event.propertyName === "transform") setBoat((current) => current && { ...current, sailing: false });
                }}
              >
                {talk.line && (
                  <BoatBubble key={talk.line.id} text={talk.line.text} x={dragX ?? boat.x} width={rowW} />
                )}
                {/* Faces the way it sails. */}
                <div className="origin-left" style={{ transform: `scaleX(${boat.dir})` }}>
                  <div key={trip} className={cn(trip > 0 && "boat-resail")}>
                    <div key={hop} className={cn(hop > 0 && "boat-hop")}>
                      <div key={talk.mood?.id} className={cn(talk.mood && `boat-${talk.mood.kind}`)}>
                        <VoyageBoat ref={hull} className="static block w-14 sm:w-16" style={{ pointerEvents: "auto" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <SeaLayers part="front" className="z-20" />
          </div>
          <div
            role="tablist"
            aria-label={labels.label}
            onKeyDown={onKeyDown}
            className="grid grid-cols-5 gap-2 sm:gap-3 lg:grid-cols-10"
          >
            {tools.map((item, index) => {
              const Icon = icons[item.key];
              const selected = index === active;
              return (
                <button
                  key={item.key}
                  ref={(node) => {
                    keys.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`tool-key-${item.key}`}
                  aria-selected={selected}
                  aria-controls="tool-key-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => choose(index, false, true, "click")}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") choose(index, false, false, "hover");
                  }}
                  className={cn(
                    "group relative flex aspect-square flex-col justify-between rounded-lg border p-2 text-left transition-[transform,box-shadow,background-color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kicker motion-reduce:transition-none sm:p-3",
                    selected
                      ? "translate-y-0.5 border-kicker bg-kicker text-white shadow-[0_1px_0_0_var(--color-kicker)]"
                      : "border-bento-line bg-linear-to-b from-bento-card to-page text-body shadow-[0_4px_0_0_var(--color-bento-line)] hover:-translate-y-px",
                  )}
                >
                  <span className="font-mono text-[0.6875rem] leading-none opacity-80 sm:text-xs">
                    ⌘{(index + 1) % 10}
                  </span>
                  <Icon aria-hidden="true" className="size-4 self-end sm:size-5" strokeWidth={2} />
                  <span className="sr-only">{item.title}</span>
                </button>
              );
            })}
          </div>
          </div>

          <div
            id="tool-key-panel"
            role="tabpanel"
            aria-labelledby={`tool-key-${tool.key}`}
            className="mx-auto grid min-h-56 w-full max-w-200 gap-4 rounded-xl border border-bento-line bg-bento-card p-5 sm:min-h-48 lg:p-7"
          >
            <div key={tool.key} className="flex min-w-0 animate-[tool-in_250ms_ease-out] flex-col gap-4 motion-reduce:animate-none">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl leading-7 font-bold text-strong lg:text-2xl lg:leading-8">{tool.title}</h3>
                <p className="text-base leading-6 text-soft">{tool.description}</p>
              </div>
              <Sample sample={tool.sample} labels={labels} onCopied={() => talk.say("copy")} />
              <Link
                href={tool.href}
                className="w-fit text-sm font-medium text-kicker underline-offset-4 hover:underline"
              >
                {withArrow(fill(labels.more, { tool: tool.title }))}
              </Link>
            </div>
          </div>
        </div>

        <div data-reveal-self className="flex flex-col items-center gap-4">
          <ul className="flex flex-wrap justify-center gap-2">
            {native.map((item) => (
              <li key={item} className="rounded-full border border-chip-line bg-chip px-3 py-1 text-xs font-medium text-chip-text">
                {item}
              </li>
            ))}
          </ul>
          <Link href={allHref} className="text-sm font-medium text-kicker underline-offset-4 hover:underline">
            {withArrow(labels.all)}
          </Link>
        </div>
      </Container>
    </Section>
  );
}

function Sample({ sample, labels, onCopied }: { sample: ToolSample; labels: Labels; onCopied: () => void }) {
  if ("line" in sample) {
    return (
      <p className="flex flex-col gap-1 rounded-lg border border-line bg-code px-4 py-3 font-mono text-sm text-body">
        <span className="font-sans text-xs font-semibold text-soft uppercase">{labels.log}</span>
        {sample.line}
      </p>
    );
  }
  const risk = commandRisk(sample.command);
  return (
    <div className="flex flex-col gap-2">
      {"prompt" in sample && <p className="text-sm text-body">“{sample.prompt}”</p>}
      <div className="flex min-h-12 items-center gap-3 rounded-lg border border-line bg-code pr-2 pl-4">
        <span aria-hidden="true" className="font-mono text-sm text-tile-success">
          $
        </span>
        <code className="min-w-0 flex-1 truncate font-mono text-sm text-strong">{sample.command}</code>
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium",
            "prompt" in sample ? "bg-kicker/14 text-kicker" : riskTone[risk],
          )}
        >
          {"prompt" in sample ? labels.approve : labels.risk[risk]}
        </span>
        <CopyButton text={sample.command} labels={labels} onCopied={onCopied} />
      </div>
    </div>
  );
}

function CopyButton({ text, labels, onCopied }: { text: string; labels: Labels; onCopied: () => void }) {
  const { state, copy } = useClipboard();
  const label = state === "copied" ? labels.copied : state === "failed" ? labels.copyFailed : labels.copy;
  return (
    <button
      type="button"
      onClick={() => {
        copy(text);
        onCopied();
      }}
      aria-live="polite"
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-body hover:bg-heading/10 hover:text-heading"
    >
      {state === "copied" ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
      <span className="max-sm:sr-only">{label}</span>
    </button>
  );
}

// The boat's speech bubble: above it, kept inside the row (it slides sideways
// near a shore and its tail keeps pointing at the boat).
function BoatBubble({ text, x, width }: { text: string; x: number; width: number }) {
  const half = 144;
  const shift = width > 0 ? Math.max(half - x, 0) - Math.max(x + half - width, 0) : 0;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-full left-0 z-30 mb-1 w-max max-w-72 -translate-x-1/2"
      style={{ marginLeft: shift }}
    >
      <div className="boat-say relative rounded-xl border border-bento-line bg-page px-3 py-1.5 text-center text-sm leading-5 font-medium text-strong shadow-md">
        {text}
        <span
          className="absolute top-full size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-r border-b border-bento-line bg-page"
          style={{ left: `calc(50% - ${shift}px)` }}
        />
      </div>
    </div>
  );
}
