import pathToRegexp from "path-to-regexp";
import { curry, flip } from "ramda";

const lowerCaseEqual = (a, b) => a.toLowerCase() === b.toLowerCase();

const compilePath = (pattern, options) => {
  const { exact = false, strict = false, sensitive = false } = options;
  const params = [];
  const regexp = pathToRegexp(pattern, params, {
    end: exact,
    strict,
    sensitive
  });
  return { regexp, params };
};

const getParamsFromMatch = (keys, match) => {
  const [url, ...values] = match;
  return keys.reduce((memo, key, index) => {
    memo[key.name] = values[index];
    return memo;
  }, {});
};

const getUrlMatch = (url, options) => {
  const compiled = compilePath(url, options);
  return request => {
    const match = compiled.regexp.exec(request.url());
    return !!match && getParamsFromMatch(compiled.params, match);
  };
};

const getMatch = (url, options) => {
  const cachedGetUrlMatch = getUrlMatch(url, options);
  return request =>
    lowerCaseEqual(options.method, request.method()) &&
    cachedGetUrlMatch(request);
};

const respond = (match, request, response) => {
  request.respond(
    typeof response === "function" ? response(match, request) : response
  );
};

export const handle = method => (url, response, options = {}) => {
  const compiledMatcher = getMatch(url, { method, ...options });
  return ({ request, handled }) => {
    if (handled) {
      return { request, handled };
    }
    const match = compiledMatcher(request);

    if (match && !request.response()) {
      handled = true;
      respond(match, request, response);
    }
    return { request, handled };
  };
};

export const methods = {
  get: handle("get"),
  post: handle("post"),
  put: handle("put"),
  delete: handle("delete"),
  options: handle("options")
};

export const handleByUrl = url => (method, response, options = {}) =>
  handle(method)(url, response, options);
