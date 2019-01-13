// https://medium.com/@tomaszmularczyk89/guide-to-building-a-react-components-library-with-rollup-and-styled-jsx-694ec66bd2
const replace = require("rollup-plugin-replace");
const babel = require("rollup-plugin-babel");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const NODE_ENV = process.env.NODE_ENV || "development";
const outputFile = NODE_ENV === "production" ? "./lib/prod.js" : "./lib/dev.js";

export default {
  input: "./src/index.js",
  output: {
    file: outputFile,
    format: "cjs"
  },
  // React is a peer dependency so doing bundle it
  external: ["react"],
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify(NODE_ENV)
    }),
    babel({
      // Don't transpile node_modules
      exclude: "node_modules/**"
    }),
    // Get node_modules and "resolve" them properly to include in
    // the output bundle
    resolve(),
    // Most node_modules are Node.js CommonJS, so handle them
    commonjs()
  ]
};
