export const mock = (mocks, page) => {
  page.setRequestInterception(true);
  const requestHandler = request => mocks({ request, handled: false });
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
