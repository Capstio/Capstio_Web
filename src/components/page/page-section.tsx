import type { ReactNode } from "react";
import { Container, Section } from "@/components/ui";

// One block of a sub-page: an h2 (under the page's h1), an optional lead
// paragraph, then the content. `id` is the section's anchor (#id) and names
// its heading for aria-labelledby, so it must be unique on the page.
// Sections follow each other at a calm, even rhythm on the light surface.
export function PageSection({
  id,
  title,
  intro,
  children,
  className,
}: {
  id: string;
  title: string;
  // Phrasing content only (text, links, code): it is rendered in a <p>.
  intro?: ReactNode;
  children?: ReactNode;
  // Layout of the content, replacing the default column (cn only joins
  // classes, so a grid passed here must not compete with flex), for
  // example "grid gap-4 md:grid-cols-2".
  className?: string;
}) {
  const headingId = `${id}-heading`;
  return (
    <Section id={id} surface="light" aria-labelledby={headingId} spacing="py-6 lg:py-10">
      <Container className="flex flex-col gap-5 lg:gap-6">
        <div className="flex max-w-200 flex-col gap-3">
          <h2 id={headingId} className="type-h3 text-balance text-strong">
            {title}
          </h2>
          {intro && <p className="text-base leading-7 text-soft">{intro}</p>}
        </div>
        {children && <div className={className ?? "flex flex-col gap-4"}>{children}</div>}
      </Container>
    </Section>
  );
}
