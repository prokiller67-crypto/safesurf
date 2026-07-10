import * as esbuild from "esbuild";
import { cpSync, mkdirSync } from "fs";

const watch = process.argv.includes("--watch");

const options = {
  entryPoints: [
    "src/background.ts",
    "src/content.ts",
    "src/popup.ts",
  ],
  bundle: true,
  format: "esm",
  target: "chrome120",
  outdir: "dist",
  // The SDK's credential-chain lazily imports node:fs/node:path for CLI-profile
  // auth. That path is never taken in the browser (we pass apiKey explicitly),
  // so leave the imports unresolved instead of bundling for node.
  external: ["node:*"],
  sourcemap: false,
  minify: false,
  logLevel: "info",
};

mkdirSync("dist", { recursive: true });
// Static assets shipped alongside the bundles
cpSync("public", "dist", { recursive: true });
cpSync("manifest.json", "dist/manifest.json");

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log("watching...");
} else {
  await esbuild.build(options);
}
