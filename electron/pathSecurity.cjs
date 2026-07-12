"use strict";
const path = require("path");
const fs = require("fs");

function resolveSafePath(baseDir, requestPath) {
  if (
    typeof baseDir !== "string" ||
    typeof requestPath !== "string" ||
    baseDir.includes("\0") ||
    requestPath.includes("\0")
  ) {
    return null;
  }

  const filePath = path.resolve(baseDir, requestPath);

  let baseReal, fileReal;
  try {
    baseReal = fs.realpathSync(baseDir);
    fileReal = fs.realpathSync(filePath);
  } catch (e) {
    return null;
  }

  if (fileReal !== baseReal && !fileReal.startsWith(baseReal + path.sep)) {
    return null;
  }

  try {
    if (!fs.statSync(fileReal).isFile()) return null;
  } catch (e) {
    return null;
  }

  return fileReal;
}

module.exports = { resolveSafePath };
