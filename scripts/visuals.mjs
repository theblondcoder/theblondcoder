export const themes = {
  dark: { bg: "#101410", panel: "#171d18", fg: "#eff7ee", muted: "#a3b3a6", line: "#354438", lime: "#c6f879", pink: "#ff80ab", cyan: "#7cdee3" },
  light: { bg: "#f8fbf7", panel: "#edf3eb", fg: "#17241c", muted: "#526657", line: "#c1d0c0", lime: "#416718", pink: "#b52b5e", cyan: "#126773" },
};

export const escapeXml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
export const text = (x, y, value, size = 18, fill = "fg", extra = "") => `<text x="${x}" y="${y}" font-size="${size}" class="${fill}" ${extra}>${escapeXml(value)}</text>`;
export const rect = (x, y, w, h, cls = "panel", extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" class="${cls}" ${extra}/>`;
export const line = (d, cls = "wire", extra = "") => `<path d="${d}" class="${cls}" ${extra}/>`;

export function svg(theme, w, h, title, content) {
  const t = themes[theme];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(title)}. Original engineering-console artwork for theblondcoder.</desc>
  <style>
    text{font-family:Consolas,"Liberation Mono",monospace;letter-spacing:0}
    .fg{fill:${t.fg}}.muted{fill:${t.muted}}.lime{fill:${t.lime}}.pink{fill:${t.pink}}.cyan{fill:${t.cyan}}
    .panel{fill:${t.panel};stroke:${t.line}}.wire{fill:none;stroke:${t.line};stroke-width:2}
    .signal{fill:none;stroke:${t.lime};stroke-width:2;stroke-dasharray:5 12;animation:flow 5s linear infinite}
    .cursor{animation:blink 1.6s steps(2,end) infinite}.pulse{animation:pulse 3s ease-in-out infinite}
    .bar{transform-box:fill-box;transform-origin:center bottom;animation:grow 1s ease-out both}
    @keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
    @keyframes flow{to{stroke-dashoffset:-68}}@keyframes blink{50%{opacity:0}}@keyframes pulse{50%{opacity:.4}}
    @media(prefers-reduced-motion:reduce){.signal,.cursor,.pulse,.bar,.scan{animation:none}}
  </style>
  <rect width="${w}" height="${h}" rx="4" fill="${t.bg}"/>
  ${content}
</svg>\n`;
}

function chip(x, y, size = 150) {
  let pins = "";
  for (let i = 1; i <= 5; i++) {
    const k = (size / 6) * i;
    pins += line(`M${x + k} ${y - 13}v13 M${x + k} ${y + size}v13 M${x - 13} ${y + k}h13 M${x + size} ${y + k}h13`);
  }
  return `${pins}${rect(x, y, size, size)}${rect(x + 12, y + 12, size - 24, size - 24, "panel")}
    ${text(x + size / 2, y + size / 2 + 14, "BC", 54, "lime", 'text-anchor="middle" font-weight="700"')}
    ${text(x + size / 2, y + size - 26, "BUILD / LEARN", 11, "muted", 'text-anchor="middle"')}`;
}

export function header(theme, mobile = false) {
  const w = mobile ? 480 : 960;
  const h = mobile ? 460 : 368;
  let body = rect(1, 1, w - 2, h - 2, "wire");
  body += text(24, 30, "BC / PERSONAL WORKSTATION", mobile ? 14 : 15, "muted");
  body += text(w - 24, 30, "PROFILE.SYS", 13, "lime", 'text-anchor="end"');
  body += line(`M24 48H${w - 24}`);
  body += text(28, 84, "~/blondcoder $ whoami", mobile ? 17 : 18, "lime");
  if (mobile) {
    body += text(28, 137, "IVÁN", 46, "fg", 'font-weight="700"');
    body += text(28, 187, "BALTANÁS", 46, "fg", 'font-weight="700"');
    body += text(28, 224, "Web developer & ICT student", 18);
    body += text(28, 270, "> build useful things", 17, "muted");
    body += text(28, 298, "> understand the internals", 17, "muted");
    body += `<rect x="308" y="285" width="10" height="17" class="lime cursor"/>`;
    body += line("M28 330H452");
    body += text(28, 362, "01  WEB DEVELOPMENT", 17, "lime");
    body += text(28, 396, "02  APPS & AUTOMATION", 17, "pink");
    body += text(28, 430, "03  SYSTEMS & SECURITY", 17, "cyan");
    body += chip(351, 91, 92).replace('font-size="54"', 'font-size="34"').replace('font-size="11"', 'font-size="7"');
  } else {
    body += text(28, 146, "IVÁN BALTANÁS", 48, "fg", 'font-weight="700"');
    body += text(30, 183, "Web developer & ICT student", 21);
    body += text(30, 229, "> build useful things", 18, "muted");
    body += text(30, 258, "> understand the internals", 18, "muted");
    body += `<rect x="330" y="242" width="11" height="19" class="lime cursor"/>`;
    body += chip(687, 94, 142);
    body += line("M674 118H605V89H561 M842 118H891V84 M674 210H622V262H578 M842 210H895V262H918");
    body += line("M674 118H605V89H561 M842 210H895V262H918", "signal");
    body += text(569, 80, "WEB", 13, "lime");
    body += text(850, 76, "APPS", 13, "pink");
    body += text(595, 284, "SYSTEMS", 13, "cyan");
    body += text(853, 284, "SECURITY", 13, "muted");
    body += line("M24 307H936");
    body += text(30, 341, "01 / WEB DEVELOPMENT", 16, "lime");
    body += text(343, 341, "02 / APPS & AUTOMATION", 16, "pink");
    body += text(664, 341, "03 / SYSTEMS & SECURITY", 16, "cyan");
  }
  return svg(theme, w, h, "Iván Baltanás | Web developer, apps, systems and cybersecurity", body);
}

export function toolchain(theme, icons, mobile = false) {
  const w = mobile ? 480 : 960;
  const rowH = mobile ? 230 : 142;
  const groups = [
    { name: "01 / INTERFACE", hint: "React · TypeScript · JavaScript · Tailwind · PHP", ids: ["react", "typescript", "javascript", "tailwindcss", "php"], accent: "lime" },
    { name: "02 / APIs + DATA", hint: "Node.js · Express · PostgreSQL · MySQL · Prisma", ids: ["nodedotjs", "express", "postgresql", "mysql", "prisma"], accent: "cyan" },
    { name: "03 / APPS + CODE", hint: "Kotlin · Android · Python · .NET · C++", ids: ["kotlin", "android", "python", "dotnet", "cplusplus"], accent: "pink" },
    { name: "04 / SYSTEMS", hint: "Linux · Docker · Git · Wireshark · Arduino", ids: ["linux", "docker", "git", "wireshark", "arduino"], accent: "lime" },
  ];
  let body = "";
  groups.forEach((g, i) => {
    const y = i * rowH;
    body += line(`M0 ${y + rowH - 1}H${w}`);
    body += text(20, y + 28, g.name, 16, g.accent);
    const iconY = y + 57;
    const startX = 260;
    const gap = 139;
    g.ids.forEach((id, j) => {
      const icon = icons[id];
      if (!icon) throw new Error(`Missing brand icon: ${id}`);
      const x = mobile ? (j < 3 ? 35 + j * 150 : 110 + (j - 3) * 150) : startX + j * gap;
      const iy = mobile ? y + (j < 3 ? 52 : 142) : iconY;
      body += `<g transform="translate(${x},${iy}) scale(1.5)"><path d="${icon.path}" class="${g.accent}"/></g>`;
    });
    if (mobile) {
      const names = g.hint.split(" · ");
      names.forEach((name, j) => {
        const x = j < 3 ? 53 + j * 150 : 128 + (j - 3) * 150;
        body += text(x, y + (j < 3 ? 110 : 200), name, 17, "fg", 'text-anchor="middle"');
      });
    } else {
      body += text(260, y + 118, g.hint, 16, "muted");
      body += text(20, y + 76, ["Browser-facing", "Server-side", "Beyond the web", "Under the hood"][i], 14, "muted");
    }
  });
  return svg(theme, w, rowH * 4, "Toolchain modules: interface, APIs and data, apps and code, systems", body);
}

const projectSpecs = {
  starstats: { index: "01", title: "STARSTATS", tag: "FULL-STACK / TENNIS DATA", color: "lime", nodes: ["Athlete", "Retired?", "Database", "Wikipedia"] },
  fire: { index: "02", title: "SMART FIRE DETECTION", tag: "EMBEDDED / MONITORING", color: "pink", nodes: ["Sensors", "ESP32", "Dashboard", "Alerts"] },
  diary: { index: "03", title: "TRAINING DIARY", tag: "ANDROID / IN DEVELOPMENT", color: "cyan", nodes: ["Workout", "Kotlin", "Room", "History"] },
  lab: { index: "04", title: "HOME LAB", tag: "PERSONAL INFRASTRUCTURE", color: "lime", nodes: ["Linux", "Docker", "Services", "Scripts"] },
};

export const projectStories = {
  starstats: [
    ["THE CHALLENGE", "Make tennis player information easier to search, explore and compare."],
    ["THE BUILD", "React interface, Express/TypeScript API, PHP scraping and MySQL/MariaDB. Retired athletes use the database; active athletes use Wikipedia scraping."],
    ["THE OUTCOME", "Player search, athlete cards and competition-based comparisons, with the data source adapted to each athlete's status."],
  ],
  fire: [
    ["THE CHALLENGE", "Bring sensor readings and potential fire alerts into one monitoring interface."],
    ["THE BUILD", "An ESP32 sensing prototype paired with a Node.js/Express web dashboard for monitoring and alerts."],
    ["THE OUTCOME", "Embedded sensing meets web monitoring in a working learning prototype, not a certified safety system. Access details stay private."],
  ],
  diary: [
    ["THE CHALLENGE", "Keep a consistent record of workouts and progress without a complicated fitness platform."],
    ["THE BUILD", "A native Android app in Kotlin, with Room for locally stored workout records."],
    ["THE OUTCOME SO FAR", "A focused workout-tracking foundation. Still in development: cloud data, caching, notifications and further improvements are in progress or planned."],
  ],
  lab: [
    ["THE CHALLENGE", "Learn Linux, storage, networking and containers by running a real personal system."],
    ["THE BUILD", "A Raspberry Pi NAS with OpenMediaVault, redundant storage, Docker services and personal automation scripts."],
    ["THE OUTCOME", "A running, modular home lab for private storage, media, DNS filtering and home automation. Network and access configuration stay private."],
  ],
};

export function wrapText(value, maxCharacters) {
  const lines = [];
  for (const word of value.split(/\s+/)) {
    if (word.length > maxCharacters) throw new Error("Story word exceeds line width");
    const previous = lines.at(-1);
    if (previous && previous.length + word.length + 1 <= maxCharacters) lines[lines.length - 1] += ` ${word}`;
    else lines.push(word);
  }
  return lines;
}

// Target, Blocks and CircleCheck from Lucide (ISC); see assets/LUCIDE-LICENSE.
const storyIcons = [
  '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  '<path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"/><rect x="14" y="2" width="8" height="8" rx="1"/>',
  '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
];

function storyRows(theme, key, mobile, startY) {
  const w = mobile ? 480 : 960;
  let y = startY;
  let body = "";
  projectStories[key].forEach(([label, paragraph], i) => {
    const color = ["pink", "cyan", "lime"][i];
    const lines = wrapText(paragraph, mobile ? 36 : 59);
    const rowHeight = mobile ? 91 + lines.length * 29 : Math.max(126, 48 + lines.length * 29);
    body += line(`M20 ${y}H${w - 20}`);
    body += `<rect x="20" y="${y + 25}" width="3" height="${rowHeight - 50}" class="${color}"/>`;
    body += `<g transform="translate(38,${y + 29})" fill="none" stroke="${themes[theme][color]}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${storyIcons[i]}</g>`;
    body += text(78, y + 47, label, mobile ? 15 : 16, color, 'font-weight="700"');
    if (!mobile) body += text(39, y + 83, `0${i + 1} / ${["PROBLEM", "IMPLEMENTATION", "RESULT"][i]}`, 12, "muted");
    lines.forEach((value, j) => {
      body += text(mobile ? 38 : 290, y + (mobile ? 85 : 46) + j * 29, value, 20, "fg", 'style="font-family:Segoe UI,Arial,sans-serif"');
    });
    y += rowHeight;
  });
  return { body, height: y + 12 };
}

export function project(theme, key, mobile = false) {
  const p = projectSpecs[key];
  const w = mobile ? 480 : 960;
  const diagramHeight = mobile ? 224 : 180;
  let body = text(20, 29, `BUILD ${p.index} / ${p.tag}`, mobile ? 13 : 14, p.color);
  body += text(20, mobile ? 67 : 73, p.title, mobile ? 25 : 32, "fg", 'font-weight="700"');
  const xs = mobile ? [20, 137, 254, 371] : [20, 260, 500, 740];
  const boxW = mobile ? 89 : 200;
  const by = mobile ? 115 : 105;
  xs.forEach((x, i) => {
    body += rect(x, by, boxW, 38);
    body += text(x + boxW / 2, by + 25, p.nodes[i], mobile ? 13 : 17, i > 1 && key === "starstats" ? p.color : "fg", 'text-anchor="middle"');
  });
  if (key === "starstats") {
    body += line(`M${xs[0] + boxW} ${by + 19}H${xs[1]} M${xs[1] + boxW} ${by + 19}h12v-26H${xs[2] + boxW / 2}v7 M${xs[1] + boxW} ${by + 19}h12v52H${xs[3] + boxW / 2}v-33`);
    body += text(mobile ? 258 : 550, by - 12, "YES", 11, "lime");
    body += text(mobile ? 332 : 685, by + 65, "NO / SCRAPING", 11, "cyan");
    body += line(`M${xs[0] + boxW} ${by + 19}H${xs[1]}`, "signal");
  } else {
    for (let i = 0; i < 3; i++) {
      body += line(`M${xs[i] + boxW} ${by + 19}H${xs[i + 1]}`, i === 1 ? "signal" : "wire");
    }
  }
  const story = storyRows(theme, key, mobile, diagramHeight + 8);
  return svg(theme, w, story.height, `${p.title}: ${p.tag}. ${projectStories[key].map(([label, paragraph]) => `${label}: ${paragraph}`).join(" ")}`, body + story.body);
}

export function activity(theme, calendar, mobile = false) {
  const w = mobile ? 480 : 960;
  const h = mobile ? 490 : 350;
  let body = text(24, 40, "GitHub activity", mobile ? 25 : 29, "fg", 'font-weight="700" style="font-family:Segoe UI,Arial,sans-serif"');
  body += text(mobile ? 24 : w - 24, mobile ? 68 : 40, `LAST 12 MONTHS / ${calendar.asOf}`, mobile ? 13 : 14, "muted", mobile ? "" : 'text-anchor="end"');
  const stats = [[calendar.total, "Contributions", "lime"], [calendar.activeDays, "Active days", "cyan"], [calendar.currentStreak, "Current streak", "pink"], [calendar.longestStreak, "Longest streak", "lime"]];
  stats.forEach(([value, label, color], i) => {
    const x = mobile ? 24 + (i % 2) * 230 : 24 + i * 236;
    const y = mobile ? 122 + Math.floor(i / 2) * 87 : 108;
    body += text(x, y, value, mobile ? 37 : 42, color, 'font-weight="700"');
    body += text(x, y + 26, label, mobile ? 17 : 18, "muted", 'style="font-family:Segoe UI,Arial,sans-serif"');
  });
  const chartTop = mobile ? 297 : 202;
  const baseline = mobile ? 438 : 301;
  body += text(24, chartTop - 18, "WEEKLY CONTRIBUTIONS", mobile ? 13 : 14, "muted");
  const max = Math.max(1, ...calendar.weeks.map((week) => week.count));
  const step = (w - 48) / calendar.weeks.length;
  let lastMonth = "";
  let lastLabelX = -Infinity;
  calendar.weeks.forEach((week, i) => {
    const height = Math.max(3, week.count / max * (baseline - chartTop));
    const x = 24 + i * step;
    body += `<rect class="bar" style="animation-delay:${i * 12}ms" x="${x.toFixed(2)}" y="${(baseline - height).toFixed(2)}" width="${Math.max(2, step - (mobile ? 2 : 4)).toFixed(2)}" height="${height.toFixed(2)}" rx="2" fill="${week.count ? themes[theme][i % 4 === 0 ? "cyan" : "lime"] : themes[theme].line}"><title>Week of ${escapeXml(week.date)}: ${week.count} contributions</title></rect>`;
    const month = week.date.slice(0, 7);
    if (month !== lastMonth && x - lastLabelX >= (mobile ? 50 : 45) && i < calendar.weeks.length - 3) {
      body += text(x, baseline + 23, new Date(week.date).toLocaleDateString("en", { month: "short", timeZone: "UTC" }), mobile ? 11 : 12, "muted");
      lastLabelX = x;
    }
    lastMonth = month;
  });
  return svg(theme, w, h, `GitHub activity: ${calendar.total} contributions, ${calendar.activeDays} active days, current streak ${calendar.currentStreak} days, longest streak ${calendar.longestStreak} days. Counts visible on the public profile.`, body);
}

export function heatmap(theme, calendar, mobile = false) {
  const w = mobile ? 480 : 960;
  const size = mobile ? 6 : 12;
  const step = mobile ? 8 : 16;
  const x0 = (w - calendar.weeks.length * step) / 2;
  const y0 = 58;
  let body = text(24, 29, "A YEAR, ONE DAY AT A TIME", mobile ? 13 : 15, "muted");
  const firstWeek = Date.parse(calendar.weeks[0].date);
  const max = Math.max(1, ...calendar.days.map((d) => d.count));
  calendar.days.forEach((day) => {
    const column = Math.floor((Date.parse(day.date) - firstWeek) / (7 * 86400000));
    const row = new Date(day.date).getUTCDay();
    const opacity = day.count ? 0.3 + 0.7 * Math.sqrt(day.count / max) : 1;
    body += `<rect x="${x0 + column * step}" y="${y0 + row * step}" width="${size}" height="${size}" rx="2" fill="${themes[theme][day.count ? "lime" : "line"]}" opacity="${opacity.toFixed(2)}"><title>${day.date}: ${day.count} contributions</title></rect>`;
  });
  const span = (calendar.weeks.length - 1) * step;
  body += `<style>.scan{animation:sweep 14s steps(${calendar.weeks.length},end) infinite}@keyframes sweep{to{transform:translateX(${span}px)}}</style>`;
  body += `<rect class="scan" x="${x0 - 2}" y="${y0 - 4}" width="${size + 4}" height="${step * 6 + size + 8}" rx="3" fill="none" stroke="${themes[theme].cyan}" stroke-width="1.5" opacity=".8"/>`;
  body += text(24, mobile ? 146 : 194, "PUBLICLY VISIBLE COUNTS / NO PRIVATE REPO DETAILS", mobile ? 11 : 12, "muted");
  return svg(theme, w, mobile ? 166 : 214, "Daily contribution calendar from the public GitHub profile, with an animated scan line. No private repository details.", body);
}

export function contact(theme, mobile = false) {
  const w = mobile ? 480 : 960;
  let body = line(`M20 1H${w - 20}`);
  body += text(20, 36, "NEXT CONNECTION", 14, "pink");
  body += text(20, 76, "Let's build something useful.", mobile ? 23 : 32, "fg", 'font-weight="700"');
  body += text(20, 113, "LinkedIn / Iván Baltanás", 18, "cyan");
  body += text(w - 24, 114, "↗", 26, "lime");
  return svg(theme, w, 138, "Connect with Iván Baltanás on LinkedIn", body);
}
