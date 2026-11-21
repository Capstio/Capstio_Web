"use client";

import { Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";

// The product film is hosted on Mux, one asset per theme, and played in Mux's
// own iframe player (player.mux.com), so the page loads no video engine.
const playbackIds = {
  light: "JR6mFhk5QfvuJEpbVlbf22AhVFnaddzRqsYMoBP00ii8",
  dark: "cZFnbVkARaFucYU02wGmqkFXQujAGxXwDi00Ld1hRTkBY",
};

// "Watch the film" button of the hero and the overlay player it opens. The
// film never plays on its own: the iframe is mounted only while the overlay
// is open (so nothing is requested from Mux before the click, and closing it
// stops the film), with the theme's cut chosen when it opens. A native
// <dialog>: focus stays inside, Escape closes it and focus returns to the
// button; a click on the backdrop closes it too.
export function HeroFilm({
  labels,
}: {
  labels: { watch: string; close: string; title: string };
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [playbackId, setPlaybackId] = useState<string | null>(null);

  function open() {
    const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setPlaybackId(playbackIds[theme]);
    dialogRef.current?.showModal();
  }

  const close = () => dialogRef.current?.close();

  // The page behind does not scroll while the film is open.
  useEffect(() => {
    if (!playbackId) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [playbackId]);

  return (
    <>
      {/* The surface under the outlined button keeps the hero's dots from
          showing through it, while its hover tint still applies. The play
          glyph is filled without a stroke, so it has the Apple logo's weight
          and size on the download button beside it. */}
      <span className="w-full rounded-md bg-surface md:w-60">
        <Button variant="secondary" size="lg" onClick={open} aria-haspopup="dialog" className="h-13 w-full">
          {/* Half a pixel up (-mt-px in a centred row), onto the capitals' centre. */}
          <Play aria-hidden="true" className="-mt-px size-4 fill-current" strokeWidth={0} />
          {labels.watch}
        </Button>
      </span>

      <dialog
        ref={dialogRef}
        aria-label={labels.title}
        onClose={() => setPlaybackId(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-auto w-[min(72rem,calc(100vw-2rem))] overflow-visible bg-transparent p-0 backdrop:bg-scrim/80 backdrop:backdrop-blur-sm"
      >
        <div className="flex justify-end pb-3">
          <button
            type="button"
            onClick={close}
            aria-label={labels.close}
            className="inline-flex size-11 items-center justify-center rounded-full border border-on-scrim/20 bg-scrim/55 text-on-scrim transition-colors hover:bg-scrim/70 motion-reduce:transition-none"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-scrim">
          {playbackId && (
            <iframe
              src={`https://player.mux.com/${playbackId}?autoplay=true`}
              title={labels.title}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
              className="size-full border-none"
            />
          )}
        </div>
      </dialog>
    </>
  );
}
