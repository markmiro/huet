if (process.env.NODE_ENV === "production") {
  module.exports = require("./lib/huet.prod.cjs.js");
} else {
  module.exports = require("./lib/huet.dev.cjs.js");
}
