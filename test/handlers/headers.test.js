import {
  addContentTypeHeader,
  handleRangeHeaders,
  CONTENT_RANGE,
  CONTENT_TYPE,
  ACCEPT_RANGES
} from "../../src/handlers/headers";

import { createGetRequest } from "../mocks";

describe("addContentTypeHeader", () => {
  test("it adds the header for plain text files", () => {
    expect(addContentTypeHeader({}, "test.txt")).toMatchObject({
      [CONTENT_TYPE]: "text/plain"
    });
  });
});

describe("handleRangeHeaders", () => {
  test("if there are no range headers - it just passes as is", () => {
    const request = createGetRequest("http://localhost");
    expect(handleRangeHeaders(request, {}).headers).toBeUndefined();
  });

  test("if range headers are present - it should respond with a range", () => {
    const request = createGetRequest("http://localhost", {
      [CONTENT_RANGE]: "bytes 0-100/*"
    });
    expect(handleRangeHeaders(request, { body: "test" }).headers).toEqual({
      [ACCEPT_RANGES]: "bytes"
    });
  });
});
