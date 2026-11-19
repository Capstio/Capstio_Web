import {
  ArrowLeftRight,
  Bell,
  BookOpen,
  Box,
  FileCode2,
  Info,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  SquareTerminal,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { CommandConsole } from "@/components/home/command-equivalent";
import { DangerConsole } from "@/components/home/danger-demo";
import { withArrow } from "@/components/home/with-arrow";
import { CommandBlock } from "@/components/page/command-block";
import { PageSection } from "@/components/page/page-section";
import { PageShell } from "@/components/page/page-shell";
import { AppPlayground, PlaygroundFrame, type Screen } from "@/components/playground/app-playground";
import { Card } from "@/components/ui";
import { appActions, equivalentCommands, runtimeNames, runtimes, type AppAction } from "@/lib/commands";
import { getDictionary, getPageCopy, type Dictionary } from "@/lib/dictionaries";
import { localizePath, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { allFeaturesHref, featureHref, featureKeys, type FeatureKey } from "@/lib/site-nav";

// Copy of one feature page in src/dictionaries/pages/features.<locale>.json
// (`pages.<featureKey>`). Declaring the shape here makes the JSON checked
// against it: every feature key must have a page, and every section the
// fields the renderer reads.
type Point = { title: string; body: string };
type SectionCopy = {
  id: string;
  title: string;
  intro?: string;
  points?: readonly Point[];
  // Real commands, each with what it is for.
  commands?: readonly { command: string; caption: string }[];
  // An app action whose equivalent command is shown for every runtime, read
  // from lib/commands so it always matches the home console.
  runtimeCommands?: string;
  // A stated limit of the feature, shown as a callout.
  note?: string;
  // One of the visuals below, shown first in the section.
  visual?: string;
};
type FeatureCopy = {
  meta: { title: string; description: string };
  title: string;
  intro: string;
  sections: readonly SectionCopy[];
  related: readonly string[];
};

export const featureIcons: Record<FeatureKey, LucideIcon> = {
  apps: LayoutGrid,
  docker: Box,
  safeConfig: FileCode2,
  terminal: SquareTerminal,
  recipes: BookOpen,
  alerts: Bell,
  sshSecurity: ShieldCheck,
  tunnels: ArrowLeftRight,
  ai: Sparkles,
  teams: Users,
};

// The URL segment of each feature, taken from its href so the two never drift.
export function featureSlug(key: FeatureKey): string {
  return featureHref[key].slice(allFeaturesHref.length + 1);
}

export function featureKeyFromSlug(slug: string): FeatureKey | undefined {
  return featureKeys.find((key) => featureSlug(key) === slug);
}

function isFeatureKey(value: string): value is FeatureKey {
  return (featureKeys as readonly string[]).includes(value);
}

function isAppAction(value: string): value is AppAction {
  return (appActions as readonly string[]).includes(value);
}

async function loadFeatureCopy(lang: Locale, key: FeatureKey) {
  const copy = await getPageCopy(lang, "features");
  const pages: Record<FeatureKey, FeatureCopy> = copy.pages;
  return { copy, page: pages[key] };
}

export async function featureMetadata(lang: Locale, key: FeatureKey): Promise<Metadata> {
  const { page } = await loadFeatureCopy(lang, key);
  return pageMetadata(lang, featureHref[key], page.meta);
}

// The app playground opened on one screen, in the product tour's frame.
export function PlaygroundVisual({ home, screen }: { home: Dictionary["home"]; screen: Screen }) {
  return (
    <PlaygroundFrame>
      <AppPlayground dict={{ ...home.playground, config: home.safeConfig }} initialScreen={screen} />
    </PlaygroundFrame>
  );
}

function renderVisual(visual: string | undefined, home: Dictionary["home"]): ReactNode {
  switch (visual) {
    case "apps-playground":
      return <PlaygroundVisual home={home} screen="apps" />;
    case "config-playground":
      return <PlaygroundVisual home={home} screen="files" />;
    case "command-console":
      return <CommandConsole dict={home.command} />;
    case "danger-console":
      return <DangerConsole dict={home.danger} />;
    default:
      return null;
  }
}

// Short facts of a section as a grid of cards; each title is an h3 under
// the section's h2.
export function FeaturePoints({ points }: { points: readonly Point[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {points.map((point) => (
        <li key={point.title}>
          <Card className="flex h-full flex-col gap-2 p-5">
            <h3 className="text-base leading-6 font-semibold text-strong">{point.title}</h3>
            <p className="text-sm leading-6 text-soft">{point.body}</p>
          </Card>
        </li>
      ))}
    </ul>
  );
}

// A card linking to one feature page, with the nav title and description.
export function FeatureLinkCard({
  lang,
  featureKey,
  features,
  more,
}: {
  lang: Locale;
  featureKey: FeatureKey;
  features: Dictionary["features"];
  more: string;
}) {
  const Icon = featureIcons[featureKey];
  const { title, description } = features[featureKey];
  return (
    <Link
      href={localizePath(lang, featureHref[featureKey])}
      className="group flex h-full flex-col gap-3 rounded-lg border border-line bg-surface p-5 shadow-sm transition-colors hover:border-line-strong motion-reduce:transition-none"
    >
      <span
        aria-hidden="true"
        className="inline-flex size-9 items-center justify-center rounded-lg bg-tile-accent/14 text-tile-accent"
      >
        <Icon className="size-4.5" />
      </span>
      <span className="text-base leading-6 font-semibold text-strong">{title}</span>
      <span className="flex-1 text-sm leading-6 text-soft">{description}</span>
      <span className="text-[0.8125rem] font-medium text-kicker underline-offset-4 group-hover:underline">
        {withArrow(more)}
      </span>
    </Link>
  );
}

function Note({ label, children }: { label: string; children: string }) {
  return (
    <aside className="flex max-w-200 gap-3 rounded-lg border border-line bg-surface p-4">
      <Info aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-tile-info" />
      <p className="text-sm leading-6 text-soft">
        <strong className="font-semibold text-strong">{label}</strong> {children}
      </p>
    </aside>
  );
}

// One feature page: breadcrumb Home › Features › this feature, the h1 and
// intro, the sections of its copy (visual, facts, real commands, limits),
// then two related features. The shell adds the download band.
export async function FeaturePage({ lang, featureKey }: { lang: Locale; featureKey: FeatureKey }) {
  const [{ copy, page }, { home, features }, common] = await Promise.all([
    loadFeatureCopy(lang, featureKey),
    getDictionary(lang),
    getPageCopy(lang, "common"),
  ]);
  const related = page.related.filter(isFeatureKey).filter((key) => key !== featureKey);

  return (
    <PageShell
      lang={lang}
      trail={[
        { name: copy.title, path: allFeaturesHref },
        { name: features[featureKey].title, path: featureHref[featureKey] },
      ]}
      title={page.title}
      intro={page.intro}
    >
      {page.sections.map((section) => {
        const action = section.runtimeCommands;
        return (
          <PageSection key={section.id} id={section.id} title={section.title} intro={section.intro}>
            {renderVisual(section.visual, home)}
            {section.points && section.points.length > 0 && <FeaturePoints points={section.points} />}
            {action && isAppAction(action) && (
              <div className="grid gap-4 lg:grid-cols-3">
                {runtimes.map((runtime) => (
                  <CommandBlock
                    key={runtime}
                    command={equivalentCommands[runtime][action]}
                    caption={runtimeNames[runtime]}
                    labels={common.copy}
                  />
                ))}
              </div>
            )}
            {section.commands?.map(({ command, caption }) => (
              <CommandBlock key={command} command={command} caption={caption} labels={common.copy} />
            ))}
            {section.note && <Note label={copy.labels.note}>{section.note}</Note>}
          </PageSection>
        );
      })}

      {related.length > 0 && (
        <PageSection id="related" title={copy.labels.related} className="grid gap-4 md:grid-cols-2">
          {related.map((key) => (
            <FeatureLinkCard
              key={key}
              lang={lang}
              featureKey={key}
              features={features}
              more={copy.labels.more}
            />
          ))}
        </PageSection>
      )}
    </PageShell>
  );
}
