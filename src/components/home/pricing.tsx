import { Check } from "lucide-react";
import { Container, DownloadButton, Section } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionaries";
import { planIds, plans } from "@/lib/pricing";
import { downloadHref } from "@/lib/site-nav";

type PricingDict = Dictionary["home"]["pricing"];

const headingId = "pricing-heading";

// Figma strokes sit inside the frame and take no space; CSS borders do, so
// the paddings are 1px smaller than Figma (20 / 32).
const card = "flex flex-col gap-6 rounded-[20px] border p-4.75 lg:rounded-3xl lg:p-7.75";

// Home section "Pricing": the Personal and Team plans side by side from
// 1024px, stacked below. Prices come from lib/pricing, which also feeds the
// structured data, so the page and search engines show the same numbers. The
// Team card uses the call-to-action background to stand apart.
export function Pricing({ dict }: { dict: PricingDict }) {
  return (
    <Section
      id="pricing"
      surface="light"
      aria-labelledby={headingId}
      spacing="py-10 lg:py-20"
      // Keeps the heading clear of the fixed header when opened via #pricing.
      className="scroll-mt-16 lg:scroll-mt-18"
    >
      <Container className="flex flex-col gap-8 lg:gap-12">
        <div data-reveal className="flex flex-col gap-4 lg:items-center lg:text-center">
          <p className="text-[0.8125rem] leading-4 font-semibold text-kicker uppercase">
            {dict.overline}
          </p>
          <h2 id={headingId} className="type-h2 text-strong">
            {dict.title}
          </h2>
          <p className="max-w-170 text-base leading-6 text-soft">{dict.subtitle}</p>
        </div>

        <div data-reveal className="mx-auto grid w-full max-w-240 gap-4 lg:grid-cols-2 lg:gap-6">
          {planIds.map((id) => {
            const plan = dict.plans[id];
            return (
              <div
                key={id}
                className={cn(
                  card,
                  id === "team"
                    ? "border-cta-line bg-(image:--sp-cta-bg)"
                    : "border-bento-line bg-bento-card",
                )}
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg leading-[1.375rem] font-semibold text-strong lg:text-xl lg:leading-6">
                    {plan.name}
                  </h3>
                  <p className="text-sm leading-[1.3125rem] text-soft">{plan.description}</p>
                </div>

                <p className="flex items-baseline gap-2">
                  <span className="text-5xl leading-12 font-semibold tracking-[-2px] text-strong">
                    ${plans[id].price}
                  </span>
                  <span className="text-[0.9375rem] font-medium text-soft">{plan.period}</span>
                </p>

                <DownloadButton href={downloadHref} size="lg" className="h-13 w-full">
                  {dict.cta}
                </DownloadButton>

                <hr className="border-bento-line" />

                <ul className="flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-tile-success/16 text-tile-success"
                      >
                        <Check className="size-3" strokeWidth={2.2} />
                      </span>
                      <span className="text-[0.9375rem] leading-5 text-strong">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
