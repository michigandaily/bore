import pkg from "./package.json";
import resolve from "@rollup/plugin-node-resolve";

export default [{
    input: "./src/bore.js",
    output: [{
        file: pkg.main,
        format: "es"
    }],
    plugins: [resolve()]
}]
