import { test, expect } from '@playwright/test';

test.describe('New game deals correctly', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the game board with correct structure', async ({ page }) => {
    await expect(page.getByLabel('Klondike Solitaire board')).toBeVisible();

    await expect(page.getByLabel('Stock pile, 24 cards remaining')).toBeVisible();

    await expect(page.getByLabel('Empty waste pile')).toBeVisible();

    for (let i = 1; i <= 4; i++) {
      await expect(page.getByLabel(`Empty foundation ${i}`)).toBeVisible();
    }

    for (let i = 1; i <= 7; i++) {
      await expect(page.getByLabel(`Tableau pile ${i}`)).toBeVisible();
    }
  });

  test('deals the correct number of cards in each tableau pile', async ({ page }) => {
    const tableauSizes = [1, 2, 3, 4, 5, 6, 7];

    for (let i = 0; i < tableauSizes.length; i++) {
      const tableauLabel = `Tableau pile ${i + 1}`;
      const size = tableauSizes[i];

      const tableau = page.getByLabel(tableauLabel);
      const faceUpCards = tableau.locator('button[aria-label$="card"]');
      await expect(faceUpCards).toHaveCount(size);
    }
  });

  test('only the top card of each tableau pile is face-up', async ({ page }) => {
    const tableauSizes = [1, 2, 3, 4, 5, 6, 7];

    for (let i = 0; i < tableauSizes.length; i++) {
      const tableauLabel = `Tableau pile ${i + 1}`;
      const size = tableauSizes[i];

      const tableau = page.getByLabel(tableauLabel);
      const faceUpCards = tableau.locator('button[aria-label$="card"]');
      await expect(faceUpCards).toHaveCount(size);

      const faceDownCards = tableau.locator('button[aria-label="face-down card"]');
      await expect(faceDownCards).toHaveCount(size - 1);
    }
  });

  test('deals 24 cards to the stock pile', async ({ page }) => {
    await expect(page.getByLabel('Stock pile, 24 cards remaining')).toBeVisible();
  });

  test('all stock cards are face-down', async ({ page }) => {
    const stock = page.getByLabel('Stock pile, 24 cards remaining');
    const faceDownIndicator = stock.locator('span[aria-label]');
    await expect(faceDownIndicator).toHaveCount(0);
  });

  test('all foundations start empty', async ({ page }) => {
    for (let i = 1; i <= 4; i++) {
      await expect(page.getByLabel(`Empty foundation ${i}`)).toBeVisible();
    }
  });

  test('waste pile starts empty', async ({ page }) => {
    await expect(page.getByLabel('Empty waste pile')).toBeVisible();
  });

  test('move counter starts at 0', async ({ page }) => {
    await expect(page.getByTestId('move-counter')).toHaveText('Moves: 0');
  });

  test('new game button is visible', async ({ page }) => {
    await expect(page.getByTestId('new-game-button')).toBeVisible();
    await expect(page.getByTestId('new-game-button')).toHaveText('New Game');
  });

  test('new game button deals a fresh game', async ({ page }) => {
    await page.getByTestId('new-game-button').click();

    await expect(page.getByLabel('Stock pile, 24 cards remaining')).toBeVisible();

    await expect(page.getByTestId('move-counter')).toHaveText('Moves: 0');

    for (let i = 1; i <= 4; i++) {
      await expect(page.getByLabel(`Empty foundation ${i}`)).toBeVisible();
    }
  });

  test('total cards across tableau and stock equals 52', async ({ page }) => {
    const tableauSizes = [1, 2, 3, 4, 5, 6, 7];
    let totalTableauCards = 0;

    for (let i = 0; i < tableauSizes.length; i++) {
      const tableauLabel = `Tableau pile ${i + 1}`;
      const tableau = page.getByLabel(tableauLabel);
      const faceUpCards = tableau.locator('button[aria-label$="card"]');
      const count = await faceUpCards.count();
      totalTableauCards += count;
    }

    expect(totalTableauCards).toBe(28);

    await expect(page.getByLabel('Stock pile, 24 cards remaining')).toBeVisible();

    expect(totalTableauCards + 24).toBe(52);
  });
});
