export const createMockPage = () => {
  const handlers = [];
  return {
    setRequestInterception: jest.fn(),
    on: jest.fn((event, handler) => handlers.push(handler)),
    _simulateRequest: async request =>
      Promise.all(handlers.map(async handler => await handler(request)))
  };
};

export const createGetRequest = url => {
  let response = null;
  return {
    url: jest.fn(() => url),
    method: jest.fn(() => "GET"),
    response: jest.fn(() => response),
    respond: jest.fn(newResponse => {
      response = newResponse;
    }),
    continue: jest.fn()
  };
};
