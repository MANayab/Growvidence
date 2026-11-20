import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://manayab.github.io",
  base: "/Growvidence/",
  output: "static",
  integrations: [react()],
  trailingSlash: "always",
});
