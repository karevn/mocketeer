export const mock = (mocks, page) => {
  page.setRequestInterception(true);
  page.on("request", request => mocks({ request, handled: false }));
};
