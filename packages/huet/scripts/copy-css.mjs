import { copyFile } from "node:fs/promises";
for (const file of ["styles.css", "tailwind.css", "tailwind-utilities.css", "forms.css"])
  await copyFile(`src/core/${file}`, `dist/${file}`);
await copyFile("scripts/check.mjs", "dist/check.mjs");
