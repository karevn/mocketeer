export const mock = async (handler, page) => {
  await page.setRequestInterception(true);
  const requestHandler = request => {
    const { handled } = handler({ request, handled: false });
    if (!handled) {
      request.continue();
    }
    return { handled, request };
  };
  page.on("request", requestHandler);
  return async () => {
    page.removeListener("request", requestHandler);
    await page.setRequestInterception(false);
  };
};

export const withMock = async (mocks, page, callback) => {
  const detach = await mock(mocks, page);
  const result = await callback(page);
  await detach;
};
