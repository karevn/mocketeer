import { handle, methods, staticFile } from "../../src";
import { CONTENT_TYPE } from "../../src/handlers/headers";
import { createGetRequest } from "../mocks";

import path from "path";
import { staticDir } from "../../src/handlers/static";

const { get, post } = methods;

describe("handle", () => {
  const localhost = "http://localhost";
  const expectedResponse = { status: 200, body: { test: "test" } };

  it("handles the matching method", () => {
    expect(typeof handle("get")).toBe("function");
  });

  it("handles urls when urls are equal", async () => {
    const handler = get(localhost, expectedResponse);
    const request = createGetRequest(localhost);
    const handled = await handler(request);
    expect(request.response()).toEqual(expectedResponse);
    expect(handled).toBeNull();
  });

  it("handles urls when urls only differ in the trailing slash", async () => {
    const handler = get(localhost, expectedResponse);
    const request = createGetRequest(localhost + "/");
    const handled = await handler(request);
    expect(request.response()).toEqual(expectedResponse);
    expect(handled).toBeNull();
  });

  it("matches child urls when exact is disabled", async () => {
    const handler = get(localhost, expectedResponse);
    const request = createGetRequest(localhost + "/foo");
    const handled = await handler(request);
    expect(request.response()).toEqual(expectedResponse);
    expect(handled).toBeNull();
  });

  it("does not match child urls when exact is enabled", async () => {
    const handler = get(localhost, expectedResponse, {
      exact: true
    });
    const request = createGetRequest(localhost + "/foo");
    const handled = await handler(request);
    expect(request.response()).toBeFalsy();
    expect(handled).toBe(request);
  });

  it("can use a function for a response", async () => {
    const responseMock = jest.fn(() => expectedResponse);
    const handler = get("http://localhost/:foo", responseMock, {
      exact: true
    });
    const request = createGetRequest("http://localhost/bar");
    const handled = await handler(request);
    expect(request.response()).toEqual(expectedResponse);
    expect(responseMock).toHaveBeenCalledTimes(1);
    expect(responseMock).toHaveBeenCalledWith({ foo: "bar" }, request);
    expect(handled).toBeFalsy();
  });

  it("can use a  async function for a response", async () => {
    const responseMock = jest.fn(() => Promise.resolve(expectedResponse));
    const request = createGetRequest("http://localhost/bar");
    const handler = get("http://localhost/:foo", responseMock);
    expect(await handler(request)).toBeFalsy();
    expect(responseMock).toHaveBeenCalledTimes(1);
    expect(request.response()).toEqual(expectedResponse);
    expect(responseMock).toHaveBeenCalledWith({ foo: "bar" }, request);
  });

  it("does not handle urls with non-matching urls", async () => {
    const handler = get("http://foo", expectedResponse);
    const request = createGetRequest(localhost);
    const handled = await handler(request);
    expect(request.response()).toBeFalsy();
    expect(handled).toBe(request);
  });

  it("checks for a method when matching", async () => {
    const handler = post(localhost, expectedResponse);
    const request = createGetRequest(localhost);
    const handled = await handler(request);
    expect(request.response()).toBeFalsy();
    expect(handled).toBe(request);
  });

  it("does not do double-processing - the first one wins", async () => {
    const handler = get(localhost, expectedResponse);
    const handler2 = get(localhost, { unexpected: true });
    const request = createGetRequest(localhost);
    const handled = await handler(request);
    expect(handled).toBeNull();
    const handled2 = await handler2(handled);
    expect(handled2).toBeNull();
  });
});

describe("staticFile", async () => {
  const serveFile = async (url, fileName) => {
    const getFile = staticFile(
      "http://localhost",
      path.join(__dirname, "fixtures", fileName)
    );
    const request = createGetRequest("http://localhost");
    const handled = await getFile(request);
    expect(handled).toBeNull();
    return request;
  };

  test("it serves text files", async () => {
    const request = await serveFile("http://localhost", "test.txt");
    expect(request.response().headers).toEqual({
      [CONTENT_TYPE]: "text/plain"
    });
    expect(request.response().body).toBeInstanceOf(Buffer);
  });

  test("it serves js files", async () => {
    const request = await serveFile("http://localhost", "example.js");
    expect(request.response().headers).toEqual({
      [CONTENT_TYPE]: "application/javascript"
    });
    expect(request.response().body).toBeInstanceOf(Buffer);
  });
});

describe("staticDir", () => {
  const serveDir = staticDir(
    "http://localhost/test",
    path.join(__dirname, "fixtures")
  );

  test("it serves all files", async () => {
    const request = createGetRequest("http://localhost/test/example.js");
    const handled = await serveDir(request);
    expect(handled).toBeNull();
    expect(request.response().body).toBeInstanceOf(Buffer);
  });

  test("it handles 404s", async () => {
    const request = createGetRequest("http://localhost/test/missing.js");
    const handled = await serveDir(request);
    expect(handled).toBeNull();
    expect(typeof request.response().body).toBe("string");
    expect(request.response().status).toBe(404);
  });
});
