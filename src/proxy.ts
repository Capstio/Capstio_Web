import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, stripLocale } from "@/lib/i18n";

// Each language has its own URLs, so search engines can index both: the
// default language at the root (/features), the others under their prefix
// (/en/features). There is no redirect by cookie, browser language or IP;
// visitors switch with the language selector.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, first = ""] = pathname.split("/");

  // /vi/... duplicates the root pages: send it to the canonical URL.
  if (first === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = stripLocale(pathname);
    return NextResponse.redirect(url, 308);
  }

  // /en/... maps straight onto the [lang] segment.
  if (hasLocale(first)) return NextResponse.next();

  // Unprefixed paths are the default language, served from /vi/... internally.
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, API routes and any path with a file extension.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
