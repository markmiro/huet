// https://medium.com/@tomaszmularczyk89/guide-to-building-a-react-components-library-with-rollup-and-styled-jsx-694ec66bd2
const replace = require("rollup-plugin-replace");
const babel = require("rollup-plugin-babel");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const NODE_ENV = process.env.NODE_ENV || "development";
const outputFile =
  NODE_ENV === "production"
    ? "./lib/huet.prod.cjs.js"
    : "./lib/huet.dev.cjs.js";

const outputFileEs =
  NODE_ENV === "production"
    ? "./lib/huet.prod.esm.js"
    : "./lib/huet.dev.esm.js";

export default {
  input: "./src/huet.js",
  output: [
    {
      file: outputFile,
      format: "cjs"
    },
    {
      file: outputFileEs,
      format: "esm"
    }
  ],
  // "react" is a peer dependency so don't bundle it
  // "stream" is a built-in node module only used in dev, so we do this to suppress errors
  external: id => /^react|^stream/.test(id),
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify(NODE_ENV)
    }),
    babel()
  ]
};
