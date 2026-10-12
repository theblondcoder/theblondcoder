import { test } from "node:test";
import assert from "node:assert/strict";
import { publicRepos, publicSignals, snapshot, replaceSnapshot } from "./public-data.mjs";
import { activity, heatmap, escapeXml, project, wrapText } from "./visuals.mjs";
import { parseCalendar, calendarStats } from "./contributions.mjs";
import { readFile, access } from "node:fs/promises";

const repo = (name, extra = {}) => ({ name, private: false, fork: false, owner: { login: "theblondcoder" }, pushed_at: "2026-10-10T10:00:00Z", ...extra });
const event = (name, extra = {}) => ({ public: true, type: "PushEvent", repo: { name: `theblondcoder/${name}` }, created_at: "2026-10-10T10:00:00Z", ...extra });
const calendar = calendarStats([{ date: "2026-10-09", count: 2 }, { date: "2026-10-10", count: 3 }, { date: "2026-10-11", count: 0 }]);

test("only explicitly public, owned and valid project repos are eligible", () => {
  const result = publicRepos([repo("StarStats"), repo("training-diary-app-public"), repo("SYNTHETIC_PRIVATE", { private: true }), repo("UNKNOWN", { private: undefined }), repo("theblondcoder"), repo("fork", { fork: true }), repo("foreign", { owner: { login: "other" } }), repo("<script>"), repo("no-date", { pushed_at: null })]);
  assert.deepEqual(result.map((r) => r.name), ["StarStats", "training-diary-app-public"]);
});

test("private, unknown and profile-maintenance events never enter output", () => {
  const repos = publicRepos([repo("StarStats")]);
  const events = [event("SYNTHETIC_PRIVATE", { public: false }), event("UNKNOWN"), event("theblondcoder"), event("StarStats"), event("StarStats"), event("StarStats", { type: "DeleteEvent" })];
  const signals = publicSignals(events, repos);
  assert.equal(signals.length, 1);
  const output = snapshot(events, repos, calendar) + activity("dark", calendar);
  assert.doesNotMatch(output, /SYNTHETIC_PRIVATE|UNKNOWN/);
  assert.match(output, /StarStats/);
});

test("empty activity is handled honestly", () => {
  assert.match(snapshot([], []), /No recent public events/);
  const zero = calendarStats([{ date: "2026-10-10", count: 0 }]);
  assert.match(activity("light", zero, true), /0 contributions/);
});

test("refresh is deterministic and stays inside one marker pair", () => {
  const source = "before\n<!-- PUBLIC-ACTIVITY:START -->old<!-- PUBLIC-ACTIVITY:END -->\nafter";
  const once = replaceSnapshot(source, "new");
  assert.equal(replaceSnapshot(once, "new"), once);
  assert.ok(once.startsWith("before\n"));
  assert.ok(once.endsWith("\nafter"));
  assert.throws(() => replaceSnapshot("no markers", "new"));
  assert.throws(() => replaceSnapshot(source + source, "new"));
});

test("all SVG data is escaped", () => {
  assert.equal(escapeXml('<tag a="x">&'), "&lt;tag a=&quot;x&quot;&gt;&amp;");
  assert.doesNotMatch(activity("dark", calendar), /<script>/);
});

test("invalid repo names and inherited event types are rejected", () => {
  assert.deepEqual(publicRepos([repo(undefined), repo("x".repeat(101))]), []);
  assert.deepEqual(publicSignals([event("StarStats", { type: "toString" })], [repo("StarStats")]), []);
});

test("all README graphics exist locally in all theme and mobile variants", async () => {
  const source = await readFile(new URL("../README.md", import.meta.url), "utf8");
  const files = [...new Set([...source.matchAll(/(?:src|srcset)="(\.\/assets\/[^\"]+)"/g)].map((m) => m[1]))];
  assert.equal(files.length, 36);
  for (const file of files) {
    const url = new URL(`../${file}`, import.meta.url);
    await access(url);
    const svg = await readFile(url, "utf8");
    assert.match(svg, /<title /);
    assert.match(svg, /viewBox=/);
    assert.doesNotMatch(svg, /<script|<foreignObject|(?:href|src)="https?:/i);
    assert.match(svg, /prefers-reduced-motion/);
  }
});

test("long public repo names remain available as native text links", () => {
  const name = "a".repeat(80);
  assert.match(snapshot([event(name)], [repo(name)]), new RegExp(name));
});

test("calendar totals, weekly bins and streaks match real counts", () => {
  assert.equal(calendar.total, 5);
  assert.equal(calendar.activeDays, 2);
  assert.equal(calendar.currentStreak, 2);
  assert.equal(calendar.longestStreak, 2);
  assert.equal(calendar.weeks.reduce((sum, w) => sum + w.count, 0), 5);
  assert.equal(calendarStats([{ date: "2026-10-09", count: 0 }, { date: "2026-10-10", count: 0 }]).currentStreak, 0);
  assert.match(heatmap("dark", calendar), /2026-10-09: 2 contributions/);
});

const cell = (date, id, count) => `<table><tr><td data-date="${date}" id="${id}"></td></tr></table><tool-tip for="${id}">${count} contributions on a day.</tool-tip>`;

test("public HTML parser joins cells to accessible count labels", () => {
  const result = parseCalendar(cell("2026-10-09", "a", "1,002") + cell("2026-10-10", "b", "No"), 2);
  assert.equal(result.total, 1002);
  assert.equal(result.activeDays, 1);
  assert.equal(result.days.length, 2);
  assert.throws(() => parseCalendar(cell("2026-10-09", "a", "No")));
  assert.throws(() => parseCalendar(cell("2026-10-09", "a", "2") + cell("2026-10-11", "b", "3"), 2));
  assert.throws(() => parseCalendar(cell("2026-02-31", "a", "1"), 1));
  assert.throws(() => parseCalendar('<td data-date="2026-10-09" id="missing-label"></td>', 1));
});

test("project stories use bounded lines and truthful development status", () => {
  assert.deepEqual(wrapText("one two three", 7), ["one two", "three"]);
  assert.throws(() => wrapText("unbrokenword", 5));
  for (const key of ["starstats", "fire", "diary", "lab"]) {
    for (const mobile of [true, false]) {
      const output = project("dark", key, mobile);
      assert.match(output, /THE CHALLENGE/);
      assert.match(output, /THE BUILD/);
      assert.match(output, /THE OUTCOME/);
    }
  }
  assert.match(project("light", "diary"), /Still in development/);
});
