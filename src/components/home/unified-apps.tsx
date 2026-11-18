import { ScanSearch, ScrollText, SlidersHorizontal, type LucideIcon } from "lucide-react";
import Image from "next/image";
import appsDark from "../../../public/features/apps-dark.png";
import appsLight from "../../../public/features/apps-light.png";

// The "Apps" view of the product tour: the Apps tab screenshot and the icons
// of its three points (home.unifiedApps).

// Icons of the three points, in dictionary order (Figma "icon/auto-discovery",
// "icon/standardized-controls", "icon/instant-log-stream").
export const appsPointIcons: LucideIcon[] = [ScanSearch, SlidersHorizontal, ScrollText];

// The screenshot is the app window with its macOS shadow, fitted whole into
// the tour's screen frame (see product tour). Theme-aware: only the pair that
// matches the theme is displayed, so the other one is never downloaded.
export function AppsScreenshot({ alt, sizes }: { alt: string; sizes: string }) {
  return (
    <>
      <Image
        src={appsLight}
        alt={alt}
        fill
        sizes={sizes}
        placeholder="blur"
        className="object-contain dark:hidden"
      />
      <Image
        src={appsDark}
        alt={alt}
        fill
        sizes={sizes}
        placeholder="blur"
        className="hidden object-contain dark:block"
      />
    </>
  );
}
