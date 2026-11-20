import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const outputDirectory = path.resolve("dist");
const assetDirectory = path.join(outputDirectory, "_astro");
const limitBytes = 200 * 1024;
const appHtmlPath = path.join(outputDirectory, "app", "index.html");
const basePath = "/Growvidence/";

function attributeValue(tag, attribute) {
  return tag.match(new RegExp(attribute + '="([^"]+)"', "i"))?.[1];
}

function htmlJavaScriptReferences(html) {
  const references = new Set();

  for (const match of html.matchAll(/<astro-island\b[^>]*>/gi)) {
    const tag = match[0];
    for (const attribute of ["renderer-url", "component-url"]) {
      const reference = attributeValue(tag, attribute);
      if (reference) references.add(reference);
    }
  }

  for (const match of html.matchAll(/<(?:script|link)\b[^>]*>/gi)) {
    const tag = match[0];
    const isScript = /^<script\b/i.test(tag);
    const isModulePreload = /rel="modulepreload"/i.test(tag);
    if (!isScript && !isModulePreload) continue;
    if (isScript && !/type="module"/i.test(tag)) continue;
    const reference = attributeValue(tag, isScript ? "src" : "href");
    if (reference) references.add(reference);
  }

  return references;
}

function resolveAsset(reference, parentFile) {
  const resolved = parentFile
    ? new URL(reference, pathToFileURL(parentFile))
    : new URL(reference, "https://growvidence.invalid");
  if (resolved.protocol === "file:") return fileURLToPath(resolved);

  let pathname = decodeURIComponent(resolved.pathname);
  if (pathname.startsWith(basePath)) pathname = pathname.slice(basePath.length);
  else pathname = pathname.replace(/^\/+/, "");
  return path.resolve(outputDirectory, pathname);
}

function isInsideAssetDirectory(filePath) {
  return filePath.startsWith(assetDirectory + path.sep);
}

async function collectLoadedJavaScript(initialReferences) {
  const collected = new Set();
  const pending = [...initialReferences].map((reference) => ({
    reference,
    parentFile: null,
  }));

  while (pending.length > 0) {
    const { reference, parentFile } = pending.shift();
    const filePath = resolveAsset(reference, parentFile);
    if (
      !isInsideAssetDirectory(filePath) ||
      !filePath.endsWith(".js") ||
      collected.has(filePath)
    ) {
      continue;
    }

    try {
      if (!(await stat(filePath)).isFile()) continue;
    } catch {
      continue;
    }

    collected.add(filePath);
    const source = await readFile(filePath, "utf8");
    const imports = [
      /\b(?:import|export)\s*[^"'()]*?\s*from\s*["']([^"']+)["']/g,
      /\bimport\s*["']([^"']+)["']/g,
      /\bimport\(\s*["']([^"']+)["']\s*\)/g,
    ];

    for (const pattern of imports) {
      for (const match of source.matchAll(pattern)) {
        pending.push({ reference: match[1], parentFile: filePath });
      }
    }
  }

  return collected;
}

const appHtml = await readFile(appHtmlPath, "utf8");
const assets = await collectLoadedJavaScript(htmlJavaScriptReferences(appHtml));
assert.ok(
  assets.size > 0,
  "No JavaScript assets loaded by /app/ were found in the built HTML.",
);

const reports = [];
let totalGzipBytes = 0;
for (const filePath of [...assets].sort()) {
  const source = await readFile(filePath);
  const gzipBytes = gzipSync(source, { level: 9 }).byteLength;
  totalGzipBytes += gzipBytes;
  reports.push({
    file: path.relative(outputDirectory, filePath).replaceAll(path.sep, "/"),
    rawBytes: source.byteLength,
    gzipBytes,
  });
}

console.log("JavaScript loaded by /app/ (each file gzip-compressed independently):");
for (const report of reports) {
  console.log(
    `  ${report.file}: ${(report.gzipBytes / 1024).toFixed(2)} KiB gzip (${report.rawBytes.toLocaleString("en-US")} bytes raw)`,
  );
}
console.log(
  `Total /app/ JavaScript: ${(totalGzipBytes / 1024).toFixed(2)} KiB gzip across ${reports.length} files (200 KiB limit).`,
);

assert.ok(
  totalGzipBytes <= limitBytes,
  `All /app/ JavaScript totals ${(totalGzipBytes / 1024).toFixed(2)} KiB gzip, exceeding the 200 KiB budget by ${((totalGzipBytes - limitBytes) / 1024).toFixed(2)} KiB.`,
);
