const handleRequestWith = handler => async request => {
  const handled = await handler(request);
  if (handled) {
    handled.continue();
  }
};

const unmock = (requestHandler, page) => async () => {
  page.removeListener("request", requestHandler);
  await page.setRequestInterception(false);
};

export const mock = async (handler, page) => {
  await page.setRequestInterception(true);
  const requestHandler = handleRequestWith(handler);
  page.on("request", requestHandler);
  return unmock(requestHandler, page);
};

export const withMock = async (mocks, page, callback) => {
  const detach = await mock(mocks, page);
  await callback(page);
  await detach();
};
