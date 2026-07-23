import { test, expect } from '@playwright/test';

test.describe('Click stock to draw', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('clicking the stock draws cards to the waste pile', async ({ page }) => {
    const stock = page.getByLabel('Stock pile, 24 cards remaining');
    await expect(stock).toBeVisible();

    await expect(page.getByLabel('Empty waste pile')).toBeVisible();

    await stock.click();

    await page.waitForTimeout(300);

    const wastePile = page.getByLabel('Waste pile');
    const wasteCard = wastePile.locator('button[aria-label$="card"]');
    await expect(wasteCard).toHaveCount(1);

    const cardAria = await wasteCard.getAttribute('aria-label');
    expect(cardAria).toMatch(/^(A|2|3|4|5|6|7|8|9|10|J|Q|K) of (hearts|diamonds|clubs|spades) \((red|black)\) card$/);
  });

  test('drawn card is face-up', async ({ page }) => {
    const stock = page.getByLabel('Stock pile, 24 cards remaining');
    await stock.click();

    await page.waitForTimeout(300);

    const wastePile = page.getByLabel('Waste pile');
    const wasteCard = wastePile.locator('button[aria-label$="card"]').first();
    const cardAria = await wasteCard.getAttribute('aria-label');
    expect(cardAria).not.toBe('face-down card');
  });

  test('stock card count decreases after drawing', async ({ page }) => {
    const stockBefore = page.getByLabel('Stock pile, 24 cards remaining');
    await expect(stockBefore).toBeVisible();

    await stockBefore.click();

    await page.waitForTimeout(300);

    await expect(page.getByLabel('Stock pile, 21 cards remaining')).toBeVisible();
  });

  test('move counter increments after drawing', async ({ page }) => {
    await expect(page.getByTestId('move-counter')).toHaveText('Moves: 0');

    const stock = page.getByLabel('Stock pile, 24 cards remaining');
    await stock.click();

    await page.waitForTimeout(300);

    await expect(page.getByTestId('move-counter')).toHaveText('Moves: 3');
  });

  test('recycling waste when stock is empty returns cards to stock', async ({ page }) => {
    let stockCount = 24;
    while (stockCount > 0) {
      await page.getByLabel(`Stock pile, ${stockCount} cards remaining`).click();
      await page.waitForTimeout(300);
      stockCount -= 3;
    }

    await expect(page.getByLabel('Stock pile, 0 cards remaining')).toBeVisible();

    await page.getByLabel('Stock pile, 0 cards remaining').click();

    await page.waitForTimeout(300);

    const stockAfterRecycle = page.locator('[aria-label^="Stock pile,"]');
    const stockLabelAfter = await stockAfterRecycle.getAttribute('aria-label');
    expect(stockLabelAfter).not.toBe('Stock pile, 0 cards remaining');
    expect(stockLabelAfter).toMatch(/^Stock pile, \d+ cards remaining$/);
  });
});
