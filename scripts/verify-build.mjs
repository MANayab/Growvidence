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

const jsonLdScripts = html
  .split('<script type="application/ld+json">')
  .slice(1)
  .map((script) => script.split("</script>")[0]);
assert.ok(
  jsonLdScripts.length >= 2,
  "Expected Organization and WebSite JSON-LD scripts.",
);
const structuredData = jsonLdScripts.map((json) => JSON.parse(json));
const structuredDataUrls = structuredData.map((item) => item.url);
assert.ok(
  structuredDataUrls.length >= 2 &&
    structuredDataUrls.every(
      (url) => url === "https://manayab.github.io/Growvidence/",
    ),
  "Organization and WebSite JSON-LD URLs must include /Growvidence/.",
);

console.log("Built homepage SEO smoke check passed.");
