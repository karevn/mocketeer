import fs from "fs";
import util from "util";
import Mime from "mime-types";

import methods from "./methods";

const readFile = util.promisify(fs.readFile);

const getContentType = path => Mime.lookup(path);

export const staticFile = (url, path, options = {}) =>
  methods.get(url, () =>
    readFile(path).then(body => ({
      body,
      headers: options.headers || { "Content-type": getContentType(path) }
    }))
  );
