const path = require("path");
const pkg = require("./package.json");
// https://medium.com/@tomaszmularczyk89/guide-to-building-a-react-components-library-with-rollup-and-styled-jsx-694ec66bd2

const replace = require("rollup-plugin-replace");
const babel = require("rollup-plugin-babel");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const terser = require("rollup-plugin-terser").terser;
const filesize = require("rollup-plugin-filesize");
const NodeLicense = require("rollup-plugin-node-license");
const visualizer = require("rollup-plugin-visualizer");
const banner = require("rollup-plugin-banner").default;

const NODE_ENV = process.env.NODE_ENV || "development";
const isProd = NODE_ENV === "production";

const outputPrefix = "./lib/huet";
const outputFile = isProd
  ? outputPrefix + ".prod.cjs.js"
  : outputPrefix + ".dev.cjs.js";
const outputFileEs = isProd
  ? outputPrefix + ".prod.esm.js"
  : outputPrefix + ".dev.esm.js";

const str = `${pkg.name} v${pkg.version} (${pkg.license} license)
By: ${pkg.author}
${pkg.homepage}`;

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
  external: id => /^react$|^stream$/.test(id),
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify(NODE_ENV)
    }),
    // JSX,
    babel({
      exclude: "node_modules/**"
    }),
    resolve(),
    commonjs(),
    isProd && terser(),
    isProd && new NodeLicense(),
    banner(str),
    isProd &&
      filesize({
        showMinifiedSize: false // Already minifying using terser
      }),
    isProd && visualizer()
  ]
};
