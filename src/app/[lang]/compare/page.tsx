import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ComparisonTable } from "@/components/home/comparison-table";
import { withArrow } from "@/components/home/with-arrow";
import { PageSection } from "@/components/page/page-section";
import { PageShell } from "@/components/page/page-shell";
import { getDictionary, getPageCopy } from "@/lib/dictionaries";
import { hasLocale, localizePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { allFeaturesHref, securityHref } from "@/lib/site-nav";

const path = "/compare";

const linkClass =
  "type-small w-fit font-semibold text-section-link underline-offset-4 hover:underline";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/compare">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const copy = await getPageCopy(lang, "compare");
  return pageMetadata(lang, path, {
    title: copy.meta.title,
    description: copy.meta.description,
  });
}

// The plain terminal / web dashboard / Capstio table from the home page, with
// its scope stated next to it: what is compared and as of which date. No
// product-by-product comparison here; those need the owner's sign-off.
export default async function ComparePage({ params }: PageProps<"/[lang]/compare">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [{ header, home }, copy] = await Promise.all([
    getDictionary(lang),
    getPageCopy(lang, "compare"),
  ]);

  return (
    <PageShell
      lang={lang}
      trail={[{ name: header.nav.compare, path }]}
      title={copy.title}
      intro={copy.intro}
    >
      <PageSection id="comparison" title={copy.table.title} intro={copy.table.intro}>
        <ComparisonTable lang={lang} dict={home.problem.comparison} showLink={false} />
      </PageSection>

      <PageSection id="scope" title={copy.scope.title} intro={copy.scope.asOf}>
        <ul className="flex max-w-200 list-disc flex-col gap-2 pl-5 text-base leading-7 text-soft marker:text-section-link">
          {copy.scope.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </PageSection>

      <PageSection id="related" title={copy.related.title} className="flex flex-col gap-3">
        <Link href={localizePath(lang, securityHref)} className={linkClass}>
          {withArrow(copy.related.security, "size-4")}
        </Link>
        <Link href={localizePath(lang, allFeaturesHref)} className={linkClass}>
          {withArrow(copy.related.features, "size-4")}
        </Link>
      </PageSection>
    </PageShell>
  );
}
