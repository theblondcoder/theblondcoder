import { parseFragment } from "parse5";

function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes || []) walk(child, visit);
}
const attrs = (node) => Object.fromEntries((node.attrs || []).map((a) => [a.name, a.value]));
const content = (node) => (node.childNodes || []).map((n) => n.nodeName === "#text" ? n.value : content(n)).join("");

export function parseCalendar(html, minimumDays = 365) {
  const document = parseFragment(html);
  const counts = new Map();
  const cells = [];
  walk(document, (node) => {
    const a = attrs(node);
    if (node.tagName === "tool-tip" && a.for) {
      const match = content(node).trim().match(/^(No|[\d,]+) contributions?\b/);
      if (match) counts.set(a.for, match[1] === "No" ? 0 : Number(match[1].replaceAll(",", "")));
    }
    if (node.tagName === "td" && a["data-date"] && a.id) cells.push(a);
  });
  const byDate = new Map();
  for (const cell of cells) {
    const date = cell["data-date"];
    const count = counts.get(cell.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date || !Number.isSafeInteger(count) || count < 0) {
      throw new Error("Invalid public contribution calendar cell");
    }
    if (byDate.has(date) && byDate.get(date) !== count) throw new Error("Conflicting public counts");
    byDate.set(date, count);
  }
  const days = [...byDate].map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
  if (days.length < minimumDays || days.length > 370) throw new Error("Incomplete public contribution calendar");
  for (let i = 1; i < days.length; i++) {
    if (Date.parse(days[i].date) - Date.parse(days[i - 1].date) !== 86400000) throw new Error("Non-consecutive calendar dates");
  }
  return calendarStats(days);
}

export function calendarStats(days) {
  if (!days.length) throw new Error("Empty contribution calendar");
  let current = 0;
  let longestStreak = 0;
  const weeks = [];
  for (const day of days) {
    current = day.count ? current + 1 : 0;
    longestStreak = Math.max(longestStreak, current);
    const start = new Date(day.date);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());
    const week = start.toISOString().slice(0, 10);
    if (weeks.at(-1)?.date !== week) weeks.push({ date: week, count: 0 });
    weeks.at(-1).count += day.count;
  }
  let i = days.length - 1;
  if (days[i].count === 0) i--;
  let currentStreak = 0;
  while (i >= 0 && days[i--].count > 0) currentStreak++;
  return { days, weeks, total: days.reduce((sum, d) => sum + d.count, 0), activeDays: days.filter((d) => d.count > 0).length, currentStreak, longestStreak, asOf: days.at(-1).date };
}

export async function fetchCalendar() {
  // Anonymous public page only. No token, cookies, private repo names or payloads.
  const response = await fetch("https://github.com/users/theblondcoder/contributions", {
    headers: { "Accept-Language": "en", "User-Agent": "theblondcoder-profile-updater" },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Public contribution calendar returned ${response.status}`);
  return parseCalendar(await response.text());
}
