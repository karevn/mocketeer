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
export const staticFile = (url, path, options = {}) =>
  methods.get(url, () => readFile(path).then(respondWithFile(path, options)));

export const staticDir = (url, path, options = {}) =>
  methods.get([url, ":filePath"].join("/"), ({ filePath }) =>
    readFile(Path.join(path, filePath))
      .then(respondWithFile(filePath, options))
      .catch(err => {
        if (err.code === ENOENT) {
          return {
            status: 404,
            body: "Not found"
          };
        }
        throw err;
      })
  );
