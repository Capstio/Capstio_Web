import { KeyRound, Lock, ServerOff, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Container, Section } from "@/components/ui";
import type { Dictionary, PageCopy } from "@/lib/dictionaries";
import { localizePath, type Locale } from "@/lib/i18n";
import { featureHref, securityHref } from "@/lib/site-nav";
import { SectionHeading } from "./section-heading";
import { withArrow } from "./with-arrow";

type TrustLinks = PageCopy<"home-links">["trust"];

const headingId = "trust-heading";

// One icon per fact, in the order of the facts in the copy: keys in the
// Keychain, no server agent, the end-to-end encrypted vault.
const factIcons: LucideIcon[] = [KeyRound, ServerOff, Lock];

const link =
  "type-small w-fit font-semibold text-section-link underline-offset-4 hover:underline";

// Leg "Teams & privacy" as a short strip: three facts about where keys and
// data live, then links to the full security architecture (/security) and to
// the team vault (/features/teams), which hold the details.
export function Trust({
  lang,
  leg,
  dict,
  links,
  securityLabel,
}: {
  lang: Locale;
  leg: string;
  dict: Dictionary["home"]["trust"];
  links: TrustLinks;
  // Label of the link to /security.
  securityLabel: string;
}) {
  if (links.facts.length !== factIcons.length) {
    throw new Error(`Trust strip expects ${factIcons.length} facts, got ${links.facts.length}`);
  }

  return (
    <Section id="trust" surface="light" aria-labelledby={headingId} spacing="py-10 lg:py-16">
      <Container className="flex flex-col gap-6 lg:gap-10">
        <SectionHeading leg={leg} id={headingId} overline={dict.overline} title={dict.title} />

        <ul data-reveal className="grid gap-3 lg:grid-cols-3 lg:gap-6">
          {links.facts.map((fact, index) => {
            const Icon = factIcons[index];
            return (
              <li
                key={fact.title}
                className="flex gap-4 rounded-lg border border-card-line bg-card p-5 shadow-(--sp-card-shadow) lg:p-6"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-tile-success/15 text-tile-success"
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base leading-6 font-semibold text-strong">{fact.title}</h3>
                  <p className="type-small text-soft">{fact.body}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div
          data-reveal
          className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8 lg:justify-center"
        >
          <Link href={localizePath(lang, securityHref)} className={link}>
            {withArrow(securityLabel)}
          </Link>
          <Link href={localizePath(lang, featureHref.teams)} className={link}>
            {withArrow(links.teams)}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
