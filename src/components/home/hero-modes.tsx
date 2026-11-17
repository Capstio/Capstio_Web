"use client";

import { animate } from "animejs";
import { Box, LayoutGrid, Terminal, type LucideIcon } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionaries";
import { HeroVideo, type HeroMode } from "./hero-video";

type HeroDict = Dictionary["home"]["hero"];

const modes: { id: HeroMode; icon: LucideIcon }[] = [
  { id: "apps", icon: LayoutGrid },
  { id: "docker", icon: Box },
  { id: "terminal", icon: Terminal },
];

// Subtitle, call to action, the Apps / Docker / Terminal switch and the product
// film of the hero. The switch changes the subtitle and jumps the film to that
// part. The call to action and the poster are rendered by the server and passed
// in (children and poster).
export function HeroModes({
  dict,
  poster,
  children,
}: {
  dict: Pick<HeroDict, "modes" | "modesLabel" | "mute" | "unmute">;
  poster: ReactNode;
  children: ReactNode;
}) {
  const [active, setActive] = useState<HeroMode>("apps");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pillRef = useRef<HTMLSpanElement>(null);
  const id = useId();
  const panelId = `${id}-subtitle`;

  // The pill behind the active tab slides to it. It starts under the first
  // tab (the server-rendered state) and is moved only from here, so React never
  // resets its transform. Without motion it jumps.
  const activeIndex = modes.findIndex((mode) => mode.id === active);
  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;
    const x = `${activeIndex * 100}%`;
    if (!document.documentElement.classList.contains("motion")) {
      pill.style.transform = `translateX(${x})`;
      return;
    }
    const slide = animate(pill, { x, duration: 420, ease: "outBack(1.2)" });
    return () => {
      slide.pause();
    };
  }, [activeIndex]);

  // Arrow keys, Home and End move between tabs (WAI-ARIA tabs pattern).
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = modes.findIndex((mode) => mode.id === active);
    const last = modes.length - 1;
    const next =
      event.key === "ArrowRight"
        ? index === last ? 0 : index + 1
        : event.key === "ArrowLeft"
          ? index === 0 ? last : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setActive(modes[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <>
      {/* All subtitles share one grid cell, so the block keeps the height of the
          longest one and nothing below it jumps when the mode changes. */}
      <div
        id={panelId}
        role="tabpanel"
        data-hero-fade
        aria-labelledby={`${id}-${active}`}
        className="grid max-w-155 text-center"
      >
        {modes.map(({ id: mode }) => (
          <p
            key={mode}
            aria-hidden={mode !== active}
            className={cn(
              "type-body-l text-balance text-body [grid-area:1/1] transition-[opacity,translate,visibility] duration-300 ease-out motion-reduce:transition-none",
              mode === active ? "translate-y-0 opacity-100" : "invisible translate-y-1.5 opacity-0",
            )}
          >
            {dict.modes[mode].subtitle}
          </p>
        ))}
      </div>

      {children}

      <div
        role="tablist"
        data-hero-fade
        aria-label={dict.modesLabel}
        onKeyDown={onKeyDown}
        className="relative grid w-85 max-w-full grid-cols-3 rounded-full bg-control p-1"
      >
        <span
          ref={pillRef}
          aria-hidden="true"
          className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-action"
        />
        {modes.map(({ id: mode, icon: Icon }, index) => {
          const selected = mode === active;
          return (
            <button
              key={mode}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={`${id}-${mode}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(mode)}
              className={cn(
                "type-small relative inline-flex h-10 items-center justify-center gap-2 rounded-full transition-colors duration-300 motion-reduce:transition-none",
                selected
                  ? "font-bold text-on-action"
                  : "text-muted hover:text-heading",
              )}
            >
              <Icon aria-hidden="true" className="size-3.5" strokeWidth={1.6} />
              {dict.modes[mode].label}
            </button>
          );
        })}
      </div>

      <HeroVideo
        mode={active}
        poster={poster}
        labels={{ mute: dict.mute, unmute: dict.unmute }}
      />
    </>
  );
}
