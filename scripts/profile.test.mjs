import { test } from "node:test";
import assert from "node:assert/strict";
import { publicRepos, publicSignals, snapshot, replaceSnapshot } from "./public-data.mjs";
import { activity, heatmap, escapeXml, project, wrapText, toolchain, repositoryButton, contactButton } from "./visuals.mjs";
import { parseCalendar, calendarStats } from "./contributions.mjs";
import { readFile, access } from "node:fs/promises";
import { parseFragment } from "parse5";

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
  assert.equal(files.length, 48);
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

function elements(node) {
  return [node, ...(node.childNodes || []).flatMap(elements)];
}
const attributes = (node) => Object.fromEntries((node.attrs || []).map(({ name, value }) => [name, value]));

test("each technology label shares its icon centre in both layouts and themes", async () => {
  const icons = JSON.parse(await readFile(new URL("../assets/brand-icons.json", import.meta.url), "utf8"));
  for (const theme of ["dark", "light"]) {
    for (const mobile of [false, true]) {
      const nodes = elements(parseFragment(toolchain(theme, icons, mobile))).map(attributes);
      const marks = nodes.filter((a) => a["data-tech"]);
      assert.equal(marks.length, 25);
      for (const id of ["bash", "powershell", "kubernetes", "vagrant", "ciscoconsole"]) {
        assert.ok(marks.some((mark) => mark["data-tech"] === id), id);
      }
      for (const mark of marks) {
        const label = nodes.find((a) => a["data-label-for"] === mark["data-tech"]);
        const position = /translate\((\d+),(\d+)\)/.exec(mark.transform);
        assert.ok(label, mark["data-tech"]);
        assert.equal(Number(label.x), Number(position[1]) + 18);
        assert.equal(Number(label.y), Number(position[2]) + (mobile ? 58 : 61));
        assert.equal(label["text-anchor"], "middle");
      }
    }
  }
});

test("highlighted repository links retain the correct destinations and accessible names", async () => {
  const source = await readFile(new URL("../README.md", import.meta.url), "utf8");
  const links = elements(parseFragment(source)).filter((n) => n.tagName === "a" && attributes(n).title && attributes(n).href.startsWith("https://github.com/"));
  assert.deepEqual(links.map((n) => attributes(n).href), [
    "https://github.com/theblondcoder/StarStats",
    "https://github.com/theblondcoder/alarm-smart-tech-public",
    "https://github.com/theblondcoder/training-diary-app-public",
  ]);
  for (const link of links) {
    assert.ok(elements(link).some((n) => n.tagName === "img" && attributes(n).alt));
  }
  for (const key of ["starstats", "fire", "diary"]) {
    for (const theme of ["dark", "light"]) {
      assert.match(repositoryButton(theme, key), /viewBox="0 0 360 76"/);
      assert.match(repositoryButton(theme, key), /SOURCE CODE/);
    }
  }
});

test("calendar replay highlights only the latest real active days in chronological order", () => {
  const days = Array.from({ length: 16 }, (_, i) => ({ date: `2026-10-${String(i + 1).padStart(2, "0")}`, count: i === 7 ? 0 : i + 1 }));
  const history = calendarStats(days);
  const expected = days.filter((d) => d.count > 0).slice(-12);
  for (const theme of ["dark", "light"]) {
    for (const mobile of [false, true]) {
      const output = heatmap(theme, history, mobile);
      const frames = elements(parseFragment(output)).map(attributes).filter((a) => a["data-replay-date"]);
      assert.deepEqual(frames.map((a) => ({ date: a["data-replay-date"], count: Number(a["data-replay-count"]) })), expected);
      assert.deepEqual(frames.map((a) => Number(a["data-run-total"])), expected.map((_, i) => expected.slice(0, i + 1).reduce((sum, day) => sum + day.count, 0)));
      const route = elements(parseFragment(output)).map(attributes).find((a) => a["data-arcade-route"]);
      assert.equal(route["data-arcade-route"].split(" ").length, expected.length);
      const width = mobile ? 480 : 960;
      const step = mobile ? 8 : 16;
      const size = mobile ? 6 : 12;
      const x0 = (width - history.weeks.length * step) / 2;
      assert.deepEqual(route["data-arcade-route"].split(" ").map((p) => p.split(",").map(Number)), expected.map((day) => [
        x0 + Math.floor((Date.parse(day.date) - Date.parse(history.weeks[0].date)) / (7 * 86400000)) * step + size / 2,
        80 + new Date(day.date).getUTCDay() * step + size / 2,
      ]));
      assert.match(output, /@keyframes packet-run/);
      assert.doesNotMatch(output, /\.arcade-runner\{display:none\}/);
      assert.equal(frames.filter((a) => a.class.includes("replay-latest")).length, 1);
      assert.match(output, /prefers-reduced-motion:reduce/);
      assert.doesNotMatch(output, /\.replay-frame\{animation:none|\.replay-latest\{opacity:1!important/);
      assert.match(output, /@media\(prefers-reduced-motion:reduce\)\{\.arcade-flame,\.checkpoint\{animation:none\}\}/);
      assert.doesNotMatch(output, /@keyframes sweep|animated scan line/);
    }
  }
  const empty = heatmap("dark", calendarStats([{ date: "2026-10-01", count: 0 }]));
  assert.match(empty, /No contributions in this period/);
  assert.doesNotMatch(empty, /data-replay-date/);
  assert.doesNotMatch(empty, /data-arcade-route/);
  const single = heatmap("light", calendarStats([{ date: "2026-10-01", count: 1 }]), true);
  assert.match(single, /data-run-total="1"/);
  assert.doesNotMatch(single, /NaN|Infinity/);
});

test("contact SVG buttons link directly to the approved LinkedIn profile and email addresses", async () => {
  const source = await readFile(new URL("../README.md", import.meta.url), "utf8");
  const contacts = source.split("## 05 / Open a Channel")[1];
  const links = elements(parseFragment(contacts)).filter((node) => node.tagName === "a" && attributes(node).title?.startsWith("Contact "));
  assert.deepEqual(links.map((node) => attributes(node).href), [
    "https://www.linkedin.com/in/iv%C3%A1n-baltan%C3%A1s-ortiz-a93416276/",
    "mailto:ivabalta@gmail.com",
    "mailto:blondcoder@gmail.com",
  ]);
  const icons = JSON.parse(await readFile(new URL("../assets/brand-icons.json", import.meta.url), "utf8"));
  for (const link of links) {
    assert.ok(elements(link).some((node) => node.tagName === "img" && attributes(node).alt && attributes(node).width === "270"));
  }
  for (const theme of ["dark", "light"]) {
    for (const key of ["linkedin", "primarymail", "codermail"]) {
      const output = contactButton(theme, key, icons);
      assert.match(output, /viewBox="0 0 270 76"/);
      assert.match(output, new RegExp(`data-contact-icon="${key === "linkedin" ? "linkedin" : "gmail"}"`));
      assert.doesNotMatch(output, /<script|<foreignObject|(?:href|src)="https?:/i);
    }
  }
  assert.throws(() => contactButton("dark", "unknown", icons));
});

test("marked duplicate text is removed and the toolchain starts with the expertise note", async () => {
  const source = await readFile(new URL("../README.md", import.meta.url), "utf8");
  assert.doesNotMatch(source, /Currently on the workbench|Project building blocks|Open the extended toolkit|readable project notes/);
  const note = "These are technologies I've used or explored through study, projects and practical experience, not a claim of equal expertise in every tool.";
  assert.equal(source.split(note).length, 2);
  const stack = source.split("## 02 / Toolchain")[1].split("## 03 / Build Files")[0];
  assert.ok(stack.trimStart().startsWith(note));
  for (const label of ["Bash", "PowerShell", "Kubernetes", "Vagrant", "Cisco console"]) assert.ok(stack.includes(label));
  assert.match(source, /ACTIVELY IN DEVELOPMENT/);
  assert.match(source, /Inside the software toolbox/);
});

test("the introduction preserves the complete education chronology and current study status", async () => {
  const source = await readFile(new URL("../README.md", import.meta.url), "utf8");
  const about = source.split("## 01 / About Me")[1].split("## 02 / Toolchain")[0];
  assert.match(about, /2025 - Present.*Bachelor in Information and Communication Technologies/);
  assert.match(about, /App Development.*Thomas More University.*In progress/);
  assert.match(about, /2024 - 2025.*Specialisation Course in Cybersecurity in Information Technology Environments/);
  assert.match(about, /2022 - 2024.*Higher Technician in Web Application Development/);
  assert.match(about, /2020 - 2022.*High School Graduate/);
  assert.match(about, /Web development is my main focus/);
  assert.match(about, /desktop and Android applications/);
  assert.match(about, /IT systems, cybersecurity and networking/);
  assert.doesNotMatch(about, /My education connects these interests|full-stack internship|IT systems administration/);
  const educationEnd = about.indexOf("</details>");
  const homeLab = about.indexOf("That curiosity continues outside the classroom.");
  assert.ok(educationEnd > about.indexOf("### Education / The Route So Far"));
  assert.ok(homeLab > educationEnd && homeLab < about.indexOf("```yaml"));
  assert.doesNotMatch(about, /Experience, without the confidential bits|April - July 2024|October 2023 - March 2024/);
  assert.doesNotMatch(about, /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\+\d{2}\s*\d{6,}/);
});
