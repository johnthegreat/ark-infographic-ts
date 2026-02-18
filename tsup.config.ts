import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/rasterizer.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
});
