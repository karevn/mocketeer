import path from "path";
import { URL } from "url";
import querystring from "querystring";
import MemoryFileSystem from "memory-fs";
import WebpackLog from "webpack-log";
import { addContentTypeHeader } from "./headers";
import { handleRequest } from "./handle";

export const getFilenameFromUrl = (compiler, url) => {
  const publicPath = compiler.options.output.publicPath || "/";
  const outputPath = compiler.outputPath;
  // localPrefix is the folder our bundle should be in
  const localPrefix = new URL(publicPath);
  const urlObject = new URL(url);
  let filename;

  // publicPath has the hostname that is not the same as request url's, should fail
  if (
    localPrefix.hostname !== null &&
    urlObject.hostname !== null &&
    localPrefix.hostname !== urlObject.hostname
  ) {
    return false;
  }

  // publicPath is not in url, so it should fail
  if (
    publicPath &&
    localPrefix.hostname === urlObject.hostname &&
    url.indexOf(publicPath) !== 0
  ) {
    return false;
  }

  // strip localPrefix from the start of url
  if (urlObject.pathname.indexOf(localPrefix.pathname) === 0) {
    filename = urlObject.pathname.substr(localPrefix.pathname.length);
  }

  if (
    !urlObject.hostname &&
    localPrefix.hostname &&
    url.indexOf(localPrefix.path) !== 0
  ) {
    return false;
  }

  let uri = outputPath;

  /* istanbul ignore if */
  if (process.platform === "win32") {
    // Path Handling for Microsoft Windows
    if (filename) {
      uri = path.posix.join(outputPath || "", querystring.unescape(filename));

      if (!path.win32.isAbsolute(uri)) {
        uri = `/${uri}`;
      }
    }

    return uri;
  }

  // Path Handling for all other operating systems
  if (filename) {
    uri = path.posix.join(outputPath || "", filename);

    if (!path.posix.isAbsolute(uri)) {
      uri = `/${uri}`;
    }
  }

  // if no matches, use outputPath as filename
  return querystring.unescape(uri);
};

const matcher = compiler => request =>
  getFilenameFromUrl(compiler, request.url());

const runCompiler = (webpackCompiler, options) => {
  const fs = new MemoryFileSystem();
  webpackCompiler.outputFileSystem = fs;

  const log = new WebpackLog({ name: "mocketeer-webpack" });
  log.info("Compiling");
  const statsOptions = {
    colors: true
  };
  return new Promise((resolve, reject) => {
    webpackCompiler.run((error, stats) => {
      if (error) {
        log.error("Failed to compile");
        log.error(stats.toString(statsOptions));
        reject(error.toString());
      } else {
        if (stats.hasErrors()) {
          log.error("Built with errors");
          log.error(stats.toString(statsOptions));
          reject(stats.toString());
        } else if (stats.hasWarnings()) {
          log.warn("Built with warnings");
          log.warn(stats.toString(statsOptions));
        } else {
          log.info("Built successfully");
          log.info(stats.toString(statsOptions));
        }
        resolve(stats);
      }
    });
  });
};

export default (webpackCompiler, options = {}) => {
  const compilePromise = runCompiler(webpackCompiler, options);
  return handleRequest(matcher(webpackCompiler), fileName =>
    compilePromise
      .then(() => ({
        status: 200,
        body: webpackCompiler.outputFileSystem.readFileSync(fileName),
        headers: addContentTypeHeader(options.headers, fileName)
      }))
      .catch(error => ({
        status: 500,
        body: error,
        headers: { "Content-Type": "text/plain" }
      }))
  );
};
