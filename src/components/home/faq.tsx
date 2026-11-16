import { ChevronDown } from "lucide-react";
import { Container, Section } from "@/components/ui";
import type { Dictionary } from "@/lib/dictionaries";
import { jsonLd } from "@/lib/seo";

type FaqDict = Dictionary["home"]["faq"];

const headingId = "faq-heading";

// All items share this name, so the browser keeps at most one open.
const groupName = "home-faq";

// FAQPage structured data built from the visible items, so the two cannot
// drift.
function faqJsonLd(items: FaqDict["items"]) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  });
}

// Home section "Frequently asked questions": a list split by hairlines.
// Native <details>: keyboard, screen readers and in-page search work without
// client JS. The first question starts open.
export function Faq({ dict }: { dict: FaqDict }) {
  return (
    <Section surface="light" aria-labelledby={headingId} spacing="py-10 lg:py-20">
      <Container>
        <div className="mx-auto flex max-w-200 flex-col gap-8 lg:gap-14">
          <div data-reveal className="flex flex-col gap-4 lg:items-center lg:text-center">
            <p className="text-[0.8125rem] leading-4 font-semibold text-kicker uppercase">
              {dict.overline}
            </p>
            <h2 id={headingId} className="type-h2 text-strong">
              {dict.title}
            </h2>
          </div>

          <div data-reveal>
            {dict.items.map((item, index) => (
              <details
                key={item.question}
                name={groupName}
                open={index === 0}
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
        </div>
      </Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqJsonLd(dict.items) }}
      />
    </Section>
  );
}
