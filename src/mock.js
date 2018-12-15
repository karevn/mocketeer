export const mock = (handler, page) => {
  page.setRequestInterception(true);
  const requestHandler = request => {
    const { handled } = handler({ request, handled: false });
    if (!handled) {
      request.continue();
    }
    return { handled, request };
  };
  page.on("request", requestHandler);
  return () => {
    page.removeListener("request", requestHandler);
    page.setRequestInterception(false);
  };
};

export const withMock = (mocks, page, callback) => {
  const detach = mock(mocks, page);
  return callback(page).then(detach);
};
