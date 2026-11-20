import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("dist");
const assetDirectory = path.join(outputDirectory, "_astro");
const limitBytes = 200 * 1024;

function referencesFromHtml(html) {
  const references = new Set();
  for (const match of html.matchAll(/<(?:script|link)[^>]*>/gi)) {
    const tag = match[0];
    const isScript = tag.startsWith("<script");
    const isPreload = tag.includes('rel="modulepreload"');
    if (!isScript && !isPreload) continue;
    const attribute = isScript ? "src" : "href";
    const reference = tag.match(new RegExp(attribute + '="([^"]+)"', "i"))?.[1];
    if (reference) references.add(reference);
  }
  return references;
}

function resolveAsset(reference) {
  const pathname = decodeURIComponent(new URL(reference, "https://growvidence.invalid").pathname);
  const relative = pathname.replace(/^\/Growvidence\//, "").replace(/^\/+/, "");
  return path.resolve(outputDirectory, relative);
}

async function collectJavaScript(references) {
  const collected = new Set();
  for (const reference of references) {
    const filePath = resolveAsset(reference);
    if (!filePath.startsWith(assetDirectory + path.sep) || !filePath.endsWith(".js")) continue;
    try {
      if (!(await stat(filePath)).isFile()) continue;
      collected.add(filePath);
    } catch {
      continue;
    }
  }
  return collected;
}

const [appHtml, publicHtml] = await Promise.all([
  readFile(path.join(outputDirectory, "app", "index.html"), "utf8"),
  readFile(path.join(outputDirectory, "index.html"), "utf8"),
]);
const [appAssets, publicAssets] = await Promise.all([
  collectJavaScript(referencesFromHtml(appHtml)),
  collectJavaScript(referencesFromHtml(publicHtml)),
]);
const appOnlyAssets = [...appAssets].filter((asset) => !publicAssets.has(asset));
assert.ok(appOnlyAssets.length > 0, "No app-specific JavaScript assets were found.");

let totalGzipBytes = 0;
for (const asset of appOnlyAssets) {
  totalGzipBytes += gzipSync(await readFile(asset), { level: 9 }).byteLength;
}
console.log(
  `App-only JavaScript: ${(totalGzipBytes / 1024).toFixed(2)} KiB gzip (${appOnlyAssets.length} assets; public-page shared assets excluded).`,
);
assert.ok(
  totalGzipBytes <= limitBytes,
  `App JavaScript exceeds the 200 KiB gzip budget by ${((totalGzipBytes - limitBytes) / 1024).toFixed(2)} KiB.`,
);
