/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StockPile } from './StockPile';
import type { Card as CardData, Pile } from '../types';
import type { DropTarget } from '../game/rules';

const makeCard = (overrides: Partial<CardData>): CardData => ({
  id: 'test-card',
  suit: 'hearts',
  rank: 'A',
  color: 'red',
  faceUp: true,
  ...overrides,
});

const emptyStock = (): Pile => ({ type: 'stock', cards: [] });

const makePile = (cards: CardData[]): Pile => ({ type: 'stock', cards });

describe('StockPile', () => {
  describe('rendering', () => {
    it('renders an empty stock pile with the correct aria-label', () => {
      render(
        <StockPile
          pile={emptyStock()}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      expect(screen.getByLabelText('Stock pile, 0 cards remaining')).toBeTruthy();
    });

    it('renders a face-down stack with a count badge when cards remain', () => {
      const card = makeCard({ id: 'c1' });
      render(
        <StockPile
          pile={makePile([card, makeCard({ id: 'c2' }), makeCard({ id: 'c3' })])}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      expect(screen.getByLabelText('Stock pile, 3 cards remaining')).toBeTruthy();
      const badge = screen.getByText('3');
      expect(badge).toBeTruthy();
    });

    it('does not render a count badge when the stock is empty', () => {
      render(
        <StockPile
          pile={emptyStock()}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      expect(screen.queryByText('0')).toBeNull();
    });

    it('renders the stock pile as a face-down card (green felt)', () => {
      const card = makeCard({ id: 'c1' });
      const { container } = render(
        <StockPile
          pile={makePile([card])}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      const pile = container.querySelector('.stock-pile');
      expect(pile?.className).toContain('bg-green-900');
      expect(pile?.className).toContain('border-green-950');
    });
  });

  describe('interactions', () => {
    it('calls onCardClick with the top card when clicked', () => {
      const topCard = makeCard({ id: 'top' });
      const onCardClick = vi.fn();
      render(
        <StockPile
          pile={makePile([makeCard({ id: 'c1' }), topCard])}
          index={0}
          selectedCardId={null}
          onCardClick={onCardClick}
          isValidDropTarget={() => false}
        />
      );
      screen.getByLabelText('Stock pile, 2 cards remaining').click();
      expect(onCardClick).toHaveBeenCalledTimes(1);
      expect(onCardClick).toHaveBeenCalledWith(topCard);
    });

    it('does not call onCardClick when the stock is empty', () => {
      const onCardClick = vi.fn();
      render(
        <StockPile
          pile={emptyStock()}
          index={0}
          selectedCardId={null}
          onCardClick={onCardClick}
          isValidDropTarget={() => false}
        />
      );
      screen.getByLabelText('Stock pile, 0 cards remaining').click();
      expect(onCardClick).not.toHaveBeenCalled();
    });

    it('is draggable when the stock has cards', () => {
      const topCard = makeCard({ id: 'top' });
      const { container } = render(
        <StockPile
          pile={makePile([makeCard({ id: 'c1' }), topCard])}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      const pile = container.querySelector('.stock-pile');
      expect(pile?.getAttribute('draggable')).toBe('true');
    });

    it('is not draggable when the stock is empty', () => {
      const { container } = render(
        <StockPile
          pile={emptyStock()}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      const pile = container.querySelector('.stock-pile');
      expect(pile?.getAttribute('draggable')).toBe('false');
    });
  });

  describe('drop zone', () => {
    it('applies a highlight ring when the drop target is valid', () => {
      const card = makeCard({ id: 'c1' });
      const { container } = render(
        <StockPile
          pile={makePile([card])}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          isValidDropTarget={() => true}
        />
      );
      const pile = container.querySelector('.stock-pile');
      expect(pile?.className).toContain('ring-blue-400');
    });

    it('does not apply a highlight ring when the drop target is invalid', () => {
      const card = makeCard({ id: 'c1' });
      const { container } = render(
        <StockPile
          pile={makePile([card])}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      const pile = container.querySelector('.stock-pile');
      expect(pile?.className).not.toContain('ring-blue-400');
    });

    it('checks validity against the correct drop target', () => {
      const card = makeCard({ id: 'c1' });
      const isValidDropTarget = vi.fn().mockReturnValue(false);
      render(
        <StockPile
          pile={makePile([card])}
          index={2}
          selectedCardId={null}
          onCardClick={() => {}}
          isValidDropTarget={isValidDropTarget}
        />
      );
      const target: DropTarget = { pileType: 'stock', index: 2 };
      expect(isValidDropTarget).toHaveBeenCalledWith(target);
    });
  });
});
