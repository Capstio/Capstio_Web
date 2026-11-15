import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

// Link text followed by an arrow. The last word and the arrow never break
// apart, so the arrow does not wrap onto a line of its own.
export function withArrow(text: string, arrowClassName = "size-3.5") {
  const split = text.lastIndexOf(" ") + 1;
  return (
    <>
      {text.slice(0, split)}
      <span className="whitespace-nowrap">
        {text.slice(split)}
        <ArrowRight aria-hidden="true" className={cn("ml-1 inline align-[-0.15em]", arrowClassName)} />
      </span>
    </>
  );
}
