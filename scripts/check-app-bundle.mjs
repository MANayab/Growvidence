import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";

import {
  assertHasJavaScriptAssets,
  collectLoadedJavaScript,
  htmlJavaScriptReferences,
} from "./app-bundle.mjs";

const outputDirectory = path.resolve("dist");
const limitBytes = 200 * 1024;
const appHtmlPath = path.join(outputDirectory, "app", "index.html");
const basePath = "/Growvidence/";
const siteOrigin = "https://manayab.github.io";

const appHtml = await readFile(appHtmlPath, "utf8");
const assets = await collectLoadedJavaScript(
  htmlJavaScriptReferences(appHtml),
  {
    outputDirectory,
    basePath,
    siteOrigin,
    htmlPath: appHtmlPath,
  },
);
assertHasJavaScriptAssets(assets);

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
    `  ${report.file}: ${report.rawBytes.toLocaleString("en-US")} bytes raw; ${report.gzipBytes.toLocaleString("en-US")} bytes gzip (${(report.gzipBytes / 1024).toFixed(2)} KiB)`,
  );
}
console.log(
  `Total /app/ JavaScript: ${totalGzipBytes.toLocaleString("en-US")} bytes gzip (${(totalGzipBytes / 1024).toFixed(2)} KiB) across ${reports.length} files; limit ${limitBytes.toLocaleString("en-US")} bytes (200 KiB).`,
);

assert.ok(
  totalGzipBytes <= limitBytes,
  `All /app/ JavaScript totals ${(totalGzipBytes / 1024).toFixed(2)} KiB gzip, exceeding the 200 KiB budget by ${((totalGzipBytes - limitBytes) / 1024).toFixed(2)} KiB.`,
);
