export const createMockPage = () => {
  const handlers = [];
  return {
    setRequestInterception: jest.fn(),
    on: jest.fn((event, handler) => handlers.push(handler)),
    _simulateRequest: async request =>
      Promise.all(handlers.map(async handler => handler(request)))
  };
};

export const createGetRequest = (url, headers = {}) => {
  let response = null;
  return {
    url: jest.fn(() => url),
    method: jest.fn(() => "GET"),
    response: jest.fn(() => response),
    respond: jest.fn(newResponse => {
      response = newResponse;
    }),
    headers: jest.fn(() => headers),
    continue: jest.fn()
  };
};
