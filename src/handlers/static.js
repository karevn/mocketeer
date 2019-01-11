import fs from "fs";
import util from "util";
import { addContentTypeHeader } from "./headers";

import methods from "./methods";

const readFile = util.promisify(fs.readFile);

export const staticFile = (url, path, options = {}) =>
  methods.get(url, () =>
    readFile(path).then(body => ({
      body,
      headers: addContentTypeHeader(options.headers, path)
    }))
  );
