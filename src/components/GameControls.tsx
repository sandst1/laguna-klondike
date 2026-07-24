import clsx from 'clsx';
import type { DrawMode, GameState } from '../types';

export interface GameControlsProps {
  state: GameState;
  onNewGame?: (drawMode?: DrawMode) => void;
  onUndo?: () => void;
  className?: string;
}

export function GameControls({
  state,
  onNewGame = () => {},
  onUndo = () => {},
  className,
}: GameControlsProps) {
  const moveCount = state.moves.length;
  const undoHistoryLength = state.undoHistory.length;
  const canUndo = undoHistoryLength > 0;
  const gameOver = state.gameOver;

  const handleNewGame = () => {
    onNewGame(state.drawMode);
  };

  const handleUndo = () => {
    if (canUndo) {
      onUndo();
    }
  };

  return (
    <section
      aria-label="Game controls"
      className={clsx('game-controls flex items-center justify-between gap-4', className)}
    >
      <button
        type="button"
        data-testid="new-game-button"
        aria-label={gameOver ? 'New game (you won!)' : 'New game'}
        className={clsx(
          'rounded-md px-4 py-1.5 text-sm font-semibold transition-colors',
          'bg-blue-600 text-white hover:bg-blue-700',
          'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
        )}
        onClick={handleNewGame}
      >
        New Game
      </button>

      <div className="flex items-center gap-4">
        <span
          data-testid="move-counter"
          aria-label={`Moves: ${moveCount}`}
          className="text-sm font-medium text-slate-300"
        >
          Moves: {moveCount}
        </span>

        <button
          type="button"
          data-testid="undo-button"
          aria-label={`Undo (last move)${canUndo ? '' : ', no moves to undo'}`}
          disabled={!canUndo}
          className={clsx(
            'rounded-md px-4 py-1.5 text-sm font-semibold transition-colors',
            'bg-amber-600 text-white hover:bg-amber-700',
            'focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2',
            !canUndo && 'cursor-not-allowed opacity-50'
          )}
          onClick={handleUndo}
        >
          Undo
        </button>
      </div>
    </section>
  );
}

export default GameControls;
