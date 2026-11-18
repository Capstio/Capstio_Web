import { cacheLife } from "next/cache";
import { releasesRepo } from "./site-nav";

export type Release = {
  name: string;
  tag: string;
  publishedAt: string;
  url: string;
};

type GitHubRelease = {
  name: string | null;
  tag_name: string;
  published_at: string | null;
  html_url: string;
  draft: boolean;
  prerelease: boolean;
};

// The newest published release, or null when there is none yet or GitHub
// cannot be reached (the page then shows the "coming soon" state instead of
// failing). Cached for an hour so the unauthenticated API limit is never hit.
export async function getLatestRelease(): Promise<Release | null> {
  "use cache";
  cacheLife("hours");

  try {
    const response = await fetch(
      `https://api.github.com/repos/${releasesRepo}/releases?per_page=5`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "capstio-web",
        },
      },
    );
    if (!response.ok) return null;
    const releases = (await response.json()) as GitHubRelease[];
    const latest = releases.find((release) => !release.draft && release.published_at);
    if (!latest?.published_at) return null;
    return {
      name: latest.name || latest.tag_name,
      tag: latest.tag_name,
      publishedAt: latest.published_at,
      url: latest.html_url,
    };
  } catch {
    return null;
  }
}
