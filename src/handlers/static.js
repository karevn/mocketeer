import fs from "fs";
import Path from "path";
import util from "util";
import { addContentTypeHeader } from "./headers";
import methods from "./methods";

const ENOENT = "ENOENT";

const readFile = util.promisify(fs.readFile);

export const respondWithFile = (path, options) => body => ({
  body,
  headers: addContentTypeHeader(options.headers, path)
});

const handleNotFound = err => {
  if (err.code === ENOENT) {
    return {
      status: 404,
      body: "Not found"
    };
  }
  throw err;
};

export const staticFile = (url, path, options = {}) =>
  methods.get(url, () =>
    readFile(path)
      .then(respondWithFile(path, options))
      .catch(handleNotFound)
  );

const trimTrailingSlash = str => str.replace(/\/$/, "");

export const staticDir = (url, path, options = {}) =>
  methods.get([trimTrailingSlash(url), ":filePath"].join("/"), ({ filePath }) =>
    readFile(Path.join(path, filePath))
      .then(respondWithFile(filePath, options))
      .catch(handleNotFound)
  );
