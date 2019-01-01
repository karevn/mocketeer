import { curry, flip } from "ramda";

import methods from "./methods";

export const handleByUrl = url => (method, response, options = {}) =>
  handle(method)(url, response, options);

export { staticFile } from "./static";
export { methods };
export { default as handle } from "./handle";
