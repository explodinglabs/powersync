const esbuild = require("./node_modules/.bin/esbuild");

esbuild
  .build({
    entryPoints: ["src/powersync.ts"], // Entry file
    bundle: true, // Bundle everything together
    target: "es2020", // Specify ECMAScript version to target
    platform: "browser", // Target platform (browser)
  })
  .catch(() => process.exit(1)); // Exit process if build fails
