if (process.env.NODE_ENV === "production") {
  module.exports = require("./lib/huet.prod");
} else {
  module.exports = require("./lib/huet.dev");
}
