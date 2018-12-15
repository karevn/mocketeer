import { mock } from "../src";
import { createMockPage, createGetRequest } from "./mocks";

describe("mock", () => {
  test("attaches the mocks to the page", () => {
    const page = createMockPage();
    mock(() => null, page);
    expect(page.setRequestInterception).toHaveBeenCalledWith(true);
    expect(page.on).toHaveBeenCalledTimes(1);
  });

  test("calls request iterceptors upon request", () => {
    const page = createMockPage();
    const interceptor = jest.fn().mockReturnValue({ handled: true });
    mock(interceptor, page);
    const { request } = createGetRequest("http://localhost");
    page._simulateRequest(request);
    expect(interceptor).toHaveBeenCalledTimes(1);
    expect(interceptor).toHaveBeenCalledWith({ request, handled: false });
    expect(request.continue).not.toHaveBeenCalled();
  });

  test("continues the request if nothing has been matched", () => {
    const page = createMockPage();
    const interceptor = jest.fn().mockReturnValue({ handled: false });
    mock(interceptor, page);
    const { request } = createGetRequest("http://localhost");
    page._simulateRequest(request);
    expect(request.continue).toHaveBeenCalled();
  });
});
