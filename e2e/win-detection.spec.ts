import { test, expect } from '@playwright/test';

test.describe('Win detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('win overlay is not visible on a new game', async ({ page }) => {
    await expect(page.getByLabel('You win!')).not.toBeVisible();
  });

  test('win overlay appears when all foundations are filled', async ({ page }) => {
    await expect(page.getByLabel('You win!')).not.toBeVisible();

    await page.evaluate(() => {
      const dispatch = window.__klondikeDispatch;
      if (!dispatch) return;

      const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
      const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      const colors = { hearts: 'red', diamonds: 'red', clubs: 'black', spades: 'black' };

      const foundations = suits.map((suit) => ({
        type: 'foundation',
        cards: ranks.map((rank) => ({
          id: `${suit}-${rank}`,
          suit,
          rank,
          color: colors[suit as keyof typeof colors],
          faceUp: true,
        })),
      }));

      const tableau = Array.from({ length: 7 }, () => ({ type: 'tableau', cards: [] }));

      dispatch({
        type: 'setState',
        state: {
          deck: [],
          stock: [],
          waste: [],
          foundations,
          tableau,
          moves: [],
          gameOver: true,
          drawMode: 1,
          selectedCardId: null,
          undoHistory: [],
        },
      });
    });

    await page.waitForTimeout(300);

    await expect(page.getByLabel('You win!')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'You Win!' })).toBeVisible();
  });

  test('win overlay disappears after starting a new game', async ({ page }) => {
    await page.evaluate(() => {
      const dispatch = window.__klondikeDispatch;
      if (!dispatch) return;

      const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
      const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      const colors = { hearts: 'red', diamonds: 'red', clubs: 'black', spades: 'black' };

      const foundations = suits.map((suit) => ({
        type: 'foundation',
        cards: ranks.map((rank) => ({
          id: `${suit}-${rank}`,
          suit,
          rank,
          color: colors[suit as keyof typeof colors],
          faceUp: true,
        })),
      }));

      const tableau = Array.from({ length: 7 }, () => ({ type: 'tableau', cards: [] }));

      dispatch({
        type: 'setState',
        state: {
          deck: [],
          stock: [],
          waste: [],
          foundations,
          tableau,
          moves: [],
          gameOver: true,
          drawMode: 1,
          selectedCardId: null,
          undoHistory: [],
        },
      });
    });

    await page.waitForTimeout(300);

    await expect(page.getByLabel('You win!')).toBeVisible();

    await page.evaluate(() => {
      const button = document.querySelector('[data-testid="new-game-button"]') as HTMLButtonElement;
      if (button) {
        button.click();
      }
    });

    await page.waitForTimeout(300);

    await expect(page.getByLabel('You win!')).not.toBeVisible();
  });
});
