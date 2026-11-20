import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const outputDirectory = path.resolve("dist");
const assetDirectory = path.join(outputDirectory, "_astro");
const limitBytes = 200 * 1024;

function referencesFromHtml(html) {
  const references = new Set();
  const tags = html.matchAll(/<(?:script|link)\\b[^>]*>/gi);
  for (const match of tags) {
    const tag = match[0];
    const script = /^<script\\b/i.test(tag);
    const preload = /rel=["']modulepreload["']/i.test(tag);
    if (!script && !preload) continue;
    const attr = script ? "src" : "href";
    const value = tag.match(new RegExp(attr + "=[\\"']([^\\"']+)[\\"']", "i"))?.[1];
    if (value) references.add(value);
  }
  return references;
}

function resolveAsset(reference, parentFile) {
  if (parentFile && !reference.startsWith("/") && !/^[a-z]+:/i.test(reference)) {
    return fileURLToPath(new URL(reference, pathToFileURL(parentFile)));
  }
  const pathname = decodeURIComponent(new URL(reference, "https://growvidence.invalid").pathname);
  const relative = pathname.replace(/^\\/Growvidence\\//, "").replace(/^\\/+/, "");
  return path.resolve(outputDirectory, relative);
}

async function collectJavaScript(references) {
  const collected = new Set();
  const queue = [...references].map((reference) => ({ reference, parentFile: null }));
  while (queue.length > 0) {
    const { reference, parentFile } = queue.shift();
    const filePath = resolveAsset(reference, parentFile);
    if (!filePath.startsWith(assetDirectory + path.sep) || collected.has(filePath)) continue;
    try {
      if (!(await stat(filePath)).isFile() || !filePath.endsWith(".js")) continue;
    } catch {
      continue;
    }
    collected.add(filePath);
    const source = await readFile(filePath, "utf8");
    const imports = source.matchAll(/\\bfrom\\s*["']([^"']+)["']|\\bimport\\s*\\(\\s*["']([^"']+)["']/g);
    for (const match of imports) {
      const dependency = match[1] ?? match[2];
      if (dependency?.endsWith(".js") || dependency?.includes(".js?")) {
        queue.push({ reference: dependency, parentFile: filePath });
      }
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
for (const asset of appOnlyAssets) totalGzipBytes += gzipSync(await readFile(asset), { level: 9 }).byteLength;

console.log(`App-only JavaScript: ${(totalGzipBytes / 1024).toFixed(2)} KiB gzip (${appOnlyAssets.length} assets; public-page shared assets excluded).`);
assert.ok(
  totalGzipBytes <= limitBytes,
  `App JavaScript exceeds the 200 KiB gzip budget by ${((totalGzipBytes - limitBytes) / 1024).toFixed(2)} KiB.`,
);
