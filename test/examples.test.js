import { compose, methods, withMock } from "../src";
import puppeteer from "puppeteer";

describe("examples", () => {
  it("example1", async () => {
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
  });
});
