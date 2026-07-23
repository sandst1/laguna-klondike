/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { MoveAnimatorProvider, useMoveAnimation } from './useMoveAnimation';
import type { Card as CardData } from '../types';

const makeCard = (overrides: Partial<CardData>): CardData => ({
  id: 'test-card',
  suit: 'hearts',
  rank: 'A',
  color: 'red',
  faceUp: true,
  ...overrides,
});

function TestConsumer() {
  const { startMoveAnimation, isAnimating } = useMoveAnimation();
  return (
    <div>
      <span data-testid="is-animating">{isAnimating ? 'true' : 'false'}</span>
      <button
        type="button"
        onClick={() => {
          const sourceEl = document.createElement('div');
          const targetEl = document.createElement('div');
          sourceEl.getBoundingClientRect = () => ({
            left: 100,
            top: 200,
            width: 50,
            height: 80,
            right: 150,
            bottom: 280,
            x: 100,
            y: 200,
            toJSON: () => ({}),
          });
          targetEl.getBoundingClientRect = () => ({
            left: 300,
            top: 400,
            width: 50,
            height: 80,
            right: 350,
            bottom: 480,
            x: 300,
            y: 400,
            toJSON: () => ({}),
          });
          startMoveAnimation(makeCard({ id: 'c1' }), sourceEl, targetEl);
        }}
      >
        Start
      </button>
    </div>
  );
}

describe('useMoveAnimation', () => {
  it('throws when used outside MoveAnimatorProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useMoveAnimation must be used');
    spy.mockRestore();
  });

  it('provides isAnimating as false initially', () => {
    render(
      <MoveAnimatorProvider>
        <TestConsumer />
      </MoveAnimatorProvider>
    );
    expect(screen.getByTestId('is-animating').textContent).toBe('false');
  });

  it('sets isAnimating to true when startMoveAnimation is called', () => {
    render(
      <MoveAnimatorProvider>
        <TestConsumer />
      </MoveAnimatorProvider>
    );

    act(() => {
      screen.getByText('Start').click();
    });

    expect(screen.getByTestId('is-animating').textContent).toBe('true');
  });

  it('renders a move animation overlay when animation starts', () => {
    render(
      <MoveAnimatorProvider>
        <TestConsumer />
      </MoveAnimatorProvider>
    );

    act(() => {
      screen.getByText('Start').click();
    });

    expect(screen.getByTestId('move-animation-overlay')).toBeTruthy();
  });

  it('removes the overlay when transition ends', () => {
    render(
      <MoveAnimatorProvider>
        <TestConsumer />
      </MoveAnimatorProvider>
    );

    act(() => {
      screen.getByText('Start').click();
    });

    expect(screen.queryByTestId('move-animation-overlay')).toBeTruthy();

    act(() => {
      const overlay = screen.getByTestId('move-animation-overlay');
      fireEvent.transitionEnd(overlay, { propertyName: 'transform' });
    });

    expect(screen.queryByTestId('move-animation-overlay')).toBeNull();
    expect(screen.getByTestId('is-animating').textContent).toBe('false');
  });
});
