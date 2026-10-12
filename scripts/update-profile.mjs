import { readFile, writeFile } from "node:fs/promises";

const username = "theblondcoder";
const featuredRepos = new Set([
  "StarStats",
  "alarm-smart-tech-public",
  "training-diary-app-public",
]);
const start = "<!-- PUBLIC-ACTIVITY:START -->";
const end = "<!-- PUBLIC-ACTIVITY:END -->";

const response = await fetch(
  `https://api.github.com/users/${username}/events/public?per_page=100`,
  {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "theblondcoder-profile-updater",
    },
  },
);

if (!response.ok) {
  throw new Error(`GitHub public events API returned ${response.status}`);
}

const events = await response.json();
const event = events.find(
  (item) =>
    featuredRepos.has(item.repo?.name?.split("/").at(-1)) &&
    ["PushEvent", "CreateEvent", "ReleaseEvent"].includes(item.type),
);

const body = event
  ? `\n## Public Activity\n\nLatest public update: **${event.type.replace("Event", "")}** in [${event.repo.name}](https://github.com/${event.repo.name}) · ${new Date(event.created_at).toISOString().slice(0, 10)}.\n`
  : "\n## Public Activity\n\nNo recent public updates to the featured projects.\n";

const path = "README.md";
const source = await readFile(path, "utf8");
const expression = new RegExp(`${start}[\\s\\S]*?${end}`);

if (!expression.test(source)) {
  throw new Error("Could not find the public activity markers in README.md");
}

await writeFile(path, source.replace(expression, `${start}${body}${end}`));
