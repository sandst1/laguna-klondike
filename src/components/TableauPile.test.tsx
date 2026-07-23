/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableauPile } from './TableauPile';
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

const emptyTableau = (): Pile => ({ type: 'tableau', cards: [] });

const makePile = (cards: CardData[]): Pile => ({ type: 'tableau', cards });

describe('TableauPile', () => {
  describe('rendering', () => {
    it('renders an empty pile with a dashed border', () => {
      render(
        <TableauPile
          pile={emptyTableau()}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          onCardDoubleClick={() => {}}
          onPileClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      expect(screen.getByLabelText('Empty tableau pile 1')).toBeTruthy();
    });

    it('renders face-up cards in the pile', () => {
      const ace = makeCard({ id: 'ah', rank: 'A', faceUp: true });
      const two = makeCard({ id: '2h', rank: '2', faceUp: true });
      render(
        <TableauPile
          pile={makePile([ace, two])}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          onCardDoubleClick={() => {}}
          onPileClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      expect(screen.getByLabelText('A of hearts (red) card')).toBeTruthy();
      expect(screen.getByLabelText('2 of hearts (red) card')).toBeTruthy();
    });

    it('renders face-down cards as individual card buttons', () => {
      const faceDown1 = makeCard({ id: 'fd1', faceUp: false });
      const faceDown2 = makeCard({ id: 'fd2', faceUp: false });
      const ace = makeCard({ id: 'ah', rank: 'A', faceUp: true });
      render(
        <TableauPile
          pile={makePile([faceDown1, faceDown2, ace])}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          onCardDoubleClick={() => {}}
          onPileClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      const faceDownCards = screen.getAllByLabelText('face-down card');
      expect(faceDownCards).toHaveLength(2);
    });

    it('renders a single face-down card as a button', () => {
      const faceDown = makeCard({ id: 'fd', faceUp: false });
      render(
        <TableauPile
          pile={makePile([faceDown])}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          onCardDoubleClick={() => {}}
          onPileClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      expect(screen.getByLabelText('face-down card')).toBeTruthy();
    });
  });

  describe('selection', () => {
    it('marks the selected card with isSelected', () => {
      const ace = makeCard({ id: 'ah', rank: 'A', faceUp: true });
      render(
        <TableauPile
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
        <TableauPile
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
    it('calls onCardClick when a card is clicked', () => {
      const ace = makeCard({ id: 'ah', rank: 'A', faceUp: true });
      const onCardClick = vi.fn();
      render(
        <TableauPile
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
        <TableauPile
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
        <TableauPile
          pile={makePile([ace])}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          onCardDoubleClick={() => {}}
          isValidDropTarget={() => true}
        />
      );
      const pile = container.querySelector('.tableau-pile');
      expect(pile?.className).toContain('ring-blue-400');
    });

    it('does not apply a highlight ring when the drop target is invalid', () => {
      const ace = makeCard({ id: 'ah', rank: 'A', faceUp: true });
      const { container } = render(
        <TableauPile
          pile={makePile([ace])}
          index={0}
          selectedCardId={null}
          onCardClick={() => {}}
          onCardDoubleClick={() => {}}
          onPileClick={() => {}}
          isValidDropTarget={() => false}
        />
      );
      const pile = container.querySelector('.tableau-pile');
      expect(pile?.className).not.toContain('ring-blue-400');
    });

    it('checks validity against the correct drop target', () => {
      const ace = makeCard({ id: 'ah', rank: 'A', faceUp: true });
      const isValidDropTarget = vi.fn().mockReturnValue(false);
      render(
        <TableauPile
          pile={makePile([ace])}
          index={2}
          selectedCardId={null}
          onCardClick={() => {}}
          onCardDoubleClick={() => {}}
          isValidDropTarget={isValidDropTarget}
        />
      );
      const target: DropTarget = { pileType: 'tableau', index: 2 };
      expect(isValidDropTarget).toHaveBeenCalledWith(target);
    });
  });
});
