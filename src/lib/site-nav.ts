// Navigation structure shared by the header and the footer. Labels live in the
// dictionaries under the same keys.

export const featureKeys = [
  "apps",
  "docker",
  "safeConfig",
  "terminal",
  "recipes",
  "alerts",
  "sshSecurity",
  "tunnels",
  "ai",
  "teams",
] as const;
export type FeatureKey = (typeof featureKeys)[number];

export const featureHref: Record<FeatureKey, string> = {
  apps: "/features/apps",
  docker: "/features/docker",
  safeConfig: "/features/safe-config",
  terminal: "/features/terminal",
  recipes: "/features/recipes",
  alerts: "/features/alerts",
  sshSecurity: "/features/ssh-security",
  tunnels: "/features/tunnels",
  ai: "/features/ai",
  teams: "/features/teams",
};

export const solutionKeys = ["agency", "indie", "startupOps"] as const;
export type SolutionKey = (typeof solutionKeys)[number];

export const solutionHref: Record<SolutionKey, string> = {
  agency: "/solutions/agency",
  indie: "/solutions/indie-developer",
  startupOps: "/solutions/startup-ops",
};

export const topLinkHref = {
  compare: "/compare",
  insights: "/insights",
  releaseNotes: "/release-notes",
  pricing: "/pricing",
} as const;

// Plain links of the header after the Features and Solutions menus, in order.
// Insights stays out of the header until it has posts (it is in the footer).
export const headerLinkIds = ["compare", "pricing", "releaseNotes"] as const;

// Builds are published as GitHub releases of this repository; the download
// link always opens the newest one.
export const releasesRepo = "Capstio/Capstio_Release";
export const releasesPage = `https://github.com/${releasesRepo}/releases`;
export const downloadHref = `${releasesPage}/latest`;

export const allFeaturesHref = "/features";

export const securityHref = "/security";

export const faqHref = "/faq";

// The getting-started guide. Download buttons still go straight to the newest
// release (downloadHref); this page explains installing and connecting.
export const downloadGuideHref = "/download";

export const technologyKeys = ["dockerManager", "pm2Gui", "systemdGui", "sshClient"] as const;
export type TechnologyKey = (typeof technologyKeys)[number];

export const technologyHref: Record<TechnologyKey, string> = {
  dockerManager: "/technology/docker-manager",
  pm2Gui: "/technology/pm2-gui",
  systemdGui: "/technology/systemd-gui",
  sshClient: "/technology/ssh-client-for-mac",
};

// The path segment after the parent of a nested page, for example "agency"
// from "/solutions/agency".
export function lastSegment(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}

// Real pages the command palette lists under "Pages", in order. Labels come
// from `palette.pages.<id>` in the dictionaries.
export const palettePages = [
  { id: "features", href: allFeaturesHref },
  { id: "pricing", href: topLinkHref.pricing },
  { id: "compare", href: topLinkHref.compare },
  { id: "security", href: securityHref },
  { id: "faq", href: faqHref },
  { id: "releaseNotes", href: topLinkHref.releaseNotes },
  { id: "download", href: downloadGuideHref },
] as const;

// Footer columns. Column titles come from `footer.columns.<id>` and link labels
// from `footer.links.<id>` in the dictionaries.
export type FooterColumn = {
  id: "features" | "technology" | "solutions" | "resources" | "company";
  links: { id: string; href: string }[];
};

export const footerColumns: FooterColumn[] = [
  {
    id: "features",
    links: [
      { id: "allFeatures", href: allFeaturesHref },
      ...featureKeys.map((key) => ({ id: key, href: featureHref[key] })),
    ],
  },
  {
    id: "technology",
    links: technologyKeys.map((key) => ({ id: key, href: technologyHref[key] })),
  },
  {
    id: "solutions",
    links: solutionKeys.map((key) => ({ id: key, href: solutionHref[key] })),
  },
  {
    id: "resources",
    links: [
      { id: "download", href: downloadGuideHref },
      { id: "pricing", href: topLinkHref.pricing },
      { id: "releaseNotes", href: topLinkHref.releaseNotes },
      { id: "compare", href: topLinkHref.compare },
      { id: "faq", href: faqHref },
      { id: "insights", href: topLinkHref.insights },
    ],
  },
  {
    id: "company",
    links: [
      { id: "about", href: "/about" },
      { id: "brand", href: "/brand" },
      { id: "security", href: securityHref },
      { id: "privacy", href: "/privacy" },
      { id: "terms", href: "/terms" },
    ],
  },
];
