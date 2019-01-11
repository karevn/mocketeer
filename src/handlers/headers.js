import parseRange from "range-parser";
import Mime from "mime-types";

const getContentType = path => Mime.lookup(path);

export const CONTENT_RANGE = "Content-Range";
export const CONTENT_TYPE = "Content-Type";
export const ACCEPT_RANGES = "Accept-Ranges";

export const addContentTypeHeader = (headers = {}, fileName) => ({
  ...headers,
  [CONTENT_TYPE]: getContentType(fileName)
});

const isRangeValid = ranges => ranges !== -2 && ranges.length === 1;

const getBodyRange = (body, ranges) =>
  body.slice(ranges[0].start, ranges[0].end + 1);

const processRangeHeaders = (range, response) => {
  const length = response.body.length;
  const ranges = parseRange(length, range);
  const headers = {
    ...response.headers,
    [ACCEPT_RANGES]: "bytes"
  };
  if (ranges === -1) {
    return {
      ...response,
      headers: {
        ...headers,
        [CONTENT_RANGE]: `bytes */${length}`
      }
    };
  }
  if (isRangeValid(ranges)) {
    return {
      ...response,
      body: getBodyRange(response.body, ranges),
      status: 206,
      headers: {
        ...headers,
        [CONTENT_RANGE]: `bytes ${ranges[0].start}-${ranges[0].end}/${length}`
      }
    };
  }
  return { ...response, headers, status: 416 };
};

export const handleRangeHeaders = (request, response) => {
  const range = request.headers()[CONTENT_RANGE];
  return range ? processRangeHeaders(range, response) : response;
};
