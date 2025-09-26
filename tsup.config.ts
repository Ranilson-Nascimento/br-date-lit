
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  clean: true,
  dts: true,
  format: ["esm", "cjs"],
  target: "node18",
  minify: false,
  sourcemap: true,
  external: ["react"]
});
