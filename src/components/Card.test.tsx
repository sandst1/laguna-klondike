/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';
import type { Card as CardData } from '../types';

const makeCard = (overrides: Partial<CardData> = {}): CardData => ({
  id: 'test-card',
  suit: 'hearts',
  rank: 'A',
  color: 'red',
  faceUp: true,
  ...overrides,
});

describe('Card', () => {
  describe('accessibility', () => {
    it('renders an accessible aria-label for a face-up red card', () => {
      const card = makeCard({ suit: 'hearts', rank: 'A', color: 'red', faceUp: true });
      render(<Card card={card} />);
      const button = screen.getByRole('button');
      expect(button.getAttribute('aria-label')).toBe('A of hearts (red) card');
    });

    it('renders an accessible aria-label for a face-up black card', () => {
      const card = makeCard({ suit: 'spades', rank: 'K', color: 'black', faceUp: true });
      render(<Card card={card} />);
      const button = screen.getByRole('button');
      expect(button.getAttribute('aria-label')).toBe('K of spades (black) card');
    });

    it('renders an accessible aria-label for a face-down card', () => {
      const card = makeCard({ faceUp: false });
      render(<Card card={card} />);
      const button = screen.getByRole('button');
      expect(button.getAttribute('aria-label')).toBe('face-down card');
    });

    it('renders a button with type="button"', () => {
      const card = makeCard();
      render(<Card card={card} />);
      const button = screen.getByRole('button');
      expect(button.getAttribute('type')).toBe('button');
    });

    it('calls onClick when clicked', () => {
      const card = makeCard();
      const onClick = vi.fn();
      render(<Card card={card} onClick={onClick} />);
      const button = screen.getByRole('button');
      button.click();
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('calls onDoubleClick when double-clicked', () => {
      const card = makeCard();
      const onDoubleClick = vi.fn();
      render(<Card card={card} onDoubleClick={onDoubleClick} />);
      const button = screen.getByRole('button');
      fireEvent.doubleClick(button);
      expect(onDoubleClick).toHaveBeenCalledOnce();
    });

    it('does not call onDoubleClick when clicked once', () => {
      const card = makeCard();
      const onDoubleClick = vi.fn();
      render(<Card card={card} onDoubleClick={onDoubleClick} />);
      const button = screen.getByRole('button');
      button.click();
      expect(onDoubleClick).not.toHaveBeenCalled();
    });
  });

  describe('isSelected visual state', () => {
    it('sets data-selected="true" when isSelected is true', () => {
      const card = makeCard();
      render(<Card card={card} isSelected />);
      const button = screen.getByRole('button');
      expect(button.getAttribute('data-selected')).toBe('true');
    });

    it('sets data-selected="false" when isSelected is false', () => {
      const card = makeCard();
      render(<Card card={card} isSelected={false} />);
      const button = screen.getByRole('button');
      expect(button.getAttribute('data-selected')).toBe('false');
    });

    it('defaults data-selected to "false" when isSelected is not provided', () => {
      const card = makeCard();
      render(<Card card={card} />);
      const button = screen.getByRole('button');
      expect(button.getAttribute('data-selected')).toBe('false');
    });

    it('includes the card-selected class for CSS targeting', () => {
      const card = makeCard();
      render(<Card card={card} isSelected />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('card-selected');
    });
  });

  describe('hover animation', () => {
    it('includes the card-hover class for a face-up card with onClick', () => {
      const card = makeCard({ faceUp: true });
      render(<Card card={card} onClick={vi.fn()} />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('card-hover');
    });

    it('does not include the card-hover class for a face-down card with onClick', () => {
      const card = makeCard({ faceUp: false });
      render(<Card card={card} onClick={vi.fn()} />);
      const button = screen.getByRole('button');
      expect(button.className).not.toContain('card-hover');
    });

    it('does not include the card-hover class for a face-up card without onClick', () => {
      const card = makeCard({ faceUp: true });
      render(<Card card={card} />);
      const button = screen.getByRole('button');
      expect(button.className).not.toContain('card-hover');
    });

    it('includes cursor-pointer for a face-up card with onClick', () => {
      const card = makeCard({ faceUp: true });
      render(<Card card={card} onClick={vi.fn()} />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('cursor-pointer');
    });

    it('includes cursor-default for a face-up card without onClick', () => {
      const card = makeCard({ faceUp: true });
      render(<Card card={card} />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('cursor-default');
    });
  });
});
