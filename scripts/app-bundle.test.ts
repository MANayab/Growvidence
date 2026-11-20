import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  assertHasJavaScriptAssets,
  collectLoadedJavaScript,
  htmlJavaScriptReferences,
} from "./app-bundle.mjs";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("app bundle asset discovery", () => {
  it("discovers Astro island, renderer, and transitive JavaScript chunks", async () => {
    const outputDirectory = await mkdtemp(
      path.join(os.tmpdir(), "growvidence-bundle-"),
    );
    temporaryDirectories.push(outputDirectory);

    const assetsDirectory = path.join(outputDirectory, "_astro");
    await mkdir(assetsDirectory, { recursive: true });

    const html = `<!doctype html>
<html>
  <body>
    <astro-island
      component-url="/Growvidence/_astro/WorkspaceIsland.DAv8BmM3.js"
      renderer-url="/Growvidence/_astro/client.Cd-EeyjT.js"
      ssr
    ></astro-island>
  </body>
</html>`;

    await writeFile(
      path.join(assetsDirectory, "WorkspaceIsland.DAv8BmM3.js"),
      'import{React}from"./react.CvnImTBr.js";import("./lazy-chunk.js");export{React as default};',
    );
    await writeFile(
      path.join(assetsDirectory, "client.Cd-EeyjT.js"),
      'export{default}from"./react.CvnImTBr.js";',
    );
    await writeFile(
      path.join(assetsDirectory, "react.CvnImTBr.js"),
      "export default {};",
    );
    await writeFile(
      path.join(assetsDirectory, "lazy-chunk.js"),
      "export const loaded = true;",
    );

    const references = htmlJavaScriptReferences(html);
    const assets = await collectLoadedJavaScript(references, {
      outputDirectory,
      basePath: "/Growvidence/",
      siteOrigin: "https://manayab.github.io",
      htmlPath: path.join(outputDirectory, "app", "index.html"),
    });

    expect([...assets].map((file) => path.basename(file)).sort()).toEqual([
      "WorkspaceIsland.DAv8BmM3.js",
      "client.Cd-EeyjT.js",
      "lazy-chunk.js",
      "react.CvnImTBr.js",
    ]);
    expect(() => assertHasJavaScriptAssets(assets)).not.toThrow();
  });

  it("recognizes script src, modulepreload, and other .js-valued attributes", () => {
    const references = htmlJavaScriptReferences(`<script src="/Growvidence/a.js"></script>
<link rel="modulepreload" href="/Growvidence/b.js">
<div data-worker=/Growvidence/c.js></div>`);

    expect([...references].sort()).toEqual([
      "/Growvidence/a.js",
      "/Growvidence/b.js",
      "/Growvidence/c.js",
    ]);
  });

  it("throws a clear error when no JavaScript assets are found", () => {
    expect(() => assertHasJavaScriptAssets(new Set())).toThrow(
      "No JavaScript assets loaded by /app/ were found in the built HTML.",
    );
  });
});
