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
import { boatBow, boatHeight, boatWaterline, boatWidth } from "@/components/home/voyage-boat";
import { frontWave, waveHeight, waveSurface, waveTile } from "@/components/home/wave-divider";

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

    // Listeners added outside anime.js, removed when the scope is reverted.
    const cleanups: Array<() => void> = [];

    const scope = createScope().add(() => {
      // Hero announcement: the command is typed, then its output appears.
      for (const pill of document.querySelectorAll<HTMLElement>("[data-pill]")) {
        const command = pill.querySelector("[data-pill-command]");
        const output = pill.querySelector("[data-pill-output]");
        if (!command || !output) continue;
        const length = command.textContent?.length ?? 1;
        createTimeline({ delay: 300 })
          .add(command, {
            clipPath: ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"],
            duration: length * 45,
            ease: steps(length),
          })
          .add(output, { opacity: [0, 1], x: [-6, 0], duration: 450, ease: "outCubic" }, "+=250");
      }

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

      // Single elements, such as the app playground.
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

      // The voyage's boats: the one leaving the hero's pier and the one the
      // harbor's capstan hauls in. Both are moved by one loop, which runs only
      // while one of them is on screen (see `riders` below).
      startVoyage(cleanups);

      // The page's capstan: scrolling from the top of the page to the bottom
      // turns it and winds the rope in, lifting the anchor (or fills the thin
      // rope across the top on narrower screens). When the harbor comes into
      // view, its big capstan takes over and the small one fades out.
      const main = document.querySelector("main");
      for (const widget of document.querySelectorAll<HTMLElement>("[data-page-capstan]")) {
        if (!main) break;
        const drum = widget.querySelector("[data-capstan-drum]");
        const rope = widget.querySelector<HTMLElement>("[data-rope]");
        const anchor = widget.querySelector("[data-anchor]");
        const progress = widget.querySelector("[data-progress]");
        const progressAnchor = widget.querySelector("[data-progress-anchor]");
        const wound = 0.06;
        const winding = createTimeline({
          defaults: { ease: "linear" },
          autoplay: onScroll({
            target: main,
            enter: { target: "top", container: "top" },
            leave: { target: "bottom", container: "bottom" },
            sync: true,
          }),
        });
        if (drum) winding.add(drum, { rotate: [0, 1440] }, 0);
        if (rope) winding.add(rope, { scaleY: [1, wound] }, 0);
        if (anchor) winding.add(anchor, { y: ["0%", `${-(1 - wound) * 100}%`] }, 0);
        if (progress) winding.add(progress, { scaleX: [0, 1] }, 0);
        if (progressAnchor) winding.add(progressAnchor, { x: ["-100%", "0%"] }, 0);

        // The voyage map. Each knot (and tick on narrow screens) sits where its
        // leg starts in the scroll: the share of the scroll at which the leg's
        // top reaches 40% of the viewport, the same share the anchor has
        // risen by then. Measured again whenever the page changes height.
        const knots = [...widget.querySelectorAll<HTMLElement>("[data-knot]")];
        const ticks = [...widget.querySelectorAll<HTMLElement>("[data-tick]")];
        const counter = widget.querySelector<HTMLElement>("[data-leg-counter]");
        const counterNumber = widget.querySelector<HTMLElement>("[data-leg-current]");
        const legs = knots.map((knot) => document.getElementById(knot.dataset.knot ?? ""));
        const scene = document.querySelector("#harbor");
        let active = -2;
        let hidden = false;

        const update = () => {
          // The leg in view is the last one whose top has passed 40% of the
          // viewport; before the first leg there is none.
          const line = window.innerHeight * 0.4;
          let index = -1;
          legs.forEach((leg, i) => {
            if (leg && leg.getBoundingClientRect().top <= line) index = i;
          });
          if (index !== active) {
            active = index;
            knots.forEach((knot, i) => {
              knot.dataset.state = i < index ? "passed" : i === index ? "current" : "ahead";
            });
            if (counterNumber && index >= 0) counterNumber.textContent = String(index + 1).padStart(2, "0");
            if (counter) counter.style.opacity = index >= 0 ? "1" : "0";
          }

          // Hidden once the harbor's top has reached the lower part of
          // the viewport, whichever way (or however fast) the visitor scrolls.
          if (scene) {
            const next = scene.getBoundingClientRect().top < window.innerHeight * 0.75;
            if (next !== hidden) {
              hidden = next;
              animate(widget, { opacity: hidden ? 0 : 1, duration: 300 });
            }
          }
        };

        const place = () => {
          const mainTop = main.getBoundingClientRect().top + window.scrollY;
          const scrollable = Math.max(main.offsetHeight - window.innerHeight, 1);
          legs.forEach((leg, i) => {
            if (!leg) return;
            const legTop = leg.getBoundingClientRect().top + window.scrollY;
            const start = Math.min(Math.max((legTop - mainTop - window.innerHeight * 0.4) / scrollable, 0), 1);
            knots[i].style.top = `calc(100% - ${start * (1 - wound) * 100}%)`;
            if (ticks[i]) ticks[i].style.left = `${start * 100}%`;
          });
          update();
        };

        place();
        const resizes = new ResizeObserver(place);
        resizes.observe(main);
        window.addEventListener("scroll", update, { passive: true });
        cleanups.push(() => {
          resizes.disconnect();
          window.removeEventListener("scroll", update);
        });
      }
    });

    // From here the script owns the hidden elements; the CSS fallback stops.
    html.classList.add("motion-ready");

    return () => {
      for (const cleanup of cleanups) cleanup();
      scope.revert();
      html.classList.remove("motion-ready");
    };
  }, []);

  return null;
}

// A boat on its sea, and what it is doing there.
type Rider = {
  sea: HTMLElement; // the box the water is drawn in and the boat is placed in
  boat: SVGSVGElement;
  bob: HTMLElement; // the front swell's rising and falling wrapper
  roll: HTMLElement; // the front swell's sideways-rolling strip
  fromRight: boolean; // the swell's tiles are laid from the sea's right edge
  // Where the boat should be, in px from the sea's left edge, for this frame.
  aim: (sea: DOMRect, across: number) => number;
  // Extra drawing once the boat is placed: the harbor's rope.
  follow?: (pose: BoatPose) => void;
  x: number; // the boat's current centre; eases towards its aim
  visible: boolean;
};

// The boat's waterline centre in viewport pixels, its size and tilt.
type BoatPose = {
  left: number;
  top: number;
  across: number;
  tall: number;
  tilt: number;
};

const transformOf = (element: Element) => new DOMMatrixReadOnly(getComputedStyle(element).transform);

// Builds the riders from the markup ([data-voyage] scenes, each with a
// [data-sea] box holding a [data-boat] and the front swell) and moves them
// with one requestAnimationFrame loop. Every frame each boat reads where the
// swell's CSS animations have moved the water (so the two never drift apart),
// takes the water height and slope under its hull and tilts with it; its x
// eases towards an aim that follows the scroll. The loop runs only while a
// rider's sea is on screen. Call inside the anime.js scope, so the harbor's
// scroll timeline is reverted with it; `cleanups` stops the loop.
function startVoyage(cleanups: Array<() => void>) {
  const riders: Rider[] = [];

  for (const scene of document.querySelectorAll<HTMLElement>("[data-voyage]")) {
    const sea = scene.querySelector<HTMLElement>("[data-sea]");
    const boat = scene.querySelector<SVGSVGElement>("[data-boat]");
    const bob = scene.querySelector<HTMLElement>("[data-front-bob]");
    const roll = scene.querySelector<HTMLElement>("[data-front-roll]");
    if (!sea || !boat || !bob || !roll) continue;
    const base = { sea, boat, bob, roll, fromRight: roll.dataset.anchor === "right", x: -1, visible: false };

    if (scene.dataset.voyage === "hero") {
      // It leaves from where it rests without motion (by the pier), or from
      // the left edge on phones, where the pier is hidden, once the sea's top
      // is on screen (from the first pixel of scroll if it already is), and
      // sails to the right edge while the hero scrolls away: done when the
      // sea's top reaches the top of the viewport.
      const seaBox = sea.getBoundingClientRect();
      const boatBox = boat.getBoundingClientRect();
      const rest = boatBox.left + boatBox.width / 2 - seaBox.left;
      riders.push({
        ...base,
        aim: (box, across) => {
          const seaTop = box.top + window.scrollY;
          const from = Math.max(seaTop - window.innerHeight, 0);
          const progress = Math.min(Math.max((window.scrollY - from) / Math.max(seaTop - from, 1), 0), 1);
          const start = window.innerWidth < 640 ? across / 2 + 8 : rest;
          const end = document.documentElement.clientWidth - box.left - across / 2 - 16;
          return start + (end - start) * progress;
        },
      });
    } else if (scene.dataset.voyage === "harbor") {
      const drum = scene.querySelector("[data-drum]");
      const pier = scene.querySelector("[data-pier]");
      const from = scene.querySelector("[data-rope-from]");
      const rope = scene.querySelector<SVGLineElement>("[data-rope]");
      const moored = scene.querySelector<SVGElement>("[data-rope-static]");
      const overlay = rope?.ownerSVGElement;
      if (!drum || !pier || !from || !rope || !moored || !overlay) continue;

      // Scroll-synced (so it plays backwards when scrolling up): from the
      // scene's top entering the viewport until its bottom reaches the
      // middle, the capstan turns and the boat comes in from out at sea.
      const haul = createTimeline({
        defaults: { ease: "linear" },
        autoplay: onScroll({
          target: scene,
          enter: { target: "top", container: "bottom" },
          leave: { target: "bottom", container: "center" },
          sync: true,
        }),
      }).add(drum, { rotate: [0, -720] }, 0);

      moored.style.display = "none";
      rope.style.visibility = "visible";
      cleanups.push(() => {
        moored.style.removeProperty("display");
        rope.style.removeProperty("visibility");
      });

      // The bow in the boat's own pixels, from the point it turns around.
      const bowFrom = (across: number, tall: number) => ({
        x: (boatBow.x / boatWidth - 0.5) * across,
        y: (boatBow.y / boatHeight - boatWaterline) * tall,
      });

      riders.push({
        ...base,
        aim: (box, across) => {
          const start = box.width * 0.08 + across / 2;
          // Moored: the bow just past the end of the pier's deck.
          const end = pier.getBoundingClientRect().left - box.left + 6 - bowFrom(across, 0).x;
          return start + (end - start) * haul.progress;
        },
        follow: ({ left, top, across, tall, tilt }) => {
          const bow = bowFrom(across, tall);
          const angle = (tilt * Math.PI) / 180;
          const knot = from.getBoundingClientRect();
          const frame = overlay.getBoundingClientRect();
          const set = (name: string, value: number) => rope.setAttribute(name, value.toFixed(1));
          set("x1", knot.left + knot.width / 2 - frame.left);
          set("y1", knot.top + knot.height / 2 - frame.top);
          set("x2", left + bow.x * Math.cos(angle) - bow.y * Math.sin(angle) - frame.left);
          set("y2", top + bow.x * Math.sin(angle) + bow.y * Math.cos(angle) - frame.top);
        },
      });
    }
  }
  if (riders.length === 0) return;

  // From here the loop places the boats with a transform measured from their
  // static layout box (left/top stay as the classes set them, so taking over
  // is not a layout shift). The classes' CSS translate would add to it.
  for (const { boat } of riders) boat.style.translate = "none";
  cleanups.push(() => {
    for (const { boat } of riders) {
      boat.style.removeProperty("translate");
      boat.style.removeProperty("transform");
    }
  });

  let frame = 0;
  const place = (rider: Rider) => {
    const { sea, boat, bob, roll } = rider;
    const box = sea.getBoundingClientRect();
    // The boat's own layout box: its width and height are not rotated.
    const across = boat.clientWidth;
    const tall = boat.clientHeight;
    const aim = rider.aim(box, across);
    rider.x = rider.x < 0 ? aim : rider.x + (aim - rider.x) * 0.08;

    // The water's height (px from the sea's top) at a point of the sea. The
    // strip is one tile wider than the sea; laid from the right, its tiles
    // start at its width modulo a tile, which is the sea's width modulo a tile.
    const rolled = transformOf(roll).m41;
    const lifted = transformOf(bob).m42;
    const scale = box.height / waveHeight;
    const origin = rider.fromRight ? box.width % waveTile : 0;
    const water = (at: number) => {
      const unit = (((at - rolled - origin) % waveTile) + waveTile) % waveTile;
      return waveSurface(frontWave, unit) * scale + lifted;
    };
    const y = water(rider.x);
    const slope = (water(rider.x + 6) - water(rider.x - 6)) / 12;
    const tilt = Math.max(-14, Math.min(14, (Math.atan(slope) * 180) / Math.PI));
    // Where the classes put the boat's box in the sea (resolved to px).
    const style = getComputedStyle(boat);
    const dx = rider.x - across / 2 - parseFloat(style.left);
    const dy = y - tall * boatWaterline - parseFloat(style.top);
    boat.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${tilt.toFixed(2)}deg)`;
    rider.follow?.({ left: box.left + rider.x, top: box.top + y, across, tall, tilt });
  };
  const tick = () => {
    for (const rider of riders) if (rider.visible) place(rider);
    frame = requestAnimationFrame(tick);
  };
  // Placed once now, so no boat waits at its sea's corner for the first
  // visibility callback.
  for (const rider of riders) place(rider);

  const seen = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const rider = riders.find(({ sea }) => sea === entry.target);
      if (rider) rider.visible = entry.isIntersecting;
    }
    cancelAnimationFrame(frame);
    if (riders.some(({ visible }) => visible)) frame = requestAnimationFrame(tick);
  });
  for (const { sea } of riders) seen.observe(sea);
  cleanups.push(() => {
    seen.disconnect();
    cancelAnimationFrame(frame);
  });
}
