import { test as base, expect, type Page } from '@playwright/test';

type MyFixtures = {
  page: Page;
};

export const test = base.extend<MyFixtures>({
  page: async ({ browser }, use) => {
    const page = await browser.newPage();
    await use(page);
    await page.close();
  },
});

export { expect };
