/*
  Screenshots of the demo for reviewing color changes.
  Usage: node scripts/screenshots.ts [baseUrl] [outDir]
*/
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:8731";
const out = process.argv[3] ?? "screenshots";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
const errors: string[] = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

const shots: [string, string][] = [
  ["compare-base", "/compare.html?theme=Base"],
  ["compare-paperback", "/compare.html?theme=Paperback"],
  ["compare-blueprint", "/compare.html?theme=Blueprint"],
  ["sink-base-1", "/index.html?theme=Base&bg=1"],
  ["sink-base-0.51", "/index.html?theme=Base&bg=0.51"],
  ["sink-base-0.49", "/index.html?theme=Base&bg=0.49"],
  ["sink-base-0", "/index.html?theme=Base&bg=0"],
];
for (const name of process.argv.slice(4).length ? process.argv.slice(4) : []) shots.push([name, `/index.html?theme=${encodeURIComponent(name)}`]);

for (const [name, url] of shots) {
  await page.goto(base + url);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
}
await browser.close();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Saved ${shots.length} screenshots to ${out}/`);
