import webpack from "webpack";
import path from "path";
import { webpackHandler } from "../../src";
import { createGetRequest } from "../mocks";

describe("webpack", () => {
  let webpackCompiler;
  let handler;
  const webpackConfig = {
    mode: "development",
    entry: path.join(__dirname, "fixtures", "example.js"),
    output: {
      publicPath: "http://localhost/"
    }
  };

  beforeEach(() => {
    global.console = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn()
    };
    webpackCompiler = webpack(webpackConfig);
    handler = webpackHandler(webpackCompiler);
  });

  test("passes through the null request", async () => {
    const handled = await handler(null);
    expect(handled).toBeNull();
  });

  test("builds webpack file", async () => {
    const request = createGetRequest("http://localhost/main.js");
    const handled = await handler(request);

    expect(handled).toBeNull();
    expect(request.respond).toHaveBeenCalled();

    const handled2 = await handler(request);
    expect(handled2).toBeNull();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.info).toHaveBeenCalled();
  });

  test("fails on an incorrect file", async () => {
    webpackCompiler = webpack({
      ...webpackConfig,
      entry: path.join(__dirname, "fixtures", "test.txt")
    });
    handler = webpackHandler(webpackCompiler);
    const request = createGetRequest("http://localhost/main.js");
    const handled = await handler(request);

    expect(handled).toBeNull();
    expect(request.respond).toHaveBeenCalled();
    expect(request.response()).toMatchObject({
      status: 500
    });
    expect(console.error).toHaveBeenCalled();
  });
});

describe("Promise", () => {
  it("calls handlers after initial resolution", done => {
    const spy = jest.fn();
    const promise = Promise.resolve("test");
    promise.then(result => {
      promise.then(spy);
    });

    process.nextTick(() => {
      expect(spy).toBeCalled();
      done();
    });
  });
});
