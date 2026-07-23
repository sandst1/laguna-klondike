import clsx from 'clsx';
import type { DrawMode } from '../types';

export interface DrawModeToggleProps {
  drawMode: DrawMode;
  onChange?: (drawMode: DrawMode) => void;
  className?: string;
}

export function DrawModeToggle({ drawMode, onChange = () => {}, className }: DrawModeToggleProps) {
  const handleSelect = (mode: DrawMode) => {
    if (mode === drawMode) {
      return;
    }
    onChange(mode);
  };

  return (
    <section
      aria-label="Draw mode toggle"
      className={clsx(
        'draw-mode-toggle inline-flex items-center gap-1 rounded-lg bg-green-950/50 px-2 py-1 text-sm',
        className
      )}
    >
      <span className="text-slate-300">Draw:</span>
      <button
        type="button"
        data-testid="draw-mode-1"
        aria-pressed={drawMode === 1}
        aria-label="Draw 1"
        className={clsx(
          'rounded-md px-2.5 py-1 font-semibold transition-colors',
          drawMode === 1
            ? 'bg-blue-600 text-white'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
          'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
        )}
        onClick={() => handleSelect(1)}
      >
        1
      </button>
      <button
        type="button"
        data-testid="draw-mode-3"
        aria-pressed={drawMode === 3}
        aria-label="Draw 3"
        className={clsx(
          'rounded-md px-2.5 py-1 font-semibold transition-colors',
          drawMode === 3
            ? 'bg-blue-600 text-white'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
          'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
        )}
        onClick={() => handleSelect(3)}
      >
        3
      </button>
    </section>
  );
}

export default DrawModeToggle;
