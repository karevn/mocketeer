# Mocketeer

Mocketeer is a Puppeteer server request mocking library inspired by React Router and nock.js. It uses
React Router - like routing and allows you to mock your server responses with static or dynamic data.

## Installation

Using [npm](https://www.npmjs.com/):

```bash
npm install mocketeer --save
```

## Usage

```javascript
const puppeteer = require("puppeteer");
const { withMock, methods, compose } = require("mocketeer");

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

### methods.get(url, handler, options = {strict: false, exact: false})

Creates a mocked request handler for `url` by returning the `handler` if it's an object, or running URL params through it if
it's a function.

**url** - url to attach request mock to. The syntax is 100% the same as used by react-router

**handler** - one of:

- **a response object**, like `{body: {order: ....}, status: 200}`
- **a function** which will return a response, like `(params) => ({body: {order: Orders[params.id]}})`

**options** - an object containing these optional flags:

- **strict** - if trailing `/` makes a difference.
- **exact** - if URL matching is exact. So, if you create a handler for `http://localhost` with `exact: true`, `http://localhost/login` will not match.

### async withMock(requestHandlers, puppeteerPage, callback)

Wraps a piece of your code into mocketeer-enabled context. Request mocking is only available in the code executed by `callback` function.

#### Parameters

**requestHandlers** - a request handler for mocked requests created via `mocketeer.methods.<method>` or composed using `compose` function.

**puppeteerPage** - Puppeteer's Page object.

**callback** - a function returning a promise, which does all the testing in a mocked context.
