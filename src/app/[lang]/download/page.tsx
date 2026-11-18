import { Check } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { withCode } from "@/components/home/inline-code";
import { ReleaseCard } from "@/components/home/latest-release";
import { SshImportColumn } from "@/components/home/ssh-import";
import { PageSection } from "@/components/page/page-section";
import { PageShell } from "@/components/page/page-shell";
import { DownloadButton } from "@/components/ui";
import { getDictionary, getPageCopy } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { getLatestRelease } from "@/lib/releases";
import { pageMetadata } from "@/lib/seo";
import { downloadHref } from "@/lib/site-nav";

const path = "/download";

const card =
  "flex flex-col gap-3 rounded-[20px] border border-bento-line bg-bento-card p-4.75 lg:rounded-xl lg:p-5.75";

const cardTitle = "text-lg font-semibold text-strong";

const chip =
  "type-mono-s rounded-[5px] border border-chip-line bg-chip px-1 py-0.5 whitespace-nowrap text-chip-text";

function CheckList({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm leading-6 text-soft">
          <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-tile-success" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/download">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const copy = await getPageCopy(lang, "download");
  return pageMetadata(lang, path, {
    title: copy.meta.title,
    description: copy.meta.description,
  });
}

// "Get started" (brief 4.1 and 8.4): the download button, what the Mac and
// the servers need, the supported distributions, and the first run, ending
// with the ~/.ssh/config import demo. Every Download button on the site goes
// straight to the newest GitHub release; this page is the guide around it.
export default async function DownloadPage({ params }: PageProps<"/[lang]/download">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [{ home }, copy, release] = await Promise.all([
    getDictionary(lang),
    getPageCopy(lang, "download"),
    getLatestRelease(),
  ]);

  return (
    <PageShell
      lang={lang}
      trail={[{ name: copy.crumb, path }]}
      title={copy.title}
      intro={copy.intro}
    >
      <PageSection id="get" title={copy.download.title} className="grid gap-4 md:grid-cols-2">
        <div className={card}>
          <p className="text-base leading-7 text-soft">{copy.download.body}</p>
          <DownloadButton href={downloadHref} size="lg" className="h-13 w-full md:w-fit">
            {home.hero.cta}
          </DownloadButton>
          <p className="text-[0.8125rem] leading-5 text-soft">{copy.download.requirement}</p>
        </div>
        <ReleaseCard lang={lang} dict={home.latest} release={release} titleAs="h3" />
      </PageSection>

      <PageSection
        id="requirements"
        title={copy.requirements.title}
        className="grid gap-4 md:grid-cols-2"
      >
        {[copy.requirements.mac, copy.requirements.server].map((group) => (
          <div key={group.title} className={card}>
            <h3 className={cardTitle}>{group.title}</h3>
            <CheckList items={group.items} />
          </div>
        ))}
      </PageSection>

      <PageSection
        id="distros"
        title={copy.distros.title}
        intro={copy.distros.intro}
        className="grid gap-4 md:grid-cols-3"
      >
        {copy.distros.tiers.map((tier) => (
          <div key={tier.label} className={card}>
            <h3 className={cardTitle}>{tier.label}</h3>
            <p className="text-sm leading-6 text-soft">{tier.body}</p>
            <ul className="flex flex-wrap gap-2">
              {tier.items.map((distro) => (
                <li
                  key={distro}
                  className="rounded-md border border-bento-line px-2.5 py-1 font-mono text-sm text-strong"
                >
                  {distro}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </PageSection>

      <PageSection
        id="first-run"
        title={copy.firstRun.title}
        intro={copy.firstRun.intro}
        className="flex flex-col gap-8 lg:gap-12"
      >
        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {copy.firstRun.steps.map((step, index) => (
            <li key={step.title} className={card}>
              <span
                aria-hidden="true"
                className="inline-flex size-8 items-center justify-center rounded-[9px] bg-kicker/14 font-mono text-sm font-semibold text-kicker"
              >
                {index + 1}
              </span>
              <h3 className={cardTitle}>{step.title}</h3>
              <p className="text-sm leading-6 text-soft">{withCode(step.body, chip)}</p>
            </li>
          ))}
        </ol>
        <SshImportColumn dict={home.migrate} />
      </PageSection>
    </PageShell>
  );
}
