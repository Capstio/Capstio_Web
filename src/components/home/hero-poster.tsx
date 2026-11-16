import Image from "next/image";
import posterDark from "../../../public/hero/poster-dark.jpg";
import posterLight from "../../../public/hero/poster-light.jpg";

// 1100px wide on desktop, the full container width (minus gutters) below it.
const sizes =
  "(min-width: 1164px) 1100px, (min-width: 768px) calc(100vw - 64px), calc(100vw - 32px)";

// Still frame of the hero film for the active theme (exported from Figma).
// It is the largest element of the first screen (LCP), so both stills load
// eagerly at high priority: the theme is only known in the browser, and a lazy
// image is fetched after layout instead of by the preload scanner. The other
// theme's still is display: none.
export function HeroPoster({ alt }: { alt: string }) {
  return (
    <>
      <Image
        src={posterLight}
        alt={alt}
        fill
        sizes={sizes}
        placeholder="blur"
        loading="eager"
        fetchPriority="high"
        className="object-cover dark:hidden"
      />
      <Image
        src={posterDark}
        alt={alt}
        fill
        sizes={sizes}
        placeholder="blur"
        loading="eager"
        fetchPriority="high"
        className="hidden object-cover dark:block"
      />
    </>
  );
}
