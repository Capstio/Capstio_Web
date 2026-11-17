import "server-only";
import type { Locale } from "./i18n";

const dictionaries = {
  vi: () => import("../dictionaries/vi.json").then((m) => m.default),
  en: () => import("../dictionaries/en.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["vi"]>>;

export const getDictionary = (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();

// Copy of one sub-page, kept out of the shared dictionaries so pages can be
// written side by side: src/dictionaries/pages/<page>.<locale>.json. The type
// of each page comes from its vi file; the en file must have the same keys,
// or this file fails to typecheck. Imports stay static so the bundler ships
// only the file that is asked for.
type Loader<T> = () => Promise<T>;

function page<T>(vi: Loader<T>, en: Loader<NoInfer<T>>): Record<Locale, Loader<T>> {
  return { vi, en };
}

const loaders = {
  common: page(
    () => import("../dictionaries/pages/common.vi.json").then((m) => m.default),
    () => import("../dictionaries/pages/common.en.json").then((m) => m.default),
  ),
  "home-links": page(
    () => import("../dictionaries/pages/home-links.vi.json").then((m) => m.default),
    () => import("../dictionaries/pages/home-links.en.json").then((m) => m.default),
  ),
  pricing: page(
    () => import("../dictionaries/pages/pricing.vi.json").then((m) => m.default),
    () => import("../dictionaries/pages/pricing.en.json").then((m) => m.default),
  ),
  faq: page(
    () => import("../dictionaries/pages/faq.vi.json").then((m) => m.default),
    () => import("../dictionaries/pages/faq.en.json").then((m) => m.default),
  ),
  security: page(
    () => import("../dictionaries/pages/security.vi.json").then((m) => m.default),
    () => import("../dictionaries/pages/security.en.json").then((m) => m.default),
  ),
  compare: page(
    () => import("../dictionaries/pages/compare.vi.json").then((m) => m.default),
    () => import("../dictionaries/pages/compare.en.json").then((m) => m.default),
  ),
  "release-notes": page(
    () => import("../dictionaries/pages/release-notes.vi.json").then((m) => m.default),
    () => import("../dictionaries/pages/release-notes.en.json").then((m) => m.default),
  ),
  features: page(
    () => import("../dictionaries/pages/features.vi.json").then((m) => m.default),
    () => import("../dictionaries/pages/features.en.json").then((m) => m.default),
  ),
  download: page(
    () => import("../dictionaries/pages/download.vi.json").then((m) => m.default),
    () => import("../dictionaries/pages/download.en.json").then((m) => m.default),
  ),
};

export type PageCopyId = keyof typeof loaders;

export type PageCopy<P extends PageCopyId> = Awaited<ReturnType<(typeof loaders)[P]["vi"]>>;

// The same map, typed per key so indexing it with a generic id keeps the
// link between the id and its copy type.
const pageCopies: { [P in PageCopyId]: Record<Locale, Loader<PageCopy<P>>> } = loaders;

export function getPageCopy<P extends PageCopyId>(
  locale: Locale,
  id: P,
): Promise<PageCopy<P>> {
  return pageCopies[id][locale]();
}
