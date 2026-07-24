import { test, expect } from '@playwright/test';

test.describe('Drag card from tableau to foundation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('dragging an ace from tableau to an empty foundation moves it', async ({ page }) => {
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
          drawMode: 1,
          selectedCardId: null,
          undoHistory: [],
        },
      });
    });

    await page.waitForTimeout(300);

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

    const foundationAfter = page.getByLabel('Foundation pile 1');
    const foundationCard = foundationAfter.locator('button[aria-label$="card"]');
    await expect(foundationCard).toHaveCount(1);

    const cardAria = await foundationCard.getAttribute('aria-label');
    expect(cardAria).toMatch(/^A of (hearts|diamonds|clubs|spades)/);
  });

  test('dragging a tableau card highlights valid foundation drop targets', async ({ page }) => {
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
          drawMode: 1,
          selectedCardId: null,
          undoHistory: [],
        },
      });
    });

    await page.waitForTimeout(300);

    const ace = page.locator('button[aria-label="A of hearts (red) card"]').first();
    await ace.hover();
    await page.mouse.down();

    const foundation = page.getByLabel('Foundation pile 1');
    const classes = await foundation.getAttribute('class');
    expect(classes).toMatch(/ring-blue-400/);

    await page.mouse.up();

    await page.waitForTimeout(300);
  });

  test('move counter increments after a successful drag to foundation', async ({ page }) => {
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
          drawMode: 1,
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
  });
});
