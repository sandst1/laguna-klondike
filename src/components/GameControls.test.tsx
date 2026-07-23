/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameControls } from './GameControls';
import type { GameState } from '../types';
import { dealGame } from '../game/game';

const makeGameState = (overrides: Partial<GameState>): GameState => ({
  ...dealGame(3),
  ...overrides,
});

describe('GameControls', () => {
  it('renders the controls section with aria-label', () => {
    render(<GameControls state={makeGameState({})} />);
    expect(screen.getByLabelText('Game controls')).toBeTruthy();
  });

  it('renders a New Game button', () => {
    render(<GameControls state={makeGameState({})} />);
    expect(screen.getByLabelText('New game')).toBeTruthy();
  });

  it('renders a Move Counter showing the move count', () => {
    render(<GameControls state={makeGameState({ moves: [] })} />);
    expect(screen.getByLabelText('Moves: 0')).toBeTruthy();
    expect(screen.getByTestId('move-counter').textContent).toBe('Moves: 0');
  });

  it('displays the correct move count when moves have been made', () => {
    const state = makeGameState({
      moves: [
        { type: 'stock-to-waste', cardId: 'c1' },
        { type: 'stock-to-waste', cardId: 'c2' },
        { type: 'stock-to-waste', cardId: 'c3' },
      ],
    });
    render(<GameControls state={state} />);
    expect(screen.getByTestId('move-counter').textContent).toBe('Moves: 3');
  });

  it('renders an Undo button', () => {
    render(<GameControls state={makeGameState({})} />);
    expect(screen.getByLabelText(/Undo/)).toBeTruthy();
  });

  it('disables the Undo button when undo history is empty', () => {
    render(<GameControls state={makeGameState({ undoHistory: [] })} />);
    const undoButton = screen.getByTestId('undo-button');
    expect(undoButton.hasAttribute('disabled')).toBe(true);
    expect(undoButton.className).toContain('opacity-50');
  });

  it('enables the Undo button when undo history has entries', () => {
    const previousState = makeGameState({});
    const state = makeGameState({
      undoHistory: [{ ...previousState, undoHistory: [] }],
    });
    render(<GameControls state={state} />);
    const undoButton = screen.getByTestId('undo-button');
    expect(undoButton.hasAttribute('disabled')).toBe(false);
    expect(undoButton.className).not.toContain('opacity-50');
  });

  it('calls onNewGame when the New Game button is clicked', () => {
    const onNewGame = vi.fn();
    render(<GameControls state={makeGameState({ drawMode: 3 })} onNewGame={onNewGame} />);
    fireEvent.click(screen.getByTestId('new-game-button'));
    expect(onNewGame).toHaveBeenCalledTimes(1);
    expect(onNewGame).toHaveBeenCalledWith(3);
  });

  it('calls onNewGame with the current drawMode when drawMode is 1', () => {
    const onNewGame = vi.fn();
    render(<GameControls state={makeGameState({ drawMode: 1 })} onNewGame={onNewGame} />);
    fireEvent.click(screen.getByTestId('new-game-button'));
    expect(onNewGame).toHaveBeenCalledWith(1);
  });

  it('calls onUndo when the Undo button is clicked and history is available', () => {
    const previousState = makeGameState({});
    const state = makeGameState({
      undoHistory: [{ ...previousState, undoHistory: [] }],
    });
    const onUndo = vi.fn();
    render(<GameControls state={state} onUndo={onUndo} />);
    fireEvent.click(screen.getByTestId('undo-button'));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('does not call onUndo when the Undo button is disabled', () => {
    const onUndo = vi.fn();
    render(<GameControls state={makeGameState({ undoHistory: [] })} onUndo={onUndo} />);
    fireEvent.click(screen.getByTestId('undo-button'));
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('shows a "you won" message in the aria-label when game is over', () => {
    const state = makeGameState({ gameOver: true });
    render(<GameControls state={state} />);
    expect(screen.getByLabelText('New game (you won!)')).toBeTruthy();
  });

  it('does not show the "you won" message when game is not over', () => {
    const state = makeGameState({ gameOver: false });
    render(<GameControls state={state} />);
    expect(screen.getByLabelText('New game')).toBeTruthy();
  });

  it('applies the className prop to the controls section', () => {
    const { container } = render(
      <GameControls state={makeGameState({})} className="custom-class" />
    );
    expect(container.querySelector('.game-controls')?.className).toContain('custom-class');
  });

  it('renders the move counter with correct aria-label', () => {
    const state = makeGameState({
      moves: [{ type: 'stock-to-waste', cardId: 'c1' }],
    });
    render(<GameControls state={state} />);
    expect(screen.getByLabelText('Moves: 1')).toBeTruthy();
  });
});
