import { Check, EyeOff, History, ShieldCheck, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionaries";
import configDark from "../../../public/features/config-dark.png";
import configLight from "../../../public/features/config-light.png";

// The "Safe config" view of the product tour: the .env editor screenshot with
// its floating callouts, and the icons of its three points (home.safeConfig).

type SafeConfigDict = Dictionary["home"]["safeConfig"];

// Icons of the three points, in dictionary order (Figma "icon/syntax-guard",
// "icon/backup-history", "icon/secret-mask").
export const configPointIcons: LucideIcon[] = [ShieldCheck, History, EyeOff];

const callout =
  "absolute flex items-center rounded-[10px] border bg-callout text-xs leading-[0.9375rem] font-semibold text-callout-text";

// The screenshot is the app window with its macOS shadow, fitted whole into
// the tour's screen frame (see product tour). The callouts float over its
// lower left corner and repeat what the editor does; phones only get the
// syntax one, as in Figma.
export function ConfigScreenshot({
  dict,
  sizes,
}: {
  dict: Pick<SafeConfigDict, "imageAlt" | "syntaxValid" | "backupTitle" | "backupMeta" | "restore">;
  sizes: string;
}) {
  return (
    <>
      <Image
        src={configLight}
        alt={dict.imageAlt}
        fill
        sizes={sizes}
        placeholder="blur"
        className="object-contain dark:hidden"
      />
      <Image
        src={configDark}
        alt={dict.imageAlt}
        fill
        sizes={sizes}
        placeholder="blur"
        className="hidden object-contain dark:block"
      />

      {/* Decorative: the image alt already describes the screen. */}
      <div aria-hidden="true">
        <p
          className={cn(
            callout,
            "bottom-1 left-1 gap-2 border-callout-good-line py-2 pr-3 pl-2.5 shadow-(--sp-callout-good-shadow) md:bottom-[24%] md:left-[2%]",
          )}
        >
          <span className="inline-flex size-4 items-center justify-center rounded-full bg-callout-check text-callout-check-mark">
            <Check className="size-2.5" strokeWidth={4} />
          </span>
          {dict.syntaxValid}
        </p>

        <div
          className={cn(
            callout,
            "bottom-[8%] left-[2%] hidden gap-2.5 border-callout-line p-2.25 shadow-(--sp-callout-shadow) md:flex",
          )}
        >
          <span className="inline-flex size-6 items-center justify-center rounded-[7px] bg-callout-tile text-kicker">
            <History className="size-3.5" strokeWidth={2.2} />
          </span>
          <span className="flex flex-col gap-px">
            <span>{dict.backupTitle}</span>
            <span className="font-mono text-[0.65625rem] leading-3.5 font-normal text-callout-meta">
              {dict.backupMeta}
            </span>
          </span>
          <span className="ml-2.5 rounded-md bg-callout-button px-2.25 py-1 text-[0.6875rem] leading-3.25 text-kicker">
            {dict.restore}
          </span>
        </div>
      </div>
    </>
  );
}
