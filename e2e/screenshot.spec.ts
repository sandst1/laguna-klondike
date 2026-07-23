import { test } from '@playwright/test';

test('take screenshot', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('.game-board', { timeout: 10000 });
  await page.screenshot({ path: '/tmp/game-screenshot.png', fullPage: true });
});
