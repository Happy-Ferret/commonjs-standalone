#!/usr/bin/env node
const path = require("path");
const { mkdir, rm, exec } = require("shelljs");
const Case = require("case");
const packageJson = require("../package.json");

const binPath = binName =>
  path.resolve(__dirname, "..", "node_modules", ".bin", binName);

packageJson.workspaces.forEach(workspace => {
  console.log(`\n--- Building ${workspace} ---\n`);

  const srcPath = path.join(workspace, "src");
  const distPath = path.join(workspace, "dist");

  mkdir("-p", distPath);
  rm("-rf", path.join(distPath, "*"));

  exec(`${binPath("babel")} ${srcPath} --out-dir ${distPath}`);
  exec(`${binPath("flow-copy-source")} -v ${srcPath} ${distPath}`);

  const umdBundleName = Case.camel(workspace.replace(/^packages\//, ""));
  exec(
    `${binPath(
      "rollup"
    )} -c rollup.config.js ${distPath}/index.js --file ${distPath}/umd.js --format umd --name ${umdBundleName}`
  );
});
