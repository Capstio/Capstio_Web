import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReleaseCard } from "@/components/home/latest-release";
import { PageSection } from "@/components/page/page-section";
import { PageShell } from "@/components/page/page-shell";
import { getDictionary, getPageCopy } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { getLatestRelease } from "@/lib/releases";
import { pageMetadata } from "@/lib/seo";

const path = "/release-notes";

// Anchor of a release in the brief's format: tag "v0.2.0" -> "#0-2-0".
function releaseAnchor(tag: string) {
  const slug = tag
    .replace(/^v/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "latest";
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/release-notes">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const copy = await getPageCopy(lang, "release-notes");
  return pageMetadata(lang, path, {
    title: copy.meta.title,
    description: copy.meta.description,
  });
}

// Release notes, newest first. Only real GitHub releases are shown: while
// none exists, the card shows the "first beta is on its way" state and
// nothing else is listed (no invented history). The newest release's section
// carries its version anchor, e.g. /release-notes#0-2-0.
export default async function ReleaseNotesPage({
  params,
}: PageProps<"/[lang]/release-notes">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [{ header, home }, copy, release] = await Promise.all([
    getDictionary(lang),
    getPageCopy(lang, "release-notes"),
    getLatestRelease(),
  ]);

  return (
    <PageShell
      lang={lang}
      trail={[{ name: header.nav.releaseNotes, path }]}
      title={copy.title}
      intro={copy.intro}
    >
      <PageSection
        id={release ? releaseAnchor(release.tag) : "latest"}
        title={copy.latest.title}
        className="max-w-200"
      >
        <ReleaseCard lang={lang} dict={home.latest} release={release} titleAs="h3" />
      </PageSection>

      <PageSection id="format" title={copy.format.title} intro={copy.format.intro}>
        <ul className="flex max-w-200 list-disc flex-col gap-2 pl-5 text-base leading-7 text-soft marker:text-section-link">
          {copy.format.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </PageSection>
    </PageShell>
  );
}
