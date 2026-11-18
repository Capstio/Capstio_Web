import Image from "next/image";
import fleetDark from "../../../public/features/fleet-dark.png";
import fleetLight from "../../../public/features/fleet-light.png";

// The Fleet screenshot. Unlike the Apps and Config ones it has no macOS
// shadow margin, so it is inset to show the window at the same size in the
// same frame, with a drawn shadow in light mode. Fills its nearest
// positioned parent (give it `relative` and an aspect ratio, for example the
// product tour's aspect-[3000/1810] frame). Theme-aware: only the image that
// matches the theme is displayed, so the other one is never downloaded.
export function FleetScreenshot({ alt, sizes }: { alt: string; sizes: string }) {
  return (
    <div className="absolute inset-[3.5%]">
      <Image
        src={fleetLight}
        alt={alt}
        fill
        sizes={sizes}
        placeholder="blur"
        className="object-contain filter-(--sp-fleet-shadow) dark:hidden"
      />
      <Image
        src={fleetDark}
        alt={alt}
        fill
        sizes={sizes}
        placeholder="blur"
        className="hidden object-contain dark:block"
      />
    </div>
  );
}
