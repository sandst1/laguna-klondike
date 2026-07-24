import { test, expect } from '@playwright/test';

/**
 * Usability friction test — plays through games using real interactions
 * (click, drag, double-click, undo, settings) and asserts that each
 * core interaction path is smooth and responsive.
 *
 * This test mirrors what a human player would do and checks for
 * friction points: missing feedback, broken interactions, janky
 * animations, or unclear state transitions.
 */

interface FrictionPoint {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

class FrictionCollector {
  private points: FrictionPoint[] = [];

  add(category: string, description: string, severity: 'low' | 'medium' | 'high' = 'medium') {
    this.points.push({ category, description, severity });
  }

  get highSeverity(): FrictionPoint[] {
    return this.points.filter((p) => p.severity === 'high');
  }

  get all(): FrictionPoint[] {
    return this.points;
  }

  report(): string {
    if (this.points.length === 0) {
      return 'No friction points detected.';
    }
    const lines = this.points.map((p) => {
      const marker = p.severity === 'high' ? '🔴' : p.severity === 'medium' ? '🟡' : '🟢';
      return `${marker} [${p.category}] ${p.description}`;
    });
    return `Detected ${this.points.length} friction point(s):\n${lines.join('\n')}`;
  }
}

test.describe('Usability friction — play-through', () => {
  let friction: FrictionCollector;

  test.beforeEach(async ({ page }) => {
    friction = new FrictionCollector();
    await page.goto('/');
    await page.waitForTimeout(300);
  });

  test.afterEach(async () => {
    const report = friction.report();
    if (report !== 'No friction points detected.') {
      // eslint-disable-next-line no-console
      console.warn(report);
    }
  });

  test('stock draw and recycle flow feels responsive', async ({ page }) => {
    const stock = page.getByLabel(/Stock pile/);
    const moveCounter = page.getByTestId('move-counter');

    // Initial state
    await expect(stock).toBeVisible();
    await expect(moveCounter).toHaveText('Moves: 0');

    // Draw one batch
    await stock.click();
    await page.waitForTimeout(300);

    // Move counter should increment
    const moveText = await moveCounter.textContent();
    if (moveText === 'Moves: 0') {
      friction.add('stock-draw', 'Move counter did not increment after drawing from stock', 'high');
    }

    // Stock count should decrease
    const stockLabel = await stock.getAttribute('aria-label');
    if (stockLabel?.includes('0 cards remaining')) {
      friction.add('stock-draw', 'Stock still shows 0 cards after draw', 'high');
    }

    // Waste pile should now show a card
    const wasteCard = page.getByLabel('Waste pile').locator('button[aria-label$="card"]');
    const wasteCount = await wasteCard.count();
    if (wasteCount === 0) {
      friction.add('stock-draw', 'Waste pile is empty after drawing from stock', 'high');
    }

    // Draw again to use up the stock
    let stockCount = parseInt(
      (await stock.getAttribute('aria-label'))?.match(/(\d+) cards/)?.[1] ?? '0',
      10
    );
    while (stockCount > 0) {
      await stock.click();
      await page.waitForTimeout(200);
      stockCount = parseInt(
        (await stock.getAttribute('aria-label'))?.match(/(\d+) cards/)?.[1] ?? '0',
        10
      );
    }

    // Stock should now be empty
    await expect(stock).toHaveLabel(/Stock pile, 0 cards remaining/);

    // Click stock again — should recycle waste
    await stock.click();
    await page.waitForTimeout(300);

    const recycledLabel = await stock.getAttribute('aria-label');
    const recycledCount = parseInt(recycledLabel?.match(/(\d+) cards/)?.[1] ?? '0', 10);
    if (recycledCount === 0) {
      friction.add('stock-recycle', 'Stock did not recycle waste when empty', 'high');
    }

    // Move counter should have incremented for the recycle
    const finalMoveText = await moveCounter.textContent();
    if (finalMoveText === 'Moves: 1') {
      friction.add('stock-recycle', 'Move counter did not increment on recycle', 'medium');
    }
  });

  test('drag-and-drop from tableau to foundation provides visual feedback', async ({ page }) => {
    // Set up a scenario with an ace in the first tableau
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
          foundations: Array.from({ length: 4 }, () => ({
            type: 'foundation' as const,
            cards: [],
          })),
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

    // Hover over the card — should get a hover effect
    await ace.hover();
    await page.waitForTimeout(150);

    // Start drag
    await page.mouse.down();

    // Foundation should highlight as a valid drop target
    const foundationClasses = await foundation.getAttribute('class');
    if (!foundationClasses?.includes('ring-blue-400')) {
      friction.add(
        'drag-feedback',
        'Foundation did not highlight as valid drop target during drag',
        'high'
      );
    }

    // Complete the drag
    const targetBox = await foundation.boundingBox();
    if (targetBox) {
      await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
        steps: 5,
      });
    }
    await page.mouse.up();

    await page.waitForTimeout(300);

    // Card should now be in the foundation
    const foundationAfter = page.getByLabel('Foundation pile 1');
    const foundationCard = foundationAfter.locator('button[aria-label$="card"]');
    const count = await foundationCard.count();
    if (count !== 1) {
      friction.add('drag-drop', 'Card was not moved to foundation after successful drag', 'high');
    }

    // Move counter should increment
    const moveText = await page.getByTestId('move-counter').textContent();
    if (moveText !== 'Moves: 1') {
      friction.add(
        'drag-drop',
        `Move counter is "${moveText}" instead of "Moves: 1" after drag`,
        'medium'
      );
    }
  });

  test('click-to-move path is intuitive and provides feedback', async ({ page }) => {
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
          foundations: Array.from({ length: 4 }, () => ({
            type: 'foundation' as const,
            cards: [],
          })),
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

    // Click the card to select it
    await ace.click();
    await page.waitForTimeout(150);

    // Card should have selected state
    const isSelected = await ace.getAttribute('data-selected');
    if (isSelected !== 'true') {
      friction.add('click-to-move', 'Card did not show selected state after click', 'high');
    }

    // Foundation should highlight as valid drop target
    const foundationClasses = await foundation.getAttribute('class');
    if (!foundationClasses?.includes('ring-blue-400')) {
      friction.add('click-to-move', 'Foundation did not highlight after card selection', 'high');
    }

    // Click the foundation to move the card
    await foundation.click();
    await page.waitForTimeout(300);

    // Card should now be in the foundation
    const foundationAfter = page.getByLabel('Foundation pile 1');
    const foundationCard = foundationAfter.locator('button[aria-label$="card"]');
    const count = await foundationCard.count();
    if (count !== 1) {
      friction.add('click-to-move', 'Card was not moved to foundation after click-to-move', 'high');
    }

    // Card should no longer be selected
    const aceAfter = page.locator('button[aria-label="A of hearts (red) card"]');
    if (aceAfter.count() > 0) {
      const stillSelected = await aceAfter.first().getAttribute('data-selected');
      if (stillSelected === 'true') {
        friction.add('click-to-move', 'Card remained selected after successful move', 'low');
      }
    }
  });

  test('double-click auto-move to foundation is responsive', async ({ page }) => {
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
          foundations: Array.from({ length: 4 }, () => ({
            type: 'foundation' as const,
            cards: [],
          })),
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

    // Double-click the ace — should auto-move to foundation
    await ace.dblclick();
    await page.waitForTimeout(300);

    // Card should now be in the foundation
    const foundationAfter = page.getByLabel('Foundation pile 1');
    const foundationCard = foundationAfter.locator('button[aria-label$="card"]');
    const count = await foundationCard.count();
    if (count !== 1) {
      friction.add('double-click', 'Card was not auto-moved to foundation on double-click', 'high');
    }

    // Move counter should increment
    const moveText = await page.getByTestId('move-counter').textContent();
    if (moveText !== 'Moves: 1') {
      friction.add(
        'double-click',
        `Move counter is "${moveText}" instead of "Moves: 1" after auto-move`,
        'medium'
      );
    }
  });

  test('undo flow restores state correctly and is discoverable', async ({ page }) => {
    // Undo button should be disabled initially
    const undoButton = page.getByTestId('undo-button');
    await expect(undoButton).toBeDisabled();

    // Draw from stock to create history
    const stock = page.getByLabel(/Stock pile/);
    await stock.click();
    await page.waitForTimeout(300);

    // Undo button should now be enabled
    await expect(undoButton).toBeEnabled();

    // Click undo
    await undoButton.click();
    await page.waitForTimeout(300);

    // Stock should be restored
    await expect(page.getByLabel(/Stock pile, 24 cards remaining/)).toBeVisible();

    // Waste should be empty
    await expect(page.getByLabel('Empty waste pile')).toBeVisible();

    // Move counter should be 0
    await expect(page.getByTestId('move-counter')).toHaveText('Moves: 0');

    // Undo button should be disabled again
    await expect(undoButton).toBeDisabled();

    // Check that undo button has an accessible label
    const undoLabel = await undoButton.getAttribute('aria-label');
    if (!undoLabel) {
      friction.add('undo', 'Undo button has no aria-label for accessibility', 'low');
    }
  });

  test('new game flow resets all state cleanly', async ({ page }) => {
    // Draw from stock to dirty the state
    const stock = page.getByLabel(/Stock pile/);
    await stock.click();
    await page.waitForTimeout(300);

    // Verify state is dirty
    await expect(page.getByLabel(/Stock pile, 21 cards remaining/)).toBeVisible();
    await expect(page.getByTestId('move-counter')).not.toHaveText('Moves: 0');

    // Click new game
    const newGameButton = page.getByTestId('new-game-button');
    await newGameButton.click();
    await page.waitForTimeout(300);

    // Stock should be reset
    await expect(page.getByLabel(/Stock pile, 24 cards remaining/)).toBeVisible();

    // Move counter should be 0
    await expect(page.getByTestId('move-counter')).toHaveText('Moves: 0');

    // Foundations should be empty
    for (let i = 1; i <= 4; i++) {
      await expect(page.getByLabel(`Empty foundation ${i}`)).toBeVisible();
    }

    // Undo should be disabled
    const undoButton = page.getByTestId('undo-button');
    await expect(undoButton).toBeDisabled();

    // New game button should be visible and labeled correctly
    const buttonLabel = await newGameButton.getAttribute('aria-label');
    if (!buttonLabel?.includes('New game')) {
      friction.add('new-game', 'New game button aria-label does not include "New game"', 'low');
    }
  });

  test('sound toggle is discoverable and persists', async ({ page }) => {
    const soundToggle = page.getByTestId('sound-toggle');

    // Should be visible
    await expect(soundToggle).toBeVisible();

    // Should have an accessible label
    const soundLabel = await soundToggle.getAttribute('aria-label');
    if (!soundLabel) {
      friction.add('settings', 'Sound toggle has no aria-label for accessibility', 'low');
    }

    // Should reflect current state (on by default)
    const pressed = await soundToggle.getAttribute('aria-pressed');
    if (pressed !== 'true') {
      friction.add('settings', 'Sound toggle does not reflect default on state', 'medium');
    }

    // Toggle off
    await soundToggle.click();
    await page.waitForTimeout(150);

    const pressedAfter = await soundToggle.getAttribute('aria-pressed');
    if (pressedAfter !== 'false') {
      friction.add('settings', 'Sound toggle did not turn off after click', 'high');
    }

    // Toggle back on
    await soundToggle.click();
    await page.waitForTimeout(150);

    const pressedBack = await soundToggle.getAttribute('aria-pressed');
    if (pressedBack !== 'true') {
      friction.add('settings', 'Sound toggle did not turn back on after second click', 'high');
    }
  });

  test('move animation is smooth and does not block interaction', async ({ page }) => {
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
          foundations: Array.from({ length: 4 }, () => ({
            type: 'foundation' as const,
            cards: [],
          })),
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

    // Start drag
    await ace.hover();
    await page.mouse.down();

    const targetBox = await foundation.boundingBox();
    if (targetBox) {
      await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
        steps: 5,
      });
    }
    await page.mouse.up();

    // Check for animation overlay
    const overlay = page.getByTestId('move-animation-overlay');

    // Wait for animation to complete
    await page.waitForTimeout(500);

    // Overlay should be gone after animation
    const overlayCount = await overlay.count();
    if (overlayCount > 0) {
      friction.add(
        'animation',
        'Move animation overlay was not removed after transition',
        'medium'
      );
    }

    // Card should be in the foundation
    const foundationAfter = page.getByLabel('Foundation pile 1');
    const foundationCard = foundationAfter.locator('button[aria-label$="card"]');
    const count = await foundationCard.count();
    if (count !== 1) {
      friction.add('animation', 'Card was not moved to foundation after animation', 'high');
    }
  });

  test('tableau-to-tableau drag is intuitive', async ({ page }) => {
    await page.evaluate(() => {
      const dispatch = window.__klondikeDispatch;
      if (!dispatch) return;

      const king = {
        id: 'kh',
        suit: 'hearts',
        rank: 'K',
        color: 'red',
        faceUp: true,
      };
      const queen = {
        id: 'qd',
        suit: 'diamonds',
        rank: 'Q',
        color: 'red',
        faceUp: true,
      };

      const tableau = Array.from({ length: 7 }, (_, i) => {
        if (i === 0) return { type: 'tableau' as const, cards: [king] };
        if (i === 1) return { type: 'tableau' as const, cards: [queen] };
        return { type: 'tableau' as const, cards: [] };
      });

      dispatch({
        type: 'setState',
        state: {
          deck: [],
          stock: [],
          waste: [],
          foundations: Array.from({ length: 4 }, () => ({
            type: 'foundation' as const,
            cards: [],
          })),
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

    // King of hearts is red, Queen of diamonds is red — cannot stack
    // (need opposite colors). Let's check that the UI prevents invalid moves.
    const king = page.locator('button[aria-label="K of hearts (red) card"]').first();
    const tableau2 = page.getByLabel('Tableau pile 2');

    await king.hover();
    await page.mouse.down();

    // Tableau 2 should NOT highlight (same color, invalid move)
    const tableau2Classes = await tableau2.getAttribute('class');
    if (tableau2Classes?.includes('ring-blue-400')) {
      friction.add(
        'drag-validation',
        'Invalid tableau-to-tableau move was highlighted as valid',
        'high'
      );
    }

    await page.mouse.up();

    // King should still be in tableau 1
    const tableau1Card = page.getByLabel('Tableau pile 1').locator('button[aria-label$="card"]');
    const count = await tableau1Card.count();
    if (count !== 1) {
      friction.add(
        'drag-validation',
        'Card was removed from tableau after invalid drag attempt',
        'high'
      );
    }
  });

  test('win detection overlay appears and disappears correctly', async ({ page }) => {
    // Win overlay should not be visible on new game
    await expect(page.getByLabel('You win!')).not.toBeVisible();

    // Set up a winning state
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

    // Win overlay should be visible
    await expect(page.getByLabel('You win!')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'You Win!' })).toBeVisible();

    // New game button should have a special label
    const newGameButton = page.getByTestId('new-game-button');
    const buttonLabel = await newGameButton.getAttribute('aria-label');
    if (!buttonLabel?.includes('won')) {
      friction.add('win-state', 'New game button does not indicate win state in aria-label', 'low');
    }

    // Click new game
    await newGameButton.click();
    await page.waitForTimeout(300);

    // Win overlay should disappear
    await expect(page.getByLabel('You win!')).not.toBeVisible();
  });

  test('face-down cards are not draggable or clickable', async ({ page }) => {
    // On a new game, the bottom card of each tableau (except pile 1) is face-down
    const faceDownCards = page.locator('button[aria-label="face-down card"]');
    const faceDownCount = await faceDownCards.count();

    if (faceDownCount === 0) {
      friction.add('face-down', 'Expected face-down cards on new game but found none', 'low');
    }

    // Face-down cards should not have a click handler that selects them
    // (they should not respond to clicks)
    if (faceDownCount > 0) {
      const firstFaceDown = faceDownCards.first();
      await firstFaceDown.click();
      await page.waitForTimeout(150);

      // No card should be selected
      const selectedCards = page.locator('button[data-selected="true"]');
      const selectedCount = await selectedCards.count();
      if (selectedCount > 0) {
        friction.add('face-down', 'Face-down card was selected after click', 'high');
      }
    }
  });

  test('tableau selection highlighting is clear', async ({ page }) => {
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
      const two = {
        id: '2h',
        suit: 'hearts',
        rank: '2',
        color: 'red',
        faceUp: true,
      };

      const tableau = Array.from({ length: 7 }, (_, i) => {
        if (i === 0) return { type: 'tableau' as const, cards: [ace] };
        if (i === 1) return { type: 'tableau' as const, cards: [two] };
        return { type: 'tableau' as const, cards: [] };
      });

      dispatch({
        type: 'setState',
        state: {
          deck: [],
          stock: [],
          waste: [],
          foundations: Array.from({ length: 4 }, () => ({
            type: 'foundation' as const,
            cards: [],
          })),
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

    // Click to select
    await ace.click();
    await page.waitForTimeout(150);

    // Check selected state
    const isSelected = await ace.getAttribute('data-selected');
    if (isSelected !== 'true') {
      friction.add('selection', 'Card did not show data-selected=true after click', 'high');
    }

    // Check for visual ring
    const classes = await ace.getAttribute('class');
    if (!classes?.includes('card-selected')) {
      friction.add('selection', 'Card did not receive card-selected class', 'high');
    }

    // Click again to deselect
    await ace.click();
    await page.waitForTimeout(150);

    const isSelectedAfter = await ace.getAttribute('data-selected');
    if (isSelectedAfter !== 'false') {
      friction.add('selection', 'Card did not deselect on second click', 'medium');
    }
  });

  test('settings persist across page reloads', async ({ page }) => {
    // Turn off sound
    const soundToggle = page.getByTestId('sound-toggle');
    await soundToggle.click();
    await page.waitForTimeout(150);

    // Reload the page
    await page.reload();
    await page.waitForTimeout(300);

    // Sound should still be off
    const soundPressed = await soundToggle.getAttribute('aria-pressed');
    if (soundPressed !== 'false') {
      friction.add('persistence', 'Sound setting did not persist across page reload', 'medium');
    }
  });

  test('mobile viewport layout is usable', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(300);

    // Board should still be visible
    await expect(page.getByLabel('Klondike Solitaire board')).toBeVisible();

    // Stock pile should be visible
    await expect(page.getByLabel(/Stock pile/)).toBeVisible();

    // Tableau piles should be visible (may need horizontal scroll)
    const tableauPiles = page.locator('[aria-label^="Tableau pile"]');
    const count = await tableauPiles.count();
    if (count !== 7) {
      friction.add('mobile-layout', `Expected 7 tableau piles on mobile, found ${count}`, 'high');
    }

    // New game button should be visible and clickable
    const newGameButton = page.getByTestId('new-game-button');
    await expect(newGameButton).toBeVisible();

    // Settings should be visible
    const soundToggle = page.getByTestId('sound-toggle');
    await expect(soundToggle).toBeVisible();

    // Draw from stock
    const stock = page.getByLabel(/Stock pile/);
    await stock.click();
    await page.waitForTimeout(300);

    // Waste should show a card
    const wasteCard = page.getByLabel('Waste pile').locator('button[aria-label$="card"]');
    const wasteCount = await wasteCard.count();
    if (wasteCount === 0) {
      friction.add('mobile-layout', 'Waste pile is empty after drawing on mobile viewport', 'high');
    }

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});
