# Mocketeer

Mocketeer is a Puppeteer server request mocking library inspired by React Router and nock.js

## Installation

Using [npm](https://www.npmjs.com/):

```bash
npm install mocketeer --save
```

## Usage

```javascript
const puppeteer = require("puppeteer");
const { mock, methods, compose } = require("mocketeer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  mock(
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
    page
  );
  await page.goto("https://example.com");
  await page.screenshot({ path: "./screenshots/example.png" });
  await page.goto("https://example.com/products");
  await page.screenshot({ path: "./screenshots/example2.png" });

  await browser.close();
})();
```
