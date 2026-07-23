import { test, expect } from '@playwright/test';

test.describe('Undo restores state', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('undo button is disabled when there is no move history', async ({ page }) => {
    const undoButton = page.getByTestId('undo-button');
    await expect(undoButton).toBeDisabled();
  });

  test('undo reverts a stock draw', async ({ page }) => {
    await expect(page.getByTestId('move-counter')).toHaveText('Moves: 0');

    const stock = page.getByLabel('Stock pile, 24 cards remaining');
    await stock.click();

    await page.waitForTimeout(300);

    await expect(page.getByLabel('Stock pile, 21 cards remaining')).toBeVisible();
    await expect(page.getByTestId('move-counter')).toHaveText('Moves: 3');

    const undoButton = page.getByTestId('undo-button');
    await expect(undoButton).toBeEnabled();

    await undoButton.click();

    await page.waitForTimeout(300);

    await expect(page.getByLabel('Stock pile, 24 cards remaining')).toBeVisible();
    await expect(page.getByLabel('Empty waste pile')).toBeVisible();
    await expect(page.getByTestId('move-counter')).toHaveText('Moves: 0');
    await expect(undoButton).toBeDisabled();
  });

  test('undo reverts a foundation move', async ({ page }) => {
    await page.evaluate(() => {
      const dispatch = window.__klondikeDispatch;
      if (!dispatch) return;

      const ace = {
        id: 'ah',
        suit: 'hearts',
        rank: 'A',
        color: 'red',
        faceUp: true,
      };

      const tableau = Array.from({ length: 7 }, (_, i) => ({
        type: 'tableau' as const,
        cards: i === 0 ? [ace] : [],
      }));

      dispatch({
        type: 'setState',
        state: {
          deck: [],
          stock: [],
          waste: [],
          foundations: Array.from({ length: 4 }, () => ({ type: 'foundation' as const, cards: [] })),
          tableau,
          moves: [],
          gameOver: false,
          drawMode: 3,
          selectedCardId: null,
          undoHistory: [],
        },
      });
    });

    await page.waitForTimeout(300);

    await expect(page.getByTestId('move-counter')).toHaveText('Moves: 0');

    const ace = page.locator('button[aria-label="A of hearts (red) card"]').first();
    const foundation = page.getByLabel('Empty foundation 1');
    await ace.hover();
    await page.mouse.down();
    const targetBox = await foundation.boundingBox();
    if (targetBox) {
      await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
        steps: 5,
      });
    }
    await page.mouse.up();

    await page.waitForTimeout(300);

    await expect(page.getByTestId('move-counter')).toHaveText('Moves: 1');
    const foundationAfter = page.getByLabel('Foundation pile 1');
    const foundationCard = foundationAfter.locator('button[aria-label$="card"]');
    await expect(foundationCard).toHaveCount(1);

    const undoButton = page.getByTestId('undo-button');
    await undoButton.click();

    await page.waitForTimeout(300);

    await expect(page.getByLabel('Empty foundation 1')).toBeVisible();
    await expect(page.getByTestId('move-counter')).toHaveText('Moves: 0');
    await expect(undoButton).toBeDisabled();
  });
});
