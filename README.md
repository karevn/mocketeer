# Mocketeer

Mocketeer is a Puppeteer server request mocking library inspired by Express.js, React Router and nock.js. It uses
the same routing approach allows you to mock your server responses with static or dynamic data.

## Installation

Using [npm](https://www.npmjs.com/):

```bash
npm install mocketeer --save
```

## Usage

```javascript
const puppeteer = require("puppeteer");
const { withMock, methods, composeP } = require("mocketeer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await withMock(
    compose(
      methods.get("https://example.com", {
        status: 200,
        body: "Hello world"
      }),
      methods.get(
        "https://example.com/:page",
        jest.fn(({ page }) => ({ status: 200, body: `Page: ${page}` }))
      )
    ),
    page,
    async () => {
      await page.goto("https://example.com");
      await page.screenshot({ path: "./screenshots/example.png" });
      await page.goto("https://example.com/products");
      await page.screenshot({ path: "./screenshots/example2.png" });
    }
  );
  await browser.close();
})();
```

## API

### `async withMock(requestHandlers, puppeteerPage, callback)`

Wraps a piece of your code into mocketeer-enabled context. Request mocking is only available in the code executed by `callback` function.

```javascript
await withMock(
  methods.get("https://example.com", {
    status: 200,
    body: "Hello world"
  })
),
  page,
  async () => {
    await page.goto("https://example.com");
    await page.screenshot({ path: "./screenshots/example.png" });
  };
```

#### Parameters

| Name             | Type           | Description                                                                                                                             |
| ---------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `requestHandler` | function       | a request handler for mocked requests created by `mocketeer.methods.<method>` or composed using `composeP` function.                    |
| `page`           | Object         | Puppeteer page created by `browser.newPage` or available in a global context.                                                           |
| `callback`       | async function | a function returning a promise, which does all the testing. Network queries are matched and mocked by `requestHandler` in this context. |

### methods.get(url, handler, options = {strict: false, exact: false})
### methods.post(url, handler, options = {strict: false, exact: false})
### methods.put(url, handler, options = {strict: false, exact: false})
### methods.post(url, handler, options = {strict: false, exact: false})

Creates a mocked request handler for `url` pattern. by returning the `handler` if it's an object, or running URL params through it if
it's a function.


| Name                | Type                   | Description                                                                                                           |
| ------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `url`               | `string` or `RegExp`   | Url pattern to mock. The syntax is the same used by [express.js](https://expressjs.com/en/4x/api.html#router) routing |
| `handler` - one of: | `object` or `function` |

- **a response object**, like `{body: {order: ....}, status: 200}`
- **a function** which will return a response, like `(params) => ({body: {order: Orders[params.id]}})`

**options** - an object containing these optional flags:

- **strict** - if trailing `/` makes a difference.
- **exact** - if URL matching is exact. So, if you create a handler for `http://localhost` with `exact: true`, `http://localhost/login` will not match.
