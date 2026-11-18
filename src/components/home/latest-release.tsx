import { BookOpen, Rocket } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionaries";
import { fill, type Locale } from "@/lib/i18n";
import { getLatestRelease, type Release } from "@/lib/releases";
import { releasesPage } from "@/lib/site-nav";
import { withArrow } from "./with-arrow";

type LatestDict = Dictionary["home"]["latest"];

// Release dates as the brief asks: 04/11/2026 in Vietnamese, Nov 4, 2026 in English.
export function formatReleaseDate(iso: string, lang: Locale) {
  return new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-US", {
    day: lang === "vi" ? "2-digit" : "numeric",
    month: lang === "vi" ? "2-digit" : "short",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(iso));
}

const card =
  "flex flex-col gap-3 rounded-[20px] border border-bento-line bg-bento-card p-4.75 lg:rounded-xl lg:p-5.75";

const label = "inline-flex items-center gap-2 text-xs font-semibold text-kicker uppercase";

// "What's new" (brief 8.4), the compact column of Get started: the newest real
// release from GitHub, or the "first beta is on its way" state while there is
// none; Insights says it is coming until real posts exist. Nothing is made up
// to look busy. It sits under the section's h2, so its title is an h3 and the
// card titles h4.
export async function LatestColumn({
  lang,
  dict,
  className,
}: {
  lang: Locale;
  dict: LatestDict;
  className?: string;
}) {
  const release = await getLatestRelease();

  return (
    <div id="latest" className={cn("flex flex-col gap-5 lg:gap-6", className)}>
      <div data-reveal-self className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-kicker uppercase">{dict.overline}</p>
        <h3 className="text-xl leading-7 font-bold text-strong lg:text-2xl lg:leading-8">{dict.title}</h3>
      </div>

      <div data-reveal className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <ReleaseCard lang={lang} dict={dict} release={release} />

        <article className={card}>
          <p className={label}>
            <BookOpen aria-hidden="true" className="size-4" />
            {dict.insightsLabel}
          </p>
          <h4 className="text-lg font-semibold text-strong">{dict.insightsTitle}</h4>
          <p className="text-sm text-soft">{dict.insightsBody}</p>
        </article>
      </div>
    </div>
  );
}

// The newest release (name, date, tag, link to its GitHub page), or the
// "first beta is on its way" state when `release` is null. Pass the result
// of getLatestRelease (lib/releases). The title is an h4 (under an h3) unless
// `titleAs` sets the level that fits the page's outline.
export function ReleaseCard({
  lang,
  dict,
  release,
  titleAs: Title = "h4",
}: {
  lang: Locale;
  dict: LatestDict;
  release: Release | null;
  titleAs?: "h2" | "h3" | "h4";
}) {
  return (
    <article className={card}>
      <p className={label}>
        <Rocket aria-hidden="true" className="size-4" />
        {dict.releaseLabel}
      </p>
      {release ? (
        <>
          <Title className="text-lg font-semibold text-strong">{release.name}</Title>
          <p className="text-sm text-soft">
            {fill(dict.releasedOn, { date: formatReleaseDate(release.publishedAt, lang) })} ·{" "}
            <span className="font-mono">{release.tag}</span>
          </p>
          <a
            href={release.url}
            className="mt-auto w-fit text-sm font-medium text-kicker underline-offset-4 hover:underline"
          >
            {withArrow(dict.viewRelease, "size-4")}
          </a>
        </>
      ) : (
        <>
          <Title className="text-lg font-semibold text-strong">{dict.comingSoonTitle}</Title>
          <p className="text-sm text-soft">{dict.comingSoonBody}</p>
          <a
            href={releasesPage}
            className="mt-auto w-fit text-sm font-medium text-kicker underline-offset-4 hover:underline"
          >
            {withArrow(dict.allReleases, "size-4")}
          </a>
        </>
      )}
    </article>
  );
}
