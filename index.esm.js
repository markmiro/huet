if (process.env.NODE_ENV === "production") {
  module.exports = require("./lib/huet.prod.esm.js");
} else {
  module.exports = require("./lib/huet.dev.esm.js");
}
