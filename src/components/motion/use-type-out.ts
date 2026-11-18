"use client";

import { animate, steps } from "animejs";
import { useEffect, useRef, type RefObject } from "react";

// Types out the text of an element one character at a time whenever `text`
// changes, by opening a clip from left to right. The text itself is never
// changed, so React's output stays untouched and nothing around it moves.
// Skipped on first render (the server-rendered text is already visible) and
// when the visitor prefers reduced motion (no .motion on <html>).
export function useTypeOut(ref: RefObject<HTMLElement | null>, text: string, speed = 32) {
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const element = ref.current;
    if (!element || !document.documentElement.classList.contains("motion")) return;
    const length = Math.max(text.length, 1);
    const typing = animate(element, {
      clipPath: ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"],
      duration: length * speed,
      ease: steps(length),
    });
    return () => {
      typing.revert();
    };
  }, [ref, text, speed]);
}
