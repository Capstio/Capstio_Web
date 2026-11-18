// The home page as one voyage: each section between the hero (leaving port)
// and the harbor finale is a leg, in page order. This one list numbers the
// section overlines ("Leg 03"), places the knots on the page capstan's rope
// and orders the command palette's "Go to" list, so reordering sections never
// leaves them out of step. Only sections on the home page are legs;
// pricing and getting started live on their own pages. `key` names the section in the
// dictionaries (palette.sections), `id` is its anchor on the page.
export const voyage = [
  { id: "problem", key: "problem" },
  { id: "try", key: "try" },
  { id: "tour", key: "tour" },
  { id: "features", key: "features" },
  { id: "trust", key: "trust" },
  { id: "faq", key: "faq" },
] as const;

export type Leg = (typeof voyage)[number];
export type LegId = Leg["id"];
export type LegKey = Leg["key"];

// Two-digit leg number of a section, for example "03".
export function legNumber(id: LegId): string {
  return String(voyage.findIndex((leg) => leg.id === id) + 1).padStart(2, "0");
}
