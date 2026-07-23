/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FoundationPile } from './FoundationPile';
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

const emptyFoundation = (): Pile => ({ type: 'foundation', cards: [] });

const makePile = (cards: CardData[]): Pile => ({ type: 'foundation', cards });

describe('FoundationPile', () => {
  describe('rendering', () => {
    it('renders an empty pile with a dashed border', () => {
      render(
        <FoundationPile
          pile={emptyFoundation()}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          onCardDoubleClick={() => {}}
          onPileClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      expect(screen.getByLabelText('Empty foundation 1')).toBeTruthy();
    });

    it('renders the top card of the pile', () => {
      const ace = makeCard({ id: 'ah', rank: 'A', faceUp: true });
      const two = makeCard({ id: '2h', rank: '2', faceUp: true });
      render(
        <FoundationPile
          pile={makePile([ace, two])}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          onCardDoubleClick={() => {}}
          onPileClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      expect(screen.getByLabelText('2 of hearts (red) card')).toBeTruthy();
    });

    it('does not render cards below the top card', () => {
      const ace = makeCard({ id: 'ah', rank: 'A', faceUp: true });
      const two = makeCard({ id: '2h', rank: '2', faceUp: true });
      render(
        <FoundationPile
          pile={makePile([ace, two])}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          onCardDoubleClick={() => {}}
          onPileClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      expect(screen.queryByLabelText('A of hearts (red) card')).toBeNull();
    });
  });

  describe('selection', () => {
    it('marks the top card with isSelected', () => {
      const ace = makeCard({ id: 'ah', rank: 'A', faceUp: true });
      render(
        <FoundationPile
          pile={makePile([ace])}
          index={0}
          selectedCardId="ah"
          onCardClick={() => {}}
          onCardDoubleClick={() => {}}
          onPileClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      const button = screen.getByRole('button');
      expect(button.getAttribute('data-selected')).toBe('true');
    });

    it('does not mark unselected cards as selected', () => {
      const ace = makeCard({ id: 'ah', rank: 'A', faceUp: true });
      render(
        <FoundationPile
          pile={makePile([ace])}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          onCardDoubleClick={() => {}}
          onPileClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      const button = screen.getByRole('button');
      expect(button.getAttribute('data-selected')).toBe('false');
    });
  });

  describe('interactions', () => {
    it('calls onCardClick when the top card is clicked', () => {
      const ace = makeCard({ id: 'ah', rank: 'A', faceUp: true });
      const onCardClick = vi.fn();
      render(
        <FoundationPile
          pile={makePile([ace])}
          index={0}
          selectedCardId={null}
          onCardClick={onCardClick}
          onCardDoubleClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      screen.getByRole('button').click();
      expect(onCardClick).toHaveBeenCalledTimes(1);
    });

    it('renders the card as draggable via dnd-kit', () => {
      const ace = makeCard({ id: 'ah', rank: 'A', faceUp: true });
      const { container } = render(
        <FoundationPile
          pile={makePile([ace])}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          onCardDoubleClick={() => {}}
          onPileClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      expect(button?.getAttribute('draggable')).toBe('true');
    });
  });

  describe('drop zone', () => {
    it('applies a highlight ring when the drop target is valid', () => {
      const ace = makeCard({ id: 'ah', rank: 'A', faceUp: true });
      const { container } = render(
        <FoundationPile
          pile={makePile([ace])}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          onCardDoubleClick={() => {}}
          isValidDropTarget={() => true}
        />
      );
      const pile = container.querySelector('.foundation-pile');
      expect(pile?.className).toContain('ring-blue-400');
    });

    it('does not apply a highlight ring when the drop target is invalid', () => {
      const ace = makeCard({ id: 'ah', rank: 'A', faceUp: true });
      const { container } = render(
        <FoundationPile
          pile={makePile([ace])}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          onCardDoubleClick={() => {}}
          onPileClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      const pile = container.querySelector('.foundation-pile');
      expect(pile?.className).not.toContain('ring-blue-400');
    });

    it('checks validity against the correct drop target', () => {
      const ace = makeCard({ id: 'ah', rank: 'A', faceUp: true });
      const isValidDropTarget = vi.fn().mockReturnValue(false);
      render(
        <FoundationPile
          pile={makePile([ace])}
          index={2}
          selectedCardId={null}
          onCardClick={() => {}}
          onCardDoubleClick={() => {}}
          isValidDropTarget={isValidDropTarget}
        />
      );
      const target: DropTarget = { pileType: 'foundation', index: 2 };
      expect(isValidDropTarget).toHaveBeenCalledWith(target);
    });
  });
});
