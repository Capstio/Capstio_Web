"use client";

import {
  animate,
  createScope,
  createTimeline,
  onScroll,
  stagger,
  steps,
} from "animejs";
import { useEffect } from "react";

// How far an element rises while it fades in, and how fast.
const rise = 16;
const revealDuration = 650;
const revealStagger = 80;

// Time per typed character of a command chip.
const typeSpeed = 38;

// Animates the elements marked in the markup (see the page motion rules in
// globals.css for the data attributes and the hidden start state). It runs
// only when the head script allowed motion (.motion on <html>).
//
// Render it as the last element of a page, not in the layout: the layout
// hydrates before the streamed page content, and styling server-rendered
// elements before React has hydrated them makes it report a mismatch. An
// effect runs only after everything rendered before it in the same tree has
// hydrated.
export function PageMotion() {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("motion")) return;

    const scope = createScope().add(() => {
      // Hero headline: word by word, as soon as the page is ready.
      for (const heading of document.querySelectorAll<HTMLElement>("[data-split]")) {
        animate(heading.querySelectorAll("[data-word]"), {
          opacity: [0, 1],
          y: ["0.35em", "0em"],
          duration: 700,
          delay: stagger(55),
          ease: "outCubic",
        });
      }

      // Blocks whose children come in one after another.
      for (const group of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
        onScroll({
          target: group,
          repeat: false,
          onEnter: () =>
            animate(group.children, {
              opacity: [0, 1],
              y: [rise, 0],
              duration: revealDuration,
              delay: stagger(revealStagger),
              ease: "outCubic",
            }),
        });
      }

      // Single elements, such as the app screenshots.
      for (const element of document.querySelectorAll<HTMLElement>("[data-reveal-self]")) {
        onScroll({
          target: element,
          repeat: false,
          onEnter: () =>
            animate(element, {
              opacity: [0, 1],
              y: [rise * 1.5, 0],
              duration: revealDuration + 150,
              ease: "outCubic",
            }),
        });
      }

      // Command chips are typed out: the clip opens one character at a time,
      // so the chip keeps its width and nothing around it moves.
      for (const chip of document.querySelectorAll<HTMLElement>("code[data-type]")) {
        const length = chip.textContent?.length ?? 1;
        onScroll({
          target: chip,
          repeat: false,
          onEnter: () =>
            animate(chip, {
              clipPath: ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"],
              duration: length * typeSpeed,
              delay: 450,
              ease: steps(length),
            }),
        });
      }

      // ⌘1 … ⌘0 on the terminal card: the keys are pressed in turn, in a
      // loop that only runs while the card is on screen.
      for (const keys of document.querySelectorAll<HTMLElement>("[data-keys]")) {
        const press = createTimeline({ loop: true, loopDelay: 1400, autoplay: false }).add(
          keys.querySelectorAll("kbd"),
          {
            y: [
              { to: 3, duration: 90, ease: "outQuad" },
              { to: 0, duration: 220, ease: "outBack" },
            ],
            scale: [
              { to: 0.94, duration: 90, ease: "outQuad" },
              { to: 1, duration: 220, ease: "outBack" },
            ],
            delay: stagger(260),
          },
        );
        onScroll({
          target: keys,
          onEnter: () => press.play(),
          onLeave: () => press.pause(),
        });
      }
    });

    // From here the script owns the hidden elements; the CSS fallback stops.
    html.classList.add("motion-ready");

    return () => {
      scope.revert();
      html.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
