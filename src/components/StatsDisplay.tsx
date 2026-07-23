import clsx from 'clsx';
import type { Stats } from '../hooks/useStats';

export interface StatsDisplayProps {
  stats: Stats;
  winRate?: number;
  onReset?: () => void;
  className?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function StatsDisplay({ stats, winRate, onReset = () => {}, className }: StatsDisplayProps) {
  const { gamesPlayed, gamesWon, bestTime } = stats;
  const computedWinRate = winRate ?? (gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0);
  const displayWinRate = gamesPlayed > 0 ? `${computedWinRate.toFixed(1)}%` : '0.0%';
  const displayBestTime = bestTime !== null ? formatTime(bestTime) : '—';

  return (
    <section
      aria-label="Game statistics"
      className={clsx(
        'stats-display inline-flex items-center gap-6 rounded-lg bg-green-950/50 px-4 py-2 text-sm',
        'sm:flex-wrap sm:justify-center',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-slate-300">Played:</span>
        <span
          data-testid="stats-games-played"
          aria-label={`Games played: ${gamesPlayed}`}
          className="font-medium text-slate-100"
        >
          {gamesPlayed}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-300">Won:</span>
        <span
          data-testid="stats-games-won"
          aria-label={`Games won: ${gamesWon}`}
          className="font-medium text-slate-100"
        >
          {gamesWon}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-300">Win rate:</span>
        <span
          data-testid="stats-win-rate"
          aria-label={`Win rate: ${displayWinRate}`}
          className="font-medium text-slate-100"
        >
          {displayWinRate}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-300">Best time:</span>
        <span
          data-testid="stats-best-time"
          aria-label={`Best time: ${displayBestTime}`}
          className="font-medium text-slate-100"
        >
          {displayBestTime}
        </span>
      </div>

      <button
        type="button"
        data-testid="stats-reset"
        aria-label="Reset statistics"
        className={clsx(
          'rounded-md px-2.5 py-1 font-semibold transition-colors',
          'bg-slate-700 text-slate-300 hover:bg-slate-600',
          'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
        )}
        onClick={onReset}
      >
        Reset
      </button>
    </section>
  );
}

export default StatsDisplay;
