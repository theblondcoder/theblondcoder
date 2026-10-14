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

// Lucide-derived terminal, package, box and network symbols (ISC).
const toolIcons = {
  bash: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m7 8 4 4-4 4M13 16h4"/>',
  powershell: '<path d="m4 17 6-5-6-5M12 19h8"/>',
  kubernetes: '<path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16ZM3.3 7 12 12l8.7-5M12 22V12"/>',
  vagrant: '<path d="m21 8-9 5-9-5M12 22V13M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>',
  ciscoconsole: '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/>',
};

export function toolchain(theme, icons, mobile = false) {
  const w = mobile ? 480 : 960;
  const rowH = mobile ? 230 : 142;
  const groups = [
    { name: "01 / INTERFACE", names: ["React", "TypeScript", "JavaScript", "Tailwind", "PHP"], ids: ["react", "typescript", "javascript", "tailwindcss", "php"], accent: "lime" },
    { name: "02 / APIs + DATA", names: ["Node.js", "Express", "PostgreSQL", "MySQL", "Prisma"], ids: ["nodedotjs", "express", "postgresql", "mysql", "prisma"], accent: "cyan" },
    { name: "03 / APPS + CODE", names: ["Kotlin", "Android", "Python", ".NET", "C++"], ids: ["kotlin", "android", "python", "dotnet", "cplusplus"], accent: "pink" },
    { name: "04 / SYSTEMS", names: ["Linux", "Docker", "Git", "Wireshark", "Arduino"], ids: ["linux", "docker", "git", "wireshark", "arduino"], accent: "lime" },
    { name: "05 / OPS + NETWORKS", names: ["Bash", "PowerShell", "Kubernetes", "Vagrant", "Cisco console"], ids: ["bash", "powershell", "kubernetes", "vagrant", "ciscoconsole"], accent: "cyan" },
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
      if (!icon && !toolIcons[id]) throw new Error(`Missing tool icon: ${id}`);
      const x = mobile ? (j < 3 ? 35 + j * 150 : 110 + (j - 3) * 150) : startX + j * gap;
      const iy = mobile ? y + (j < 3 ? 52 : 142) : iconY;
      const mark = toolIcons[id]
        ? `<g fill="none" stroke="${themes[theme][g.accent]}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${toolIcons[id]}</g>`
        : `<path d="${icon.path}" class="${g.accent}"/>`;
      body += `<g data-tech="${id}" transform="translate(${x},${iy}) scale(1.5)">${mark}</g>`;
      body += text(x + 18, iy + (mobile ? 58 : 61), g.names[j], mobile ? 17 : 16, mobile ? "fg" : "muted", `text-anchor="middle" data-label-for="${id}"`);
    });
    if (!mobile) {
      body += text(20, y + 76, ["Browser-facing", "Server-side", "Beyond the web", "Under the hood", "Shells & infrastructure"][i], 14, "muted");
    }
  });
  return svg(theme, w, rowH * groups.length, "Toolchain modules: interface, APIs and data, apps and code, systems, ops and networks. The last row uses tool symbols, not brand logos.", body);
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

export function repositoryButton(theme, key) {
  const p = projectSpecs[key];
  const t = themes[theme];
  const label = key === "diary" ? "Follow the build" : "Explore repository";
  const caption = key === "fire" ? "SMART FIRE / SOURCE CODE" : `${p.title} / SOURCE CODE`;
  let body = `<rect x="1" y="1" width="358" height="74" rx="4" fill="${t[p.color]}"/>`;
  // CodeXml and ArrowUpRight from Lucide (ISC); see assets/LUCIDE-LICENSE.
  body += `<g transform="translate(20,26)" fill="none" stroke="${t.bg}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></g>`;
  body += `<text x="62" y="32" font-size="18" fill="${t.bg}" font-weight="700">${label}</text>`;
  body += `<text x="62" y="53" font-size="11" fill="${t.bg}">${caption}</text>`;
  body += `<g transform="translate(315,26)" fill="none" stroke="${t.bg}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></g>`;
  return svg(theme, 360, 76, `${label}: ${p.title} on GitHub`, body);
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
  const t = themes[theme];
  const size = mobile ? 6 : 12;
  const step = mobile ? 8 : 16;
  const x0 = (w - calendar.weeks.length * step) / 2;
  const y0 = 80;
  let body = text(24, 29, "CONTRIBUTION ARCADE", mobile ? 13 : 15, "lime");
  body += text(24, 53, "PACKET RUN", mobile ? 12 : 13, "pink");
  body += text(w - 24, 53, "12 MONTH MAP", mobile ? 11 : 13, "muted", 'text-anchor="end"');
  body += rect(12, 64, w - 24, step * 7 + 28, "wire");
  const firstWeek = Date.parse(calendar.weeks[0].date);
  const max = Math.max(1, ...calendar.days.map((d) => d.count));
  const point = (day) => ({
    x: x0 + Math.floor((Date.parse(day.date) - firstWeek) / (7 * 86400000)) * step + size / 2,
    y: y0 + new Date(day.date).getUTCDay() * step + size / 2,
  });
  calendar.days.forEach((day) => {
    const { x, y } = point(day);
    const opacity = day.count ? 0.3 + 0.7 * Math.sqrt(day.count / max) : 1;
    const color = day.count ? (day.count / max >= 0.5 ? "cyan" : "lime") : "line";
    body += `<rect x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" rx="2" fill="${t[color]}" opacity="${opacity.toFixed(2)}"><title>${day.date}: ${day.count} contributions</title></rect>`;
  });
  const replay = calendar.days.filter((day) => day.count > 0).slice(-12);
  const captionY = mobile ? 188 : 244;
  body += text(w - 24, 29, `AUTO / ${replay.length} STAGES`, mobile ? 11 : 13, "cyan", 'text-anchor="end"');
  if (replay.length) {
    const duration = replay.length * 2.4;
    const route = replay.map(point);
    let frames = "";
    let score = 0;
    let motion = "";
    let styles = `.replay-frame{opacity:0;animation-duration:${duration}s;animation-timing-function:steps(1,end);animation-iteration-count:infinite}`;
    replay.forEach((day, i) => {
      const { x, y } = route[i];
      const start = (i / replay.length * 100).toFixed(5);
      const hold = ((i + 0.4) / replay.length * 100).toFixed(5);
      const end = ((i + 1) / replay.length * 100).toFixed(5);
      motion += `${start}%,${hold}%{transform:translate(${x}px,${y}px)}`;
      score += day.count;
      styles += `.replay-${i}{animation-name:replay-${i}}@keyframes replay-${i}{0%{opacity:0}${start}%{opacity:1}${end}%{opacity:0}100%{opacity:0}}`;
      frames += `<g class="replay-frame replay-${i}${i === replay.length - 1 ? " replay-latest" : ""}" data-replay-date="${day.date}" data-replay-count="${day.count}" data-run-total="${score}">`;
      frames += `<rect class="checkpoint" x="${x - size / 2 - 3}" y="${y - size / 2 - 3}" width="${size + 6}" height="${size + 6}" rx="2" fill="none" stroke="${t.pink}" stroke-width="2"/>`;
      frames += text(24, captionY, day.date, mobile ? 19 : 23, "fg", 'font-weight="700"');
      frames += text(24, captionY + 29, `+${day.count} ${day.count === 1 ? "contribution" : "contributions"}`, mobile ? 16 : 18, "lime");
      frames += text(w - 24, captionY, `STAGE ${String(i + 1).padStart(2, "0")} / ${String(replay.length).padStart(2, "0")}`, mobile ? 13 : 15, "cyan", 'text-anchor="end"');
      frames += text(w - 24, captionY + 29, `RUN TOTAL ${score}`, mobile ? 13 : 15, "pink", 'text-anchor="end"');
      const segment = (w - 48) / replay.length;
      for (let j = 0; j < replay.length; j++) {
        frames += `<rect x="${24 + j * segment}" y="${captionY + 45}" width="${segment - 4}" height="4" fill="${t[j <= i ? "cyan" : "line"]}"/>`;
      }
      frames += "</g>";
    });
    motion += `100%{transform:translate(${route[0].x}px,${route[0].y}px)}`;
    styles += `.arcade-runner{animation:packet-run ${duration}s linear infinite}.arcade-flame{animation:engine .3s steps(2,end) infinite}.checkpoint{animation:pickup 1.2s ease-in-out infinite}@keyframes packet-run{${motion}}@keyframes engine{50%{opacity:.25}}@keyframes pickup{50%{stroke:${t.cyan}}}`;
    // The owner explicitly requested always-on playback; reduced motion still suppresses flicker.
    styles += "@media(prefers-reduced-motion:reduce){.arcade-flame,.checkpoint{animation:none}}";
    const trail = route.map(({ x, y }, i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
    body += `<style>${styles}</style><path d="${trail}" fill="none" stroke="${t.cyan}" stroke-width="1" stroke-dasharray="2 5" opacity=".45"/>${frames}`;
    // Original pixel spacecraft; all waypoints are actual calendar cells.
    body += `<g class="arcade-runner" data-arcade-route="${route.map(({ x, y }) => `${x},${y}`).join(" ")}"><g transform="scale(${mobile ? 0.75 : 1})" shape-rendering="crispEdges"><path class="arcade-flame" d="M-13 -3h-5v6h5zM-20 -1h-3v2h3z" fill="${t.pink}"/><path d="M-11 -7h9v3h5v2h5v4H3v2h-5v3h-9v-4h-3v-6h3z" fill="${t.fg}"/><path d="M-9 -4h6v8h-6z" fill="${t.cyan}"/><path d="M-11 -9h5v3h-5zM-11 6h5v3h-5z" fill="${t.lime}"/></g></g>`;
  } else {
    body += text(24, captionY, "No contributions in this period.", mobile ? 16 : 19, "muted");
  }
  body += text(24, captionY + 76, "DAILY TOTALS / PRIVATE ACTIVITY ANONYMISED", mobile ? 11 : 12, "muted");
  return svg(theme, w, captionY + 94, "Packet Run: an animated pixel spacecraft visits up to twelve recent active days on the real contribution calendar. Run total is the subtotal of those days, not the annual total. Public and opted-in private activity counts only; no private repository details.", body);
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

export function contactButton(theme, key, icons) {
  const specs = {
    linkedin: { icon: "linkedin", label: "LinkedIn", caption: "Iván Baltanás", color: "cyan" },
    primarymail: { icon: "gmail", label: "ivabalta@gmail.com", caption: "EMAIL / DIRECT", color: "lime" },
    codermail: { icon: "gmail", label: "blondcoder@gmail.com", caption: "EMAIL / DIRECT", color: "pink" },
  };
  const p = specs[key];
  if (!p || !icons[p.icon]) throw new Error(`Missing contact icon: ${key}`);
  const t = themes[theme];
  let body = `<rect x="1" y="1" width="268" height="74" rx="4" fill="${t.panel}" stroke="${t[p.color]}"/>`;
  body += `<g data-contact-icon="${p.icon}" transform="translate(17,22) scale(1.3)"><path d="${icons[p.icon].path}" class="${p.color}"/></g>`;
  body += text(64, 33, p.label, key === "linkedin" ? 19 : 15, "fg", 'font-weight="700"');
  body += text(64, 55, p.caption, 12, "muted");
  return svg(theme, 270, 76, key === "linkedin" ? "Open Iván Baltanás on LinkedIn" : `Email ${p.label}`, body);
}
