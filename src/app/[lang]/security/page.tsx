import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrivacyColumn } from "@/components/home/privacy-trust";
import { TeamVaultColumn } from "@/components/home/team-vault";
import { withArrow } from "@/components/home/with-arrow";
import { PageSection } from "@/components/page/page-section";
import { PageShell } from "@/components/page/page-shell";
import { getDictionary, getPageCopy } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { releasesRepo, securityHref } from "@/lib/site-nav";

// Public issues of the release repository. Private vulnerability reporting is
// not enabled there and the security mailbox is not live yet, so the page asks
// reporters to request a private channel without posting details.
const issuesHref = `https://github.com/${releasesRepo}/issues`;

const card = "flex flex-col gap-2 rounded-lg border border-bento-line bg-bento-card p-4.75 lg:p-5.75";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/security">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const copy = await getPageCopy(lang, "security");
  return pageMetadata(lang, securityHref, { title: copy.meta.title, description: copy.meta.description });
}

function Cards({ items }: { items: { title: string; body: string }[] }) {
  return items.map((item) => (
    <div key={item.title} className={card}>
      <h3 className="text-[0.9375rem] leading-5 font-semibold text-strong lg:text-base">{item.title}</h3>
      <p className="text-sm leading-[1.3125rem] text-soft">{item.body}</p>
    </div>
  ));
}

export default async function SecurityPage({ params }: PageProps<"/[lang]/security">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [{ home, footer }, copy] = await Promise.all([
    getDictionary(lang),
    getPageCopy(lang, "security"),
  ]);

  return (
    <PageShell
      lang={lang}
      trail={[{ name: footer.links.security, path: securityHref }]}
      title={copy.title}
      intro={copy.intro}
    >
      <PageSection
        id="principles"
        title={copy.principles.title}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <Cards items={copy.principles.items} />
      </PageSection>

      <PageSection id="data" title={copy.data.title}>
        <PrivacyColumn lang={lang} dict={home.privacy} className="flex flex-col gap-5 lg:gap-6" hideSecurityLink />
      </PageSection>

      <PageSection id="vault" title={copy.team.title}>
        <TeamVaultColumn lang={lang} dict={home.team} className="flex max-w-200 flex-col gap-4 lg:gap-5" />
      </PageSection>

      <PageSection
        id="limits"
        title={copy.limits.title}
        intro={copy.limits.intro}
        className="grid gap-4 md:grid-cols-2"
      >
        <Cards items={copy.limits.items} />
      </PageSection>

      <PageSection id="report" title={copy.contact.title} intro={copy.contact.body}>
        <a
          href={issuesHref}
          className="w-fit text-sm font-medium text-kicker underline-offset-4 hover:underline"
        >
          {withArrow(copy.contact.link, "size-4")}
        </a>
      </PageSection>
    </PageShell>
  );
}
