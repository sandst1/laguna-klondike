import { test as base, expect, type Page } from '@playwright/test';

type MyFixtures = {
  page: Page;
};

export const test = base.extend<MyFixtures>({
  page: async ({ browser }, provide) => {
    const page = await browser.newPage();
    await provide(page);
    await page.close();
  },
});

export { expect };
