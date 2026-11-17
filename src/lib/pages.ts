import { featureHref, featureKeys } from "./site-nav";

// Every route of the site, by path without a language prefix. "page" has real
// content and goes into the sitemap; "soon" is a short coming-soon page that
// carries noindex and stays out of the sitemap until it is written. Paths are
// literal (except the feature pages, one per feature key) so a navigation
// change cannot silently drop a route from here.
export type PageKind = "page" | "soon";

export type SitePage = { path: string; kind: PageKind };

export const sitePages: readonly SitePage[] = [
  { path: "/", kind: "page" },
  { path: "/pricing", kind: "page" },
  { path: "/faq", kind: "page" },
  { path: "/security", kind: "page" },
  { path: "/compare", kind: "page" },
  { path: "/release-notes", kind: "page" },
  { path: "/features", kind: "page" },
  ...featureKeys.map((key): SitePage => ({ path: featureHref[key], kind: "page" })),
  { path: "/download", kind: "page" },

  { path: "/solutions/agency", kind: "soon" },
  { path: "/solutions/indie-developer", kind: "soon" },
  { path: "/solutions/startup-ops", kind: "soon" },
  { path: "/technology/docker-manager", kind: "soon" },
  { path: "/technology/pm2-gui", kind: "soon" },
  { path: "/technology/systemd-gui", kind: "soon" },
  { path: "/technology/ssh-client-for-mac", kind: "soon" },
  { path: "/insights", kind: "soon" },
  { path: "/about", kind: "soon" },
  { path: "/brand", kind: "soon" },
  { path: "/privacy", kind: "soon" },
  { path: "/terms", kind: "soon" },
];

// Paths of the pages search engines should index, in sitemap order.
export const indexedPaths: string[] = sitePages
  .filter((page) => page.kind === "page")
  .map((page) => page.path);
