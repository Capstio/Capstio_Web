import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqList } from "@/components/home/faq";
import { PageSection } from "@/components/page/page-section";
import { PageShell } from "@/components/page/page-shell";
import { getDictionary, getPageCopy } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { faqPageJsonLd, jsonLd, pageMetadata } from "@/lib/seo";
import { faqHref } from "@/lib/site-nav";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/faq">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const copy = await getPageCopy(lang, "faq");
  return pageMetadata(lang, faqHref, { title: copy.meta.title, description: copy.meta.description });
}

// Every home question first (read from the home dictionary, so the two pages
// never drift), then the questions grouped by topic. The FAQPage data lists
// each visible question once.
export default async function FaqPage({ params }: PageProps<"/[lang]/faq">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [{ home, footer }, copy] = await Promise.all([getDictionary(lang), getPageCopy(lang, "faq")]);
  const groups = [
    { id: "common", title: copy.common.title, items: home.faq.items },
    ...copy.groups,
  ];

  return (
    <PageShell
      lang={lang}
      trail={[{ name: footer.links.faq, path: faqHref }]}
      title={copy.title}
      intro={copy.intro}
    >
      {groups.map((group, index) => (
        <PageSection key={group.id} id={group.id} title={group.title}>
          <FaqList items={group.items} name={`faq-${group.id}`} openFirst={index === 0} className="max-w-200" />
        </PageSection>
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqPageJsonLd(groups.flatMap((g) => g.items))) }}
      />
    </PageShell>
  );
}
