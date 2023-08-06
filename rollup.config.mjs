import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import summary from "rollup-plugin-summary";

/**
 * @type {import("rollup").OutputOptions}
 */
const configs = {
  input: ["src/index.ts"],
  output: [{
    format: "cjs",
    dir: "dist",
    preserveModules: true,
    exports: "named",
    entryFileNames: "[name].cjs",
    interop: "auto",
    sourcemap: true
  }, {
    dir: "dist", preserveModules: true, sourcemap: true
  }],
  plugins: [
    typescript({
      tsconfig: "tsconfig.json"
    }),
    nodeResolve({
      mainFields: ["module", "main"]
    }),
    commonjs(),
    summary()
  ],
  external: [/node_modules/, /@loopx/]
};

export default configs;
