import { readFile, writeFile, mkdir } from "node:fs/promises";
import { header, toolchain, project, contact, contactButton, repositoryButton } from "./visuals.mjs";

const assets = new URL("../assets/", import.meta.url);
const icons = JSON.parse(await readFile(new URL("brand-icons.json", assets), "utf8"));
await mkdir(assets, { recursive: true });
for (const theme of ["dark", "light"]) {
  for (const mobile of [false, true]) {
    const suffix = `${mobile ? "mobile-" : ""}${theme}.svg`;
    for (const [name, content] of [
      ["workstation", header(theme, mobile)],
      ["toolchain", toolchain(theme, icons, mobile)],
      ["connect", contact(theme, mobile)],
      ...["starstats", "fire", "diary", "lab"].map((key) => [key, project(theme, key, mobile)]),
    ]) {
      await writeFile(new URL(`${name}-${suffix}`, assets), content);
    }
  }
  for (const key of ["starstats", "fire", "diary"]) {
    await writeFile(new URL(`${key}-repository-${theme}.svg`, assets), repositoryButton(theme, key));
  }
  for (const key of ["linkedin", "primarymail", "codermail"]) {
    await writeFile(new URL(`contact-${key}-${theme}.svg`, assets), contactButton(theme, key, icons));
  }
}
