const { build } = require("esbuild");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

build({
  entryPoints: [path.join(root, "qr", "src", "main.js")],
  outfile: path.join(root, "qr", "qr.js"),
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  legalComments: "none",
  logLevel: "info"
}).catch(() => process.exit(1));