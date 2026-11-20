import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const JAVASCRIPT_REFERENCE = /\.m?js(?:[?#][^"'\s<>]*)?$/i;

export function htmlJavaScriptReferences(html) {
  const references = new Set();

  for (const tagMatch of html.matchAll(/<[^>]+>/g)) {
    const tag = tagMatch[0];
    const isScript = /^<script\b/i.test(tag);
    const isModulePreload =
      /^<link\b/i.test(tag) && /\brel=["']modulepreload["']/i.test(tag);

    for (const attributeMatch of tag.matchAll(
      /([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g,
    )) {
      const name = attributeMatch[1].toLowerCase();
      const value =
        attributeMatch[2] ?? attributeMatch[3] ?? attributeMatch[4] ?? "";

      if (
        name === "component-url" ||
        name === "renderer-url" ||
        (isScript && name === "src") ||
        (isModulePreload && name === "href") ||
        JAVASCRIPT_REFERENCE.test(value)
      ) {
        if (value) references.add(value);
      }
    }
  }

  return references;
}

export function resolveAssetPath(
  reference,
  parentFile,
  { outputDirectory, basePath, siteOrigin },
) {
  let resolved;

  try {
    resolved = reference.startsWith("/")
      ? new URL(reference, siteOrigin)
      : parentFile
        ? new URL(reference, pathToFileURL(parentFile))
        : new URL(reference, siteOrigin);
  } catch {
    return null;
  }

  if (resolved.protocol === "file:") {
    return fileURLToPath(resolved);
  }
  if (resolved.protocol !== "https:" && resolved.protocol !== "http:") {
    return null;
  }
  if (resolved.origin !== siteOrigin) return null;

  let pathname;
  try {
    pathname = decodeURIComponent(resolved.pathname);
  } catch {
    return null;
  }

  if (pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length);
  } else {
    pathname = pathname.replace(/^\/+/, "");
  }

  return path.resolve(outputDirectory, pathname);
}

function isInsideDirectory(filePath, directory) {
  const relative = path.relative(directory, filePath);
  return (
    relative !== "" &&
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
}

export async function collectLoadedJavaScript(
  initialReferences,
  {
    outputDirectory,
    basePath = "/",
    siteOrigin = "https://example.invalid",
    htmlPath = path.join(outputDirectory, "index.html"),
  },
) {
  const collected = new Set();
  const pending = [...initialReferences].map((reference) => ({
    reference,
    parentFile: htmlPath,
  }));

  while (pending.length > 0) {
    const { reference, parentFile } = pending.shift();
    const filePath = resolveAssetPath(reference, parentFile, {
      outputDirectory,
      basePath,
      siteOrigin,
    });

    if (
      !filePath ||
      !isInsideDirectory(filePath, outputDirectory) ||
      !/\.(?:js|mjs)$/i.test(filePath) ||
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
      /\b(?:import|export)\s+[^"'()]*?\s+from\s*["']([^"']+)["']/g,
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

export function assertHasJavaScriptAssets(assets) {
  if (assets.size === 0) {
    throw new Error(
      "No JavaScript assets loaded by /app/ were found in the built HTML. " +
        "Check astro-island URLs, script src attributes, modulepreload links, " +
        "and the configured site base path.",
    );
  }
}
