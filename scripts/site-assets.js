const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

module.exports = function assetVersion(name) {
  const content = fs.readFileSync(path.join(__dirname, "..", name));
  return createHash("sha256").update(content).digest("hex").slice(0, 12);
};
