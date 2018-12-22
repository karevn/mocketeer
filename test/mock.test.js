import { mock } from "../src";
import { createMockPage, createGetRequest } from "./mocks";

describe("mock", () => {
  test("attaches the mocks to the page", async () => {
    const page = createMockPage();
    await mock(() => null, page);
    expect(page.setRequestInterception).toHaveBeenCalledWith(true);
    expect(page.on).toHaveBeenCalledTimes(1);
  });

  test("calls request iterceptors upon request", async () => {
    const page = createMockPage();
    const handler = jest.fn(a => null);
    await mock(handler, page);
    const request = createGetRequest("http://localhost");
    await page._simulateRequest(request);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(request);
    expect(request.continue).not.toHaveBeenCalled();
  });

  test("continues the request if nothing has been matched", async () => {
    const page = createMockPage();
    const handler = jest.fn(a => a);
    await mock(handler, page);
    const request = createGetRequest("http://localhost");
    await page._simulateRequest(request);
    expect(request.continue).toHaveBeenCalled();
  });
});
