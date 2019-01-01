import pathToRegexp from "path-to-regexp";

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
const respond = async (match, request, response) => {
  const actualResponse =
    typeof response === "function" ? await response(match, request) : response;
  request.respond(actualResponse);
};

const handleRequest = (compiledMatcher, response) => async request => {
  if (!request) {
    return request;
  }
  const match = compiledMatcher(request);
  if (match) {
    await respond(match, request, response);
    return null;
  }
  return request;
};

export default method => (url, response, options = {}) =>
  handleRequest(getMatch(url, { method, ...options }), response);
