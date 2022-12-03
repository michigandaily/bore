import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import scss from "rollup-plugin-scss";
import pkg from "./package.json";

export default [
  {
    input: "./src/bore.js",
    output: [{ file: `./dist/${pkg.name}.min.js` }],
    plugins: [resolve(), terser(), scss()],
    onwarn(message, warn) {
      if (message.code === "CIRCULAR_DEPENDENCY") return;
      warn(message);
    },
  },
];
