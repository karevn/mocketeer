import { handle, methods } from "../src";
import { createGetRequest } from "./mocks";

const { get, post } = methods;

describe("handle", () => {
  const localhost = "http://localhost";
  const expectedResponse = { status: 200, body: { test: "test" } };

  it("intercepts the matching method", () => {
    expect(typeof handle("get")).toBe("function");
  });

  it("intercepts urls when urls are equal", () => {
    const handler = get(localhost, expectedResponse);
    const request = createGetRequest(localhost);
    const handled = handler(request);
    expect(request.response()).toEqual(expectedResponse);
    expect(handled).toBeNull();
  });

  it("intercepts urls when urls only differ in the trailing slash", () => {
    const handler = get(localhost, expectedResponse);
    const request = createGetRequest(localhost + "/");
    const handled = handler(request);
    expect(request.response()).toEqual(expectedResponse);
    expect(handled).toBeNull();
  });

  it("matches child urls when exact is disabled", () => {
    const handler = get(localhost, expectedResponse);
    const request = createGetRequest(localhost + "/foo");
    const handled = handler(request);
    expect(request.response()).toEqual(expectedResponse);
    expect(handled).toBeNull();
  });

  it("does not match child urls when exact is enabled", () => {
    const handler = get(localhost, expectedResponse, {
      exact: true
    });
    const request = createGetRequest(localhost + "/foo");
    const handled = handler(request);
    expect(request.response()).toBeFalsy();
    expect(handled).toBe(request);
  });

  it("can use a function for a response", () => {
    const responseMock = jest.fn(() => expectedResponse);
    const handler = get("http://localhost/:foo", responseMock, {
      exact: true
    });
    const request = createGetRequest("http://localhost/bar");
    const handled = handler(request);
    expect(request.response()).toEqual(expectedResponse);
    expect(responseMock).toHaveBeenCalledTimes(1);
    expect(responseMock).toHaveBeenCalledWith({ foo: "bar" }, request);
    expect(handled).toBeFalsy();
  });

  it("does not intercept urls with non-matching urls", () => {
    const handler = get("http://foo", expectedResponse);
    const request = createGetRequest(localhost);
    const handled = handler(request);
    expect(request.response()).toBeFalsy();
    expect(handled).toBe(request);
  });

  it("checks for a method when matching", () => {
    const handler = post(localhost, expectedResponse);
    const request = createGetRequest(localhost);
    const handled = handler(request);
    expect(request.response()).toBeFalsy();
    expect(handled).toBe(request);
  });

  it("does not do double-processing - the first one wins", () => {
    const handler = get(localhost, expectedResponse);
    const handler2 = get(localhost, { unexpected: true });
    const request = createGetRequest(localhost);
    const handled = handler(request);
    expect(handled).toBeNull();
    const handled2 = handler2(handled);
    expect(handled2).toBeNull();
  });
});
