"use client";

import { Volume2, VolumeX } from "lucide-react";
import dynamic from "next/dynamic";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { VoyageBoat } from "./voyage-boat";
import { SeaLayers } from "./wave-divider";

export type HeroMode = "apps" | "docker" | "terminal";

// Where each tab's part of the product film starts, in seconds. The light and
// dark films share one timeline.
const chapters: Record<HeroMode, number> = {
  apps: 46, // "Apps finds what's running." / "All in one list."
  docker: 58, // "Containers and images."
  terminal: 96, // "When you want a shell, it's a real one."
};

// The product film is hosted on Mux (one asset per theme). Mux streams it as
// HLS in 1080p, 720p, 480p and 270p and picks the rendition for the viewer's
// connection.
const playbackIds = {
  light: "JR6mFhk5QfvuJEpbVlbf22AhVFnaddzRqsYMoBP00ii8",
  dark: "cZFnbVkARaFucYU02wGmqkFXQujAGxXwDi00Ld1hRTkBY",
};

// The Mux element brings an HLS engine, so it is loaded in its own chunk after
// the page is interactive instead of being part of the first bundle.
const MuxVideo = dynamic(() => import("@mux/mux-video-react"), { ssr: false });

// Theme comes from the "dark" class on <html> (set before paint and by the
// theme toggle). On the server there is no theme, so no video is rendered and
// the poster images stand in until the page hydrates.
function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function useTheme() {
  return useSyncExternalStore(
    subscribeTheme,
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
    () => null,
  );
}

function subscribeReducedMotion(onChange: () => void) {
  const query = matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
}

// Product window under the hero text (Figma "Hero-Video-Window"): the product
// film, muted and looping, playing only while it is on screen. The poster
// images are server rendered and show until the film has a frame to paint.
// Choosing a tab jumps the film to that part. With reduced motion the poster
// is shown on its own.
export function HeroVideo({
  mode,
  poster,
  labels,
}: {
  mode: HeroMode;
  poster: ReactNode;
  labels: { mute: string; unmute: string };
}) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  // The Mux element mounts after its chunk loads, so the play/pause effect keys
  // off this state (set by a callback ref) instead of reading a ref on mount.
  // The ref is used where the element is changed (seeking, sound).
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timeRef = useRef(0);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const showVideo = theme !== null && !reducedMotion;

  // A new source (theme change) starts hidden until its first frame is ready.
  const [readyFor, setReadyFor] = useState(theme);
  if (readyFor !== theme) {
    setReadyFor(theme);
    setReady(false);
  }

  // Play once a tenth of the window is on screen (on a laptop the top of it
  // already shows under the hero text), pause when it scrolls away.
  useEffect(() => {
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.1 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [video]);

  // Jump to the chosen tab's chapter. Skipped on mount so the film starts
  // from the beginning.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const element = videoRef.current;
    if (!element) return;
    const seek = () => {
      element.currentTime = chapters[mode];
    };
    if (element.readyState >= HTMLMediaElement.HAVE_METADATA) seek();
    else element.addEventListener("loadedmetadata", seek, { once: true });
  }, [mode]);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    setMuted(!muted);
    if (video.paused) video.play().catch(() => {});
  }

  return (
    // The window above the hero's sea. The wrapper sizes the window; the sea
    // box follows it in the flow, full-bleed, so the water never crosses the
    // film. Its top is pulled up by the transparent band above the highest
    // crest (the far swell's mean crest is 18/96 down the box and it bobs 7%
    // of the box each way), so the water starts right at the window's bottom.
    // Without motion this is the whole layout. With motion, scrolling the
    // hero scales and lifts the window ([data-hero-window]) and raises the sea
    // into the space it leaves (globals.css, page-motion.tsx).
    //
    // From 1024px the window's width follows the viewport height, so the film
    // stays the hero's main picture (about 950px wide on a 1440x900 screen)
    // without pushing the window's top off short screens; on tall screens it
    // reaches its full 1100px.
    <div
      data-voyage="hero"
      className="relative w-full max-w-[min(100%,1100px)] lg:w-[clamp(45rem,calc((100svh-26rem)*1.975),68.75rem)]"
    >
      {/* [data-hero-window]: page motion scales and lifts this wrapper.
          [data-float] inside it only bobs 2 to 3px with the near swell once
          the water is under it, so the two transforms never overwrite each
          other. */}
      <div data-hero-window className="relative z-10 origin-top">
        <div
          data-float
          className="relative aspect-[1100/619] w-full overflow-hidden rounded-xl border border-line-media bg-media"
        >
          {poster}

          {showVideo && (
            <>
              <MuxVideo
                key={theme}
                ref={(node) => {
                  videoRef.current = node ?? null;
                  setVideo(node ?? null);
                }}
                playbackId={playbackIds[theme]}
                // No Mux Data cookie on visitors; view analytics still work.
                disableCookies
                muted={muted}
                loop
                playsInline
                preload="none"
                aria-hidden="true"
                // The light and dark films share a timeline: after a theme switch
                // the new one continues where the old one was.
                onLoadedMetadata={(event) => {
                  event.currentTarget.currentTime = timeRef.current;
                }}
                onTimeUpdate={(event) => {
                  timeRef.current = event.currentTarget.currentTime;
                }}
                onLoadedData={() => setReady(true)}
                className={cn(
                  "absolute inset-0 size-full object-cover transition-opacity duration-500",
                  ready ? "opacity-100" : "opacity-0",
                )}
              />

              {/* Top-right corner of the film. */}
              <button
                type="button"
                onClick={toggleSound}
                aria-pressed={!muted}
                aria-label={muted ? labels.unmute : labels.mute}
                className="absolute top-4 right-4 inline-flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white transition-colors hover:bg-black/70 max-md:top-2.5 max-md:right-2.5 max-md:size-9"
              >
                {muted ? (
                  <VolumeX aria-hidden="true" className="size-5 max-md:size-4" />
                ) : (
                  <Volume2 aria-hidden="true" className="size-5 max-md:size-4" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <div
        data-sea
        className="relative left-[calc(50%-50vw)] -mt-[calc(var(--sea-h)*0.1175)] h-(--sea-h) w-screen [--sea-h:140px] sm:[--sea-h:180px] lg:[--sea-h:220px] lg:[@media(max-height:50rem)]:[--sea-h:170px]"
      >
        <SeaLayers part="back" />
        <HeroPier />
        <SeaLayers part="front" className="z-20" />
        {/* Without motion the boat rests level by the pier, in the front
            swell's trough 180px from the left edge (83.3% down the box). */}
        <VoyageBoat className="top-[83.33%] left-45 z-30 w-20 -translate-x-1/2 -translate-y-[80%] sm:w-28 lg:w-34" />
      </div>
    </div>
  );
}

// The small pier the boat leaves from, at the left edge of the hero's sea:
// a deck at half the sea box's height (above the swell's crests), its posts
// fading into the water, and a small capstan on it. Hidden on phones, where
// the boat has the whole width to sail.
function HeroPier() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 112 150"
      className="absolute top-[calc(50%-39px)] left-0 z-20 w-22 max-sm:hidden lg:top-[calc(50%-50px)] lg:w-28"
      style={{ maskImage: "linear-gradient(to bottom, black 55%, transparent)" }}
    >
      {/* Posts, then the deck (its top at y = 50) and a bollard at its end. */}
      <path d="M10 54 h6 v96 h-6 Z M50 54 h6 v96 h-6 Z M88 54 h6 v96 h-6 Z" className="fill-heading" fillOpacity="0.5" />
      <rect x="-4" y="46" width="108" height="8" rx="1.5" className="fill-heading" fillOpacity="0.85" />
      <rect x="92" y="38" width="8" height="8" rx="2" className="fill-heading" />
      {/* Capstan: drum, cap and one bar seen side on. */}
      <rect x="30" y="27" width="16" height="19" rx="3" className="fill-heading" />
      <ellipse cx="38" cy="27" rx="12" ry="4" className="fill-kicker" />
      <path d="M22 33 H54" className="stroke-heading" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
