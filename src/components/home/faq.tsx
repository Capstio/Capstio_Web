import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { Container, Section } from "@/components/ui";
import type { Dictionary } from "@/lib/dictionaries";
import { localizePath, type Locale } from "@/lib/i18n";
import { faqPageJsonLd, jsonLd } from "@/lib/seo";
import { LegMark } from "./leg-mark";
import { withArrow } from "./with-arrow";

type FaqDict = Dictionary["home"]["faq"];

export type FaqItem = { question: string; answer: string };

const headingId = "faq-heading";

// All home items share this name, so the browser keeps at most one open.
const groupName = "home-faq";

// A list of questions as native <details>: keyboard, screen readers and
// in-page search work without client JS. Items with the same `name` form one
// group in which the browser keeps at most one open, also across lists. The
// questions are h3, so the list belongs under an h2.
export function FaqList({
  items,
  name,
  openFirst = false,
  className,
}: {
  items: FaqItem[];
  name: string;
  openFirst?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <details
          key={item.question}
          name={name}
          open={openFirst && index === 0}
          className="group details-reveal border-faq-line not-last:border-b"
        >
          <summary className="group/summary flex cursor-pointer list-none items-center justify-between gap-6 rounded-md py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-kicker lg:py-6 [&::-webkit-details-marker]:hidden">
            <h3 className="text-base leading-6 font-semibold text-strong transition-colors duration-200 group-hover/summary:text-kicker lg:text-lg lg:leading-7">
              {item.question}
            </h3>
            <ChevronDown
              aria-hidden="true"
              className="size-5 shrink-0 text-soft transition-transform duration-250 ease-out group-open:rotate-180 group-open:text-kicker motion-reduce:transition-none"
              strokeWidth={1.75}
            />
          </summary>
          <p className="-mt-1 max-w-170 pr-11 pb-5 text-[0.9375rem] leading-6 text-soft lg:-mt-2 lg:pb-6 lg:text-base lg:leading-7">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

// Home section "Frequently asked questions": one column of questions, centered
// and as wide as on the FAQ page. The first question starts open.
// The home page answers only these questions (and lists only them in its
// FAQPage data); the link under them opens the full list on /faq.
export function Faq({
  lang,
  leg,
  dict,
  allLabel,
}: {
  lang: Locale;
  leg: string;
  dict: FaqDict;
  allLabel: string;
}) {
  return (
    <Section id="faq" surface="light" aria-labelledby={headingId} spacing="py-10 lg:py-16">
      <Container>
        <div className="flex flex-col gap-8 lg:gap-12">
          <div data-reveal className="flex flex-col gap-4 lg:items-center lg:text-center">
            <LegMark leg={leg}>{dict.overline}</LegMark>
            <h2 id={headingId} className="type-h2 text-strong">
              {dict.title}
            </h2>
          </div>

          <div data-reveal>
            <FaqList
              items={dict.items}
              name={groupName}
              openFirst
              className="mx-auto w-full max-w-200 border-faq-line"
            />
          </div>

          <Link
            href={localizePath(lang, "/faq")}
            className="type-small w-fit font-semibold text-section-link underline-offset-4 hover:underline lg:self-center"
          >
            {withArrow(allLabel)}
          </Link>
        </div>
      </Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqPageJsonLd(dict.items)) }}
      />
    </Section>
  );
}
