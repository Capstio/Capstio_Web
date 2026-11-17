import { Check, Users } from "lucide-react";
import Link from "next/link";
import type { Dictionary } from "@/lib/dictionaries";
import { localizePath, type Locale } from "@/lib/i18n";
import { withArrow } from "./with-arrow";

type TeamDict = Dictionary["home"]["team"];

// The team vault half of the Trust section (brief 4.15, 8.4): what the shared
// vault does, worded per brief section 7 (metadata stays readable; a lost
// recovery key cannot be worked around), and the four role names. Permissions
// per role are not listed until the product documents them. It sits under the
// section's h2, so its title is an h3 and the items and roles title are h4.
export function TeamVaultColumn({
  lang,
  dict,
  className,
}: {
  lang: Locale;
  dict: TeamDict;
  className?: string;
}) {
  return (
    <div id="team" data-reveal className={className}>
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-kicker uppercase">{dict.overline}</p>
        <h3 className="text-xl leading-7 font-bold text-balance text-strong lg:text-2xl lg:leading-8">
          {dict.title}
        </h3>
        <p className="text-sm leading-[1.3125rem] text-soft lg:text-[0.9375rem] lg:leading-6">
          {dict.subtitle}
        </p>
      </div>

      <ul className="flex flex-col gap-5 rounded-[20px] border border-bento-line bg-bento-card p-4.75 lg:rounded-xl lg:p-6.75">
        {dict.items.map((item) => (
          <li key={item.title} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-tile-success/16 text-tile-success"
            >
              <Check className="size-3" strokeWidth={2.2} />
            </span>
            <div className="flex flex-col gap-1">
              <h4 className="text-[0.9375rem] leading-[1.125rem] font-semibold text-strong">{item.title}</h4>
              <p className="text-sm leading-[1.3125rem] text-soft">{item.body}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-4 rounded-[20px] border border-cta-line bg-(image:--sp-cta-bg) p-4.75 lg:rounded-xl lg:p-6.75">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-flex size-10 items-center justify-center rounded-[12px] bg-kicker/14 text-kicker"
          >
            <Users className="size-5" strokeWidth={1.8} />
          </span>
          <h4 className="text-lg font-semibold text-strong">{dict.rolesTitle}</h4>
        </div>
        <ul className="flex flex-wrap gap-2">
          {dict.roles.map((role) => (
            <li
              key={role}
              className="rounded-full border border-bento-line bg-bento-card px-3 py-1 text-sm font-medium text-strong"
            >
              {role}
            </li>
          ))}
        </ul>
        <p className="text-sm text-soft">{dict.rolesNote}</p>
        <Link
          href={localizePath(lang, "/pricing")}
          className="w-fit text-sm font-medium text-kicker underline-offset-4 hover:underline"
        >
          {withArrow(dict.pricingLink, "size-4")}
        </Link>
      </div>
    </div>
  );
}
