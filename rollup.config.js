import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

export default [{
  input: "./src/bore.js",
  output: [{ file: `./dist/${pkg.name}.min.js` }],
  plugins: [resolve(), terser()],
  onwarn(message, warn) {
    if (message.code === "CIRCULAR_DEPENDENCY") return;
    warn(message);
  }
}]
