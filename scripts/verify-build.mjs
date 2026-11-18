import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile("dist/index.html", "utf8");
const required = [
  /<title>Growvidence — Evidence-Based Skill Tracker<\/title>/,
  /<meta name="description" content="Turn learning activity into demonstrable capability\./,
  /<link rel="canonical" href="https:\/\/manayab\.github\.io\/Growvidence\/"\s*\/>/,
  /"@type":"Organization"/,
  /"@type":"WebSite"/,
];

for (const pattern of required) {
  assert.match(
    html,
    pattern,
    `Built homepage is missing expected SEO output: ${pattern}`,
  );
}

console.log("Built homepage SEO smoke check passed.");
