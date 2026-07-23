/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameBoard } from './GameBoard';
import type { GameState, Card, Pile } from '../types';
import { dealGame } from '../game/game';

const makeGameState = (overrides: Partial<GameState>): GameState => ({
  ...dealGame(3),
  ...overrides,
});

const makeCard = (overrides: Partial<Card>): Card => ({
  id: 'test-card',
  suit: 'hearts',
  rank: 'A',
  color: 'red',
  faceUp: true,
  ...overrides,
});

const makePile = (cards: Card[]): Pile => ({ type: 'tableau', cards });

describe('GameBoard', () => {
  it('renders the board with aria-label', () => {
    render(<GameBoard state={makeGameState({})} />);
    expect(screen.getByLabelText('Klondike Solitaire board')).toBeTruthy();
  });

  it('renders a stock pile section', () => {
    render(<GameBoard state={makeGameState({ stock: [], waste: [] })} />);
    expect(screen.getByLabelText(/Stock pile/)).toBeTruthy();
  });

  it('renders a waste pile section', () => {
    render(<GameBoard state={makeGameState({ stock: [], waste: [] })} />);
    expect(screen.getByLabelText('Empty waste pile')).toBeTruthy();
  });

  it('renders four foundation sections', () => {
    render(<GameBoard state={makeGameState({})} />);
    expect(screen.getByLabelText('Empty foundation 1')).toBeTruthy();
    expect(screen.getByLabelText('Empty foundation 2')).toBeTruthy();
    expect(screen.getByLabelText('Empty foundation 3')).toBeTruthy();
    expect(screen.getByLabelText('Empty foundation 4')).toBeTruthy();
  });

  it('renders seven tableau pile sections', () => {
    render(<GameBoard state={makeGameState({})} />);
    expect(screen.getByLabelText('Tableau pile 1')).toBeTruthy();
    expect(screen.getByLabelText('Tableau pile 7')).toBeTruthy();
  });

  it('uses a flexbox column layout for the board', () => {
    const { container } = render(<GameBoard state={makeGameState({})} />);
    const board = container.querySelector('.game-board');
    expect(board).toBeTruthy();
    expect(board?.className).toContain('flex-col');
    expect(board?.className).toContain('w-full');
  });
});

describe('GameBoard click-to-move', () => {
  it('highlights valid drop targets when a card is selected', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
    const state = makeGameState({
      tableau: [
        makePile([ace]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
      ],
      foundations: [
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
      ],
      waste: [],
      stock: [],
      selectedCardId: 'ah',
    });

    const { container } = render(<GameBoard state={state} />);

    const foundationPiles = container.querySelectorAll('.foundation-pile');
    expect(foundationPiles.length).toBe(4);
    for (const pile of foundationPiles) {
      expect(pile.className).toContain('ring-blue-400');
    }
  });

  it('does not highlight drop targets when no card is selected', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
    const state = makeGameState({
      tableau: [
        makePile([ace]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
      ],
      foundations: [
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
      ],
      waste: [],
      stock: [],
      selectedCardId: null,
    });

    const { container } = render(<GameBoard state={state} />);

    const foundationPiles = container.querySelectorAll('.foundation-pile');
    for (const pile of foundationPiles) {
      expect(pile.className).not.toContain('ring-blue-400');
    }
  });

  it('calls move when a valid drop target is clicked after selecting a card', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
    const state = makeGameState({
      tableau: [
        makePile([ace]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
      ],
      foundations: [
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
      ],
      waste: [],
      stock: [],
      selectedCardId: 'ah',
    });

    const move = vi.fn();
    render(<GameBoard state={state} move={move} />);

    const emptyFoundation = screen.getByLabelText('Empty foundation 1');
    fireEvent.click(emptyFoundation);

    expect(move).toHaveBeenCalledWith({
      type: 'tableau-to-foundation',
      fromPile: 'tableau',
      toPile: 'foundation',
      toIndex: 0,
      cardId: 'ah',
    });
  });

  it('does not call move when an invalid drop target is clicked', () => {
    const king = makeCard({ id: 'kh', suit: 'hearts', rank: 'K', color: 'red', faceUp: true });
    const state = makeGameState({
      tableau: [
        makePile([king]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
      ],
      foundations: [
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
      ],
      waste: [],
      stock: [],
      selectedCardId: 'kh',
    });

    const move = vi.fn();
    render(<GameBoard state={state} move={move} />);

    const emptyFoundation = screen.getByLabelText('Empty foundation 1');
    fireEvent.click(emptyFoundation);

    expect(move).not.toHaveBeenCalled();
  });

  it('selects a card when clicked', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
    const state = makeGameState({
      tableau: [
        makePile([ace]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
      ],
      foundations: [
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
      ],
      waste: [],
      stock: [],
      selectedCardId: null,
    });

    const selectCard = vi.fn();
    render(<GameBoard state={state} selectCard={selectCard} />);

    const cardButton = screen.getByLabelText('A of hearts (red) card');
    fireEvent.click(cardButton);

    expect(selectCard).toHaveBeenCalledWith('ah');
  });

  it('deselects a card when the same card is clicked again', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
    const state = makeGameState({
      tableau: [
        makePile([ace]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
      ],
      foundations: [
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
      ],
      waste: [],
      stock: [],
      selectedCardId: 'ah',
    });

    const selectCard = vi.fn();
    render(<GameBoard state={state} selectCard={selectCard} />);

    const cardButton = screen.getByLabelText('A of hearts (red) card');
    fireEvent.click(cardButton);

    expect(selectCard).toHaveBeenCalledWith(null);
  });
});

describe('GameBoard stock click to draw', () => {
  it('calls draw when the stock pile is clicked', () => {
    const state = makeGameState({ stock: [makeCard({ id: 'c1' })], waste: [] });
    const draw = vi.fn();
    render(<GameBoard state={state} draw={draw} />);

    const stockPile = screen.getByLabelText('Stock pile, 1 cards remaining');
    fireEvent.click(stockPile);

    expect(draw).toHaveBeenCalledTimes(1);
  });

  it('does not call draw when both stock and waste are empty', () => {
    const state = makeGameState({ stock: [], waste: [] });
    const draw = vi.fn();
    render(<GameBoard state={state} draw={draw} />);

    const stockPile = screen.getByLabelText('Stock pile, 0 cards remaining');
    fireEvent.click(stockPile);

    expect(draw).not.toHaveBeenCalled();
  });

  it('calls draw when stock is empty but waste has cards (recycling)', () => {
    const state = makeGameState({
      stock: [],
      waste: [makeCard({ id: 'w1', faceUp: true })],
    });
    const draw = vi.fn();
    render(<GameBoard state={state} draw={draw} />);

    const stockPile = screen.getByLabelText('Stock pile, 0 cards remaining');
    fireEvent.click(stockPile);

    expect(draw).toHaveBeenCalledTimes(1);
  });
});

describe('GameBoard double-click auto-move', () => {
  it('calls autoMove when a card that can move to foundation is double-clicked', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
    const state = makeGameState({
      tableau: [
        makePile([ace]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
      ],
      foundations: [
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
      ],
      waste: [],
      stock: [],
      selectedCardId: null,
    });

    const autoMove = vi.fn();
    render(<GameBoard state={state} autoMove={autoMove} />);

    const cardButton = screen.getByLabelText('A of hearts (red) card');
    fireEvent.doubleClick(cardButton);

    expect(autoMove).toHaveBeenCalledWith(ace);
  });

  it('does not call autoMove when a card that cannot move to foundation is double-clicked', () => {
    const two = makeCard({ id: '2h', suit: 'hearts', rank: '2', color: 'red', faceUp: true });
    const state = makeGameState({
      tableau: [
        makePile([two]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
      ],
      foundations: [
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
      ],
      waste: [],
      stock: [],
      selectedCardId: null,
    });

    const autoMove = vi.fn();
    render(<GameBoard state={state} autoMove={autoMove} />);

    const cardButton = screen.getByLabelText('2 of hearts (red) card');
    fireEvent.doubleClick(cardButton);

    expect(autoMove).not.toHaveBeenCalled();
  });

  it('calls autoMove when a waste card that can move to foundation is double-clicked', () => {
    const ace = makeCard({ id: 'wh', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
    const state = makeGameState({
      tableau: [
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
      ],
      foundations: [
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
      ],
      waste: [ace],
      stock: [],
      selectedCardId: null,
    });

    const autoMove = vi.fn();
    render(<GameBoard state={state} autoMove={autoMove} />);

    const cardButton = screen.getByLabelText('A of hearts (red) card');
    fireEvent.doubleClick(cardButton);

    expect(autoMove).toHaveBeenCalledWith(ace);
  });
});

describe('GameBoard move animation', () => {
  it('renders a move animation overlay when a card is moved to foundation', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
    const state = makeGameState({
      tableau: [
        makePile([ace]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
      ],
      foundations: [
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
      ],
      waste: [],
      stock: [],
      selectedCardId: 'ah',
    });

    render(<GameBoard state={state} />);

    const emptyFoundation = screen.getByLabelText('Empty foundation 1');
    fireEvent.click(emptyFoundation);

    expect(screen.getByTestId('move-animation-overlay')).toBeTruthy();
  });

  it('removes the move animation overlay when transition ends', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
    const state = makeGameState({
      tableau: [
        makePile([ace]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
      ],
      foundations: [
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
      ],
      waste: [],
      stock: [],
      selectedCardId: 'ah',
    });

    render(<GameBoard state={state} />);

    const emptyFoundation = screen.getByLabelText('Empty foundation 1');
    fireEvent.click(emptyFoundation);

    expect(screen.getByTestId('move-animation-overlay')).toBeTruthy();

    fireEvent.transitionEnd(screen.getByTestId('move-animation-overlay'), {
      propertyName: 'transform',
    });

    expect(screen.queryByTestId('move-animation-overlay')).toBeNull();
  });

  it('does not render a move animation overlay when move is invalid', () => {
    const king = makeCard({ id: 'kh', suit: 'hearts', rank: 'K', color: 'red', faceUp: true });
    const state = makeGameState({
      tableau: [
        makePile([king]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
      ],
      foundations: [
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
      ],
      waste: [],
      stock: [],
      selectedCardId: 'kh',
    });

    render(<GameBoard state={state} />);

    const emptyFoundation = screen.getByLabelText('Empty foundation 1');
    fireEvent.click(emptyFoundation);

    expect(screen.queryByTestId('move-animation-overlay')).toBeNull();
  });

  it('renders a move animation overlay when autoMove is called', () => {
    const ace = makeCard({ id: 'ah', suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
    const state = makeGameState({
      tableau: [
        makePile([ace]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
        makePile([]),
      ],
      foundations: [
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
        { type: 'foundation', cards: [] },
      ],
      waste: [],
      stock: [],
      selectedCardId: null,
    });

    render(<GameBoard state={state} />);

    const cardButton = screen.getByLabelText('A of hearts (red) card');
    fireEvent.doubleClick(cardButton);

    expect(screen.getByTestId('move-animation-overlay')).toBeTruthy();
  });
});
