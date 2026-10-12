import { readFile, writeFile } from "node:fs/promises";
import { activity, heatmap } from "./visuals.mjs";
import { publicRepos, snapshot, replaceSnapshot } from "./public-data.mjs";
import { fetchCalendar } from "./contributions.mjs";

async function publicApi(endpoint) {
  // No Authorization header: this reader has no access to private repositories.
  const response = await fetch(`https://api.github.com/${endpoint}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "theblondcoder-profile-updater",
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`GitHub public API returned ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("Unexpected public API response");
  return data;
}

const allRepos = [];
for (let page = 1; ; page++) {
  const batch = await publicApi(`users/theblondcoder/repos?type=owner&per_page=100&page=${page}`);
  allRepos.push(...batch);
  if (batch.length < 100) break;
  if (page === 20) throw new Error("Public repository pagination limit reached");
}
const repos = publicRepos(allRepos);
const events = await publicApi("users/theblondcoder/events/public?per_page=100");
const calendar = await fetchCalendar();
const path = new URL("../README.md", import.meta.url);
const source = await readFile(path, "utf8");
const result = replaceSnapshot(source, snapshot(events, repos, calendar));
for (const theme of ["dark", "light"]) {
  for (const mobile of [false, true]) {
    const suffix = `${mobile ? "mobile-" : ""}${theme}.svg`;
    await writeFile(new URL(`../assets/activity-${suffix}`, import.meta.url), activity(theme, calendar, mobile));
    await writeFile(new URL(`../assets/activity-grid-${suffix}`, import.meta.url), heatmap(theme, calendar, mobile));
  }
}
await writeFile(path, result);
