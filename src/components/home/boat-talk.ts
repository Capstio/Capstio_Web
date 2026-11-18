"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { FeatureKey } from "@/lib/site-nav";

// What the leg-04 boat can say, one list of lines per situation. Every list
// has several lines so it does not repeat itself; `tools` has lines for each
// key.
export type BoatLines = {
  hello: string[];
  tap: string[];
  annoyed: string[];
  dizzy: string[];
  dragStart: string[];
  drop: string[];
  edgeLeft: string[];
  edgeRight: string[];
  spin: string[];
  hold: string[];
  fast: string[];
  idle: string[];
  sleepy: string[];
  near: string[];
  copy: string[];
  keyboard: string[];
  leave: string[];
  tools: Record<FeatureKey, string[]>;
};

export type BoatTopic = Exclude<keyof BoatLines, "tools">;
export type BoatMood = "dizzy" | "spin";

// A louder reaction replaces a quieter one that is still on screen; a quieter
// one waits for it to finish.
const priority: Record<BoatTopic | "tool", number> = {
  tool: 1,
  near: 1,
  leave: 1,
  idle: 1,
  sleepy: 1,
  hello: 2,
  keyboard: 2,
  copy: 2,
  drop: 2,
  fast: 3,
  hold: 3,
  edgeLeft: 3,
  edgeRight: 3,
  dragStart: 3,
  tap: 4,
  spin: 4,
  annoyed: 5,
  dizzy: 6,
};

const idleAfterMs = 12_000;
const sleepyAfterMs = 28_000;
const nearPx = 80;
const nearCooldownMs = 20_000;
const dizzyReversals = 7;
const dizzyWindowMs = 1200;
const dizzyCooldownMs = 2500;

const speakFor = (text: string) => 1800 + text.length * 45;

// The boat's talk: it picks a line for what the visitor just did, keeps it on
// screen for a while, and tells the component which mood (an animation) to
// play. Besides the calls the component makes (`say`), it watches the mouse
// itself: wild shaking makes it dizzy, a cursor coming close gets a remark, a
// long quiet makes it call out and then doze off.
export function useBoatTalk({
  section,
  boat,
  lines,
}: {
  section: RefObject<HTMLElement | null>;
  boat: RefObject<HTMLElement | null>;
  lines: BoatLines;
}) {
  const [line, setLine] = useState<{ text: string; id: number } | null>(null);
  const [mood, setMood] = useState<{ kind: BoatMood; id: number } | null>(null);

  const linesRef = useRef(lines);
  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  const memo = useRef({
    id: 0,
    until: 0,
    level: 0,
    text: "",
    visible: false,
    lastActivity: 0,
    idleStage: 0,
    nearAt: 0,
    dizzyAt: 0,
    helloAt: 0,
    greetAt: 0,
    taps: [] as number[],
    reversals: [] as number[],
    mouse: { x: 0, y: 0, dx: 0, dy: 0, set: false },
    clear: undefined as ReturnType<typeof setTimeout> | undefined,
  });

  // Something the visitor did: the boat is not bored any more.
  const touch = useCallback(() => {
    const state = memo.current;
    state.lastActivity = Date.now();
    state.idleStage = 0;
  }, []);

  const say = useCallback((topic: BoatTopic | "tool", tool?: FeatureKey) => {
    const state = memo.current;
    const pool = topic === "tool" ? (tool ? linesRef.current.tools[tool] : undefined) : linesRef.current[topic];
    if (!pool?.length) return;
    const now = Date.now();
    const level = priority[topic];
    if (now < state.until && level < state.level) return;
    const choices = pool.length > 1 ? pool.filter((text) => text !== state.text) : pool;
    const text = choices[Math.floor(Math.random() * choices.length)];
    state.text = text;
    state.level = level;
    state.until = now + speakFor(text);
    state.id += 1;
    setLine({ text, id: state.id });
    clearTimeout(state.clear);
    state.clear = setTimeout(() => setLine(null), speakFor(text));
  }, []);

  const act = useCallback((kind: BoatMood) => {
    memo.current.id += 1;
    setMood({ kind, id: memo.current.id });
  }, []);

  // Pokes in quick succession annoy it; a double tap sends it spinning.
  const poke = useCallback(() => {
    const state = memo.current;
    touch();
    const now = Date.now();
    state.taps = [...state.taps.filter((at) => now - at < 3000), now];
    if (state.taps.length >= 5) {
      state.taps = [];
      say("annoyed");
      act("dizzy");
    } else {
      say("tap");
    }
  }, [act, say, touch]);

  const spin = useCallback(() => {
    touch();
    act("spin");
    say("spin");
  }, [act, say, touch]);

  // The pointer came onto the boat: a greeting, not more than every few seconds.
  const greet = useCallback(() => {
    const state = memo.current;
    touch();
    const now = Date.now();
    if (now - state.greetAt < 8000) return;
    state.greetAt = now;
    say("hello");
  }, [say, touch]);

  // Pressing keys faster than it can follow.
  const rush = useRef<number[]>([]);
  const press = useCallback(
    (tool: FeatureKey, by: "click" | "hover" | "keyboard") => {
      const state = memo.current;
      touch();
      const now = Date.now();
      if (by === "hover") {
        say("tool", tool);
        return;
      }
      rush.current = [...rush.current.filter((at) => now - at < 2500), now];
      if (rush.current.length >= 6) {
        rush.current = [];
        say("fast");
        return;
      }
      if (by === "keyboard" && now - state.helloAt > 30_000) {
        state.helloAt = now;
        say("keyboard");
        return;
      }
      say("tool", tool);
    },
    [say, touch],
  );

  // The boat reads the mouse across the page while the leg is on screen.
  useEffect(() => {
    const node = section.current;
    if (!node) return;
    const state = memo.current;
    const seen = new IntersectionObserver(([entry]) => {
      state.visible = entry.isIntersecting;
      if (entry.isIntersecting && state.lastActivity === 0) state.lastActivity = Date.now();
    });
    seen.observe(node);

    const onMove = (event: PointerEvent) => {
      if (!state.visible || event.pointerType !== "mouse") return;
      const now = Date.now();
      const last = state.mouse;
      if (last.set) {
        const dx = event.clientX - last.x;
        const dy = event.clientY - last.y;
        // A reversal: the pointer turned back on an axis after a real move.
        const turned = (previous: number, next: number) => Math.abs(next) >= 3 && Math.abs(previous) >= 3 && Math.sign(previous) !== Math.sign(next);
        if (turned(last.dx, dx) || turned(last.dy, dy)) state.reversals.push(now);
        state.reversals = state.reversals.filter((at) => now - at < dizzyWindowMs);
        if (Math.abs(dx) >= 3) last.dx = dx;
        if (Math.abs(dy) >= 3) last.dy = dy;
        if (state.reversals.length >= dizzyReversals && now - state.dizzyAt > dizzyCooldownMs) {
          state.reversals = [];
          state.dizzyAt = now;
          touch();
          say("dizzy");
          act("dizzy");
        }
      }
      last.x = event.clientX;
      last.y = event.clientY;
      last.set = true;

      const at = boat.current?.getBoundingClientRect();
      if (at && now - state.nearAt > nearCooldownMs) {
        const gap = Math.hypot(event.clientX - (at.left + at.width / 2), event.clientY - (at.top + at.height / 2));
        if (gap < nearPx) {
          state.nearAt = now;
          touch();
          say("near");
        }
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // A quiet visitor: it calls out, then dozes off.
    const bored = setInterval(() => {
      if (!state.visible || Date.now() < state.until) return;
      const quiet = Date.now() - state.lastActivity;
      if (state.idleStage === 0 && quiet > idleAfterMs) {
        state.idleStage = 1;
        say("idle");
      } else if (state.idleStage === 1 && quiet > sleepyAfterMs) {
        state.idleStage = 2;
        say("sleepy");
      }
    }, 1000);

    return () => {
      seen.disconnect();
      window.removeEventListener("pointermove", onMove);
      clearInterval(bored);
      clearTimeout(state.clear);
    };
  }, [act, boat, say, section, touch]);

  return { line, mood, say, act, touch, poke, spin, greet, press };
}
