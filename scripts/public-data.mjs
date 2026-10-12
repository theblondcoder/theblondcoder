const username = "theblondcoder";
const labels = { PushEvent: "CODE PUSHED", CreateEvent: "CREATED", ReleaseEvent: "RELEASED", PullRequestEvent: "PULL REQUEST" };

export function publicRepos(repos) {
  return repos.filter((r) => r.private === false && !r.fork &&
    r.owner?.login?.toLowerCase() === username && typeof r.name === "string" && /^[A-Za-z0-9_.-]{1,100}$/.test(r.name) &&
    r.name.toLowerCase() !== username && Number.isFinite(Date.parse(r.pushed_at)))
    .sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at) || a.name.localeCompare(b.name));
}

export function publicSignals(events, repos) {
  const allowed = new Set(repos.map((r) => `${username}/${r.name}`.toLowerCase()));
  const seen = new Set();
  return events.filter((e) => e.public === true && Object.hasOwn(labels, e.type) &&
    allowed.has(e.repo?.name?.toLowerCase()) && Number.isFinite(Date.parse(e.created_at)))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .map((e) => ({ repo: e.repo.name.split("/").at(-1), action: labels[e.type], date: new Date(e.created_at).toISOString().slice(0, 10) }))
    .filter((e) => {
      const key = `${e.repo}/${e.action}/${e.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 3);
}

const link = (name) => `https://github.com/${username}/${encodeURIComponent(name)}`;
const markdownName = (name) => name.replace(/([\\`*_\[\]])/g, "\\$1");

export function snapshot(events, repos, calendar) {
  const signals = publicSignals(events, repos);
  const lines = signals.length
    ? signals.map((e) => `- \`${e.date}\` / **${e.action}** / [${markdownName(e.repo)}](${link(e.repo)})`).join("\n")
    : "No recent public events in GitHub's current event window.";
  const rows = repos.slice(0, 6).map((r) => `| [${markdownName(r.name)}](${link(r.name)}) | ${new Date(r.pushed_at).toISOString().slice(0, 10)} |`).join("\n");
  const daysLabel = (count) => `${count} ${count === 1 ? "day" : "days"}`;
  const summary = calendar ? `<sub>${calendar.total} contributions · ${calendar.activeDays} active days · current streak: ${daysLabel(calendar.currentStreak)} · longest streak: ${daysLabel(calendar.longestStreak)}. As shown publicly through ${calendar.asOf}.</sub>\n\n` : "";
  return `\n## 04 / Activity\n\n<picture>
  <source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="./assets/activity-mobile-dark.svg">
  <source media="(max-width: 600px)" srcset="./assets/activity-mobile-light.svg">
  <source media="(prefers-color-scheme: dark)" srcset="./assets/activity-dark.svg">
  <img src="./assets/activity-light.svg" alt="GitHub contributions over the last twelve months: totals, active days, streaks and weekly bars." width="100%">
</picture>\n\n${summary}<picture>
  <source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="./assets/activity-grid-mobile-dark.svg">
  <source media="(max-width: 600px)" srcset="./assets/activity-grid-mobile-light.svg">
  <source media="(prefers-color-scheme: dark)" srcset="./assets/activity-grid-dark.svg">
  <img src="./assets/activity-grid-light.svg" alt="A year of daily contribution totals, including opted-in anonymised private activity. Animation replays the latest twelve active days with their dates and counts." width="100%">
</picture>\n\n### Recent Updates\n\n${lines}\n\n<details>\n<summary><b>Public repository index</b> / auto-discovered</summary>\n\n${rows ? `| Repository | Last push (UTC) |\n| --- | --- |\n${rows}` : "No public project repositories found."}\n\n[All public repositories](https://github.com/${username}?tab=repositories&type=public)\n\n</details>\n\n<sub>Updated every six hours. Calendar counts are read anonymously from the public GitHub profile; they may include anonymised private contributions if you enable that setting. No private repository names, code or access details are read. Recent updates use public events only. All dates use UTC.</sub>\n`;
}

export function replaceSnapshot(source, body) {
  const start = "<!-- PUBLIC-ACTIVITY:START -->";
  const end = "<!-- PUBLIC-ACTIVITY:END -->";
  const expression = new RegExp(`${start}[\\s\\S]*?${end}`);
  if ((source.match(/<!-- PUBLIC-ACTIVITY:START -->/g) || []).length !== 1 ||
      (source.match(/<!-- PUBLIC-ACTIVITY:END -->/g) || []).length !== 1 || !expression.test(source)) {
    throw new Error("Expected exactly one ordered pair of public activity markers");
  }
  return source.replace(expression, () => `${start}${body}${end}`);
}
