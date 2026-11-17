export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];

// Vietnamese is the primary language of the product. Its pages live at the
// root (/, /features); the other languages under their prefix (/en, /en/features).
export const defaultLocale: Locale = "vi";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// Public path of an internal page in a language. External URLs and anchors
// are returned unchanged.
export function localizePath(lang: Locale, path: string): string {
  if (lang === defaultLocale || !path.startsWith("/")) return path;
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

// The same page without its language prefix, for example /en/features → /features.
export function stripLocale(pathname: string): string {
  const [, first = "", ...rest] = pathname.split("/");
  return hasLocale(first) ? `/${rest.join("/")}` : pathname;
}

// Opens the current page in another language (browser only). Each language
// has its own URL. A full page load, not a client navigation: the language is
// the root layout's [lang] param, so a client transition would rebuild <html>
// in React, which re-renders the theme <script> and makes React report it.
export function openInLocale(locale: Locale) {
  const { pathname, search, hash } = window.location;
  window.location.assign(localizePath(locale, stripLocale(pathname)) + search + hash);
}

// Fills "{name}" placeholders in dictionary copy, for example
// fill("Type {host} to confirm", { host: "prod-web-1" }).
export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
