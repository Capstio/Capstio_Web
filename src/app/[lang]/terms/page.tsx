import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoon, comingSoonMetadata } from "@/components/page/coming-soon";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";

const path = "/terms";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/terms">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { footer } = await getDictionary(lang);
  return comingSoonMetadata(lang, path, footer.links.terms);
}

export default async function TermsPage({ params }: PageProps<"/[lang]/terms">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { footer } = await getDictionary(lang);
  return <ComingSoon lang={lang} path={path} title={footer.links.terms} />;
}
