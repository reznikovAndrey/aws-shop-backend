import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["./lib/product-service/product-service-stack"],
  bundle: true,
  outdir: "./dist",
  platform: "node",
  target: "node22.14.0",
  sourcemap: true,
  tsconfig: "./tsconfig.json",
});
