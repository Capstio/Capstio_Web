"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CopyState = "idle" | "copied" | "failed";

// Copies text to the clipboard and reports the outcome for a short while, so
// a button can say "Copied" (or ask the visitor to copy by hand when the
// browser refuses, for example outside a secure context).
export function useClipboard(resetAfter = 2000) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      let next: CopyState = "copied";
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        next = "failed";
      }
      setState(next);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setState("idle"), resetAfter);
      return next;
    },
    [resetAfter],
  );

  return { state, copy };
}
