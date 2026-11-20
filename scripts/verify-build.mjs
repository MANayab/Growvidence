import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile("dist/index.html", "utf8");
const required = [
  /<title>Growvidence — Evidence-Based Skill Tracker<\/title>/,
  /<meta name="description" content="Turn learning activity into demonstrable capability\./,
  /<link\b(?=[^>]*\brel="canonical")(?=[^>]*\bhref="https:\/\/manayab\.github\.io\/Growvidence\/")[^>]*>/,
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

const appHtml = await readFile("dist/app/index.html", "utf8");
assert.match(
  appHtml,
  /<meta name="robots" content="noindex, nofollow">/,
  "Built /app/ HTML must contain a noindex, nofollow robots directive.",
);

const sitemap = await readFile("dist/sitemap.xml", "utf8");
assert.doesNotMatch(
  sitemap,
  /https:\/\/manayab\.github\.io\/Growvidence\/app(?:\/|<)/i,
  "The /app/ route must not appear in sitemap.xml.",
);

const robots = await readFile("dist/robots.txt", "utf8");
assert.doesNotMatch(
  robots,
  /^\s*Disallow:\s*\/app\/?\s*$/im,
  "robots.txt must not disallow /app/; crawlers need to read its noindex directive.",
);

console.log("App noindex, sitemap exclusion and robots.txt checks passed.");
