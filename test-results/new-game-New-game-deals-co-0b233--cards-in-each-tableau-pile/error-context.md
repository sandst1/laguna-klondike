# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: new-game.spec.ts >> New game deals correctly >> deals the correct number of cards in each tableau pile
- Location: e2e/new-game.spec.ts:24:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByLabel('Tableau pile 2').locator('button[aria-label$="card"]')
Expected: 2
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for getByLabel('Tableau pile 2').locator('button[aria-label$="card"]')
    14 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - heading "Klondike Solitaire" [level=1] [ref=e5]
    - region "Draw mode toggle" [ref=e6]:
      - generic [ref=e7]: "Draw:"
      - button "Draw 1" [ref=e8]: "1"
      - button "Draw 3" [pressed] [ref=e9]: "3"
  - main [ref=e10]:
    - region "Klondike Solitaire board" [ref=e11]:
      - generic "Stock pile, 24 cards remaining" [ref=e13] [cursor=pointer]:
        - generic [ref=e14]: "24"
      - generic "Waste pile" [ref=e16]:
        - generic "Empty waste pile" [ref=e17] [cursor=pointer]
      - generic [ref=e18]:
        - generic "Foundation pile 1" [ref=e20]:
          - generic "Empty foundation 1" [ref=e21] [cursor=pointer]
        - generic "Foundation pile 2" [ref=e23]:
          - generic "Empty foundation 2" [ref=e24] [cursor=pointer]
        - generic "Foundation pile 3" [ref=e26]:
          - generic "Empty foundation 3" [ref=e27] [cursor=pointer]
        - generic "Foundation pile 4" [ref=e29]:
          - generic "Empty foundation 4" [ref=e30] [cursor=pointer]
      - generic [ref=e31]:
        - generic "Tableau pile 1" [ref=e33]:
          - button "K of hearts (red) card" [ref=e34] [cursor=pointer]:
            - generic [ref=e39]:
              - generic [ref=e40]: K
              - generic [ref=e41]: ♥
              - generic [ref=e42]: K
        - generic "Tableau pile 2" [ref=e44]:
          - generic "1 face-down card" [ref=e45]
          - button "Q of clubs (black) card" [ref=e46] [cursor=pointer]:
            - generic [ref=e47]:
              - img [ref=e52]
              - generic [ref=e63]:
                - generic [ref=e64]: Q
                - generic [ref=e65]: ♣
                - generic [ref=e66]: Q
        - generic "Tableau pile 3" [ref=e68]:
          - generic "2 face-down cards" [ref=e69]:
            - generic [ref=e70]: "2"
          - button "2 of spades (black) card" [ref=e71] [cursor=pointer]:
            - generic [ref=e72]:
              - img [ref=e77]
              - generic [ref=e88]:
                - generic [ref=e89]: "2"
                - generic [ref=e90]: ♠
                - generic [ref=e91]: "2"
        - generic "Tableau pile 4" [ref=e93]:
          - generic "3 face-down cards" [ref=e94]:
            - generic [ref=e95]: "3"
          - button "J of hearts (red) card" [ref=e96] [cursor=pointer]:
            - generic [ref=e97]:
              - img [ref=e102]
              - generic [ref=e113]:
                - generic [ref=e114]: J
                - generic [ref=e115]: ♥
                - generic [ref=e116]: J
        - generic "Tableau pile 5" [ref=e118]:
          - generic "4 face-down cards" [ref=e119]:
            - generic [ref=e120]: "4"
          - button "2 of clubs (black) card" [ref=e121] [cursor=pointer]:
            - generic [ref=e122]:
              - img [ref=e127]
              - generic [ref=e138]:
                - generic [ref=e139]: "2"
                - generic [ref=e140]: ♣
                - generic [ref=e141]: "2"
        - generic "Tableau pile 6" [ref=e143]:
          - generic "5 face-down cards" [ref=e144]:
            - generic [ref=e145]: "5"
          - button "6 of diamonds (red) card" [ref=e146] [cursor=pointer]:
            - generic [ref=e147]:
              - img [ref=e152]
              - generic [ref=e163]:
                - generic [ref=e164]: "6"
                - generic [ref=e165]: ♦
                - generic [ref=e166]: "6"
        - generic "Tableau pile 7" [ref=e168]:
          - generic "6 face-down cards" [ref=e169]:
            - generic [ref=e170]: "6"
          - button "5 of hearts (red) card" [ref=e171] [cursor=pointer]:
            - generic [ref=e172]:
              - img [ref=e177]
              - generic [ref=e188]:
                - generic [ref=e189]: "5"
                - generic [ref=e190]: ♥
                - generic [ref=e191]: "5"
    - status [ref=e192]
    - region "Game controls" [ref=e193]:
      - button "New game" [ref=e194]: New Game
      - generic [ref=e195]:
        - 'generic "Moves: 0" [ref=e196]'
        - button "Undo (last move), no moves to undo" [disabled] [ref=e197]: Undo
    - generic [ref=e198]:
      - region "Settings" [ref=e199]:
        - generic [ref=e200]:
          - generic [ref=e201]: "Sound:"
          - button "Sound on" [pressed] [ref=e202]: "On"
        - generic [ref=e203]:
          - generic [ref=e204]: "High Contrast:"
          - button "High contrast off" [ref=e205]: "Off"
      - region "Game statistics" [ref=e206]:
        - generic [ref=e207]:
          - generic [ref=e208]: "Played:"
          - 'generic "Games played: 0" [ref=e209]': "0"
        - generic [ref=e210]:
          - generic [ref=e211]: "Won:"
          - 'generic "Games won: 0" [ref=e212]': "0"
        - generic [ref=e213]:
          - generic [ref=e214]: "Win rate:"
          - 'generic "Win rate: 0.0%" [ref=e215]': 0.0%
        - generic [ref=e216]:
          - generic [ref=e217]: "Best time:"
          - 'generic "Best time: —" [ref=e218]': —
        - button "Reset statistics" [ref=e219]: Reset
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('New game deals correctly', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.goto('/');
  6   |   });
  7   | 
  8   |   test('renders the game board with correct structure', async ({ page }) => {
  9   |     await expect(page.getByLabel('Klondike Solitaire board')).toBeVisible();
  10  | 
  11  |     await expect(page.getByLabel('Stock pile, 24 cards remaining')).toBeVisible();
  12  | 
  13  |     await expect(page.getByLabel('Empty waste pile')).toBeVisible();
  14  | 
  15  |     for (let i = 1; i <= 4; i++) {
  16  |       await expect(page.getByLabel(`Empty foundation ${i}`)).toBeVisible();
  17  |     }
  18  | 
  19  |     for (let i = 1; i <= 7; i++) {
  20  |       await expect(page.getByLabel(`Tableau pile ${i}`)).toBeVisible();
  21  |     }
  22  |   });
  23  | 
  24  |   test('deals the correct number of cards in each tableau pile', async ({ page }) => {
  25  |     const tableauSizes = [1, 2, 3, 4, 5, 6, 7];
  26  | 
  27  |     for (let i = 0; i < tableauSizes.length; i++) {
  28  |       const tableauLabel = `Tableau pile ${i + 1}`;
  29  |       const size = tableauSizes[i];
  30  | 
  31  |       const tableau = page.getByLabel(tableauLabel);
  32  |       const faceUpCards = tableau.locator('button[aria-label$="card"]');
> 33  |       await expect(faceUpCards).toHaveCount(size);
      |                                 ^ Error: expect(locator).toHaveCount(expected) failed
  34  |     }
  35  |   });
  36  | 
  37  |   test('only the top card of each tableau pile is face-up', async ({ page }) => {
  38  |     const tableauSizes = [1, 2, 3, 4, 5, 6, 7];
  39  | 
  40  |     for (let i = 0; i < tableauSizes.length; i++) {
  41  |       const tableauLabel = `Tableau pile ${i + 1}`;
  42  |       const size = tableauSizes[i];
  43  | 
  44  |       const tableau = page.getByLabel(tableauLabel);
  45  |       const faceUpCards = tableau.locator('button[aria-label$="card"]');
  46  |       await expect(faceUpCards).toHaveCount(size);
  47  | 
  48  |       const faceDownCards = tableau.locator('button[aria-label="face-down card"]');
  49  |       await expect(faceDownCards).toHaveCount(size - 1);
  50  |     }
  51  |   });
  52  | 
  53  |   test('deals 24 cards to the stock pile', async ({ page }) => {
  54  |     await expect(page.getByLabel('Stock pile, 24 cards remaining')).toBeVisible();
  55  |   });
  56  | 
  57  |   test('all stock cards are face-down', async ({ page }) => {
  58  |     const stock = page.getByLabel('Stock pile, 24 cards remaining');
  59  |     const faceDownIndicator = stock.locator('span[aria-label]');
  60  |     await expect(faceDownIndicator).toHaveCount(0);
  61  |   });
  62  | 
  63  |   test('all foundations start empty', async ({ page }) => {
  64  |     for (let i = 1; i <= 4; i++) {
  65  |       await expect(page.getByLabel(`Empty foundation ${i}`)).toBeVisible();
  66  |     }
  67  |   });
  68  | 
  69  |   test('waste pile starts empty', async ({ page }) => {
  70  |     await expect(page.getByLabel('Empty waste pile')).toBeVisible();
  71  |   });
  72  | 
  73  |   test('move counter starts at 0', async ({ page }) => {
  74  |     await expect(page.getByTestId('move-counter')).toHaveText('Moves: 0');
  75  |   });
  76  | 
  77  |   test('new game button is visible', async ({ page }) => {
  78  |     await expect(page.getByTestId('new-game-button')).toBeVisible();
  79  |     await expect(page.getByTestId('new-game-button')).toHaveText('New Game');
  80  |   });
  81  | 
  82  |   test('new game button deals a fresh game', async ({ page }) => {
  83  |     await page.getByTestId('new-game-button').click();
  84  | 
  85  |     await expect(page.getByLabel('Stock pile, 24 cards remaining')).toBeVisible();
  86  | 
  87  |     await expect(page.getByTestId('move-counter')).toHaveText('Moves: 0');
  88  | 
  89  |     for (let i = 1; i <= 4; i++) {
  90  |       await expect(page.getByLabel(`Empty foundation ${i}`)).toBeVisible();
  91  |     }
  92  |   });
  93  | 
  94  |   test('total cards across tableau and stock equals 52', async ({ page }) => {
  95  |     const tableauSizes = [1, 2, 3, 4, 5, 6, 7];
  96  |     let totalTableauCards = 0;
  97  | 
  98  |     for (let i = 0; i < tableauSizes.length; i++) {
  99  |       const tableauLabel = `Tableau pile ${i + 1}`;
  100 |       const tableau = page.getByLabel(tableauLabel);
  101 |       const faceUpCards = tableau.locator('button[aria-label$="card"]');
  102 |       const count = await faceUpCards.count();
  103 |       totalTableauCards += count;
  104 |     }
  105 | 
  106 |     expect(totalTableauCards).toBe(28);
  107 | 
  108 |     await expect(page.getByLabel('Stock pile, 24 cards remaining')).toBeVisible();
  109 | 
  110 |     expect(totalTableauCards + 24).toBe(52);
  111 |   });
  112 | });
  113 | 
```