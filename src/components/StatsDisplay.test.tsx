/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatsDisplay } from './StatsDisplay';
import type { Stats } from '../hooks/useStats';

const makeStats = (overrides: Partial<Stats>): Stats => ({
  gamesPlayed: 0,
  gamesWon: 0,
  bestTime: null,
  ...overrides,
});

describe('StatsDisplay', () => {
  it('renders the stats section with aria-label', () => {
    render(<StatsDisplay stats={makeStats({})} />);
    expect(screen.getByLabelText('Game statistics')).toBeTruthy();
  });

  it('renders a Played stat showing games played', () => {
    render(<StatsDisplay stats={makeStats({ gamesPlayed: 0 })} />);
    expect(screen.getByLabelText('Games played: 0')).toBeTruthy();
    expect(screen.getByTestId('stats-games-played').textContent).toBe('0');
  });

  it('displays the correct games played count', () => {
    render(<StatsDisplay stats={makeStats({ gamesPlayed: 15 })} />);
    expect(screen.getByTestId('stats-games-played').textContent).toBe('15');
  });

  it('renders a Won stat showing games won', () => {
    render(<StatsDisplay stats={makeStats({ gamesWon: 0 })} />);
    expect(screen.getByLabelText('Games won: 0')).toBeTruthy();
    expect(screen.getByTestId('stats-games-won').textContent).toBe('0');
  });

  it('displays the correct games won count', () => {
    render(<StatsDisplay stats={makeStats({ gamesWon: 7 })} />);
    expect(screen.getByTestId('stats-games-won').textContent).toBe('7');
  });

  it('renders a Win rate stat', () => {
    render(<StatsDisplay stats={makeStats({ gamesPlayed: 10, gamesWon: 5 })} />);
    expect(screen.getByLabelText('Win rate: 50.0%')).toBeTruthy();
    expect(screen.getByTestId('stats-win-rate').textContent).toBe('50.0%');
  });

  it('displays 0.0% win rate when no games have been played', () => {
    render(<StatsDisplay stats={makeStats({ gamesPlayed: 0, gamesWon: 0 })} />);
    expect(screen.getByTestId('stats-win-rate').textContent).toBe('0.0%');
  });

  it('calculates win rate correctly with partial wins', () => {
    render(<StatsDisplay stats={makeStats({ gamesPlayed: 3, gamesWon: 1 })} />);
    expect(screen.getByTestId('stats-win-rate').textContent).toBe('33.3%');
  });

  it('calculates win rate as 100% when all games are won', () => {
    render(<StatsDisplay stats={makeStats({ gamesPlayed: 5, gamesWon: 5 })} />);
    expect(screen.getByTestId('stats-win-rate').textContent).toBe('100.0%');
  });

  it('uses the provided winRate prop when given', () => {
    render(<StatsDisplay stats={makeStats({ gamesPlayed: 10, gamesWon: 5 })} winRate={75.5} />);
    expect(screen.getByTestId('stats-win-rate').textContent).toBe('75.5%');
  });

  it('uses the provided winRate prop even when it differs from computed', () => {
    render(<StatsDisplay stats={makeStats({ gamesPlayed: 10, gamesWon: 5 })} winRate={0} />);
    expect(screen.getByTestId('stats-win-rate').textContent).toBe('0.0%');
  });

  it('renders a Best time stat showing em dash when no best time', () => {
    render(<StatsDisplay stats={makeStats({ bestTime: null })} />);
    expect(screen.getByLabelText('Best time: —')).toBeTruthy();
    expect(screen.getByTestId('stats-best-time').textContent).toBe('—');
  });

  it('displays the best time in MM:SS format', () => {
    render(<StatsDisplay stats={makeStats({ bestTime: 125 })} />);
    expect(screen.getByTestId('stats-best-time').textContent).toBe('2:05');
  });

  it('formats best time under a minute correctly', () => {
    render(<StatsDisplay stats={makeStats({ bestTime: 45 })} />);
    expect(screen.getByTestId('stats-best-time').textContent).toBe('0:45');
  });

  it('formats best time of exactly one minute correctly', () => {
    render(<StatsDisplay stats={makeStats({ bestTime: 60 })} />);
    expect(screen.getByTestId('stats-best-time').textContent).toBe('1:00');
  });

  it('formats best time with seconds padding correctly', () => {
    render(<StatsDisplay stats={makeStats({ bestTime: 123 })} />);
    expect(screen.getByTestId('stats-best-time').textContent).toBe('2:03');
  });

  it('renders a Reset button', () => {
    render(<StatsDisplay stats={makeStats({})} />);
    expect(screen.getByLabelText('Reset statistics')).toBeTruthy();
  });

  it('applies the className prop to the stats section', () => {
    const { container } = render(<StatsDisplay stats={makeStats({})} className="custom-class" />);
    expect(container.querySelector('.stats-display')?.className).toContain('custom-class');
  });

  it('calls onReset when the Reset button is clicked', () => {
    const onReset = vi.fn();
    render(<StatsDisplay stats={makeStats({ gamesPlayed: 5, gamesWon: 2 })} onReset={onReset} />);
    fireEvent.click(screen.getByTestId('stats-reset'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('does not call onReset when no handler is provided', () => {
    render(<StatsDisplay stats={makeStats({ gamesPlayed: 5, gamesWon: 2 })} />);
    expect(() => fireEvent.click(screen.getByTestId('stats-reset')).valueOf()).not.toThrow();
  });

  it('displays all four stat labels', () => {
    render(<StatsDisplay stats={makeStats({ gamesPlayed: 10, gamesWon: 3, bestTime: 90 })} />);
    expect(screen.getByText('Played:')).toBeTruthy();
    expect(screen.getByText('Won:')).toBeTruthy();
    expect(screen.getByText('Win rate:')).toBeTruthy();
    expect(screen.getByText('Best time:')).toBeTruthy();
  });

  it('handles large numbers correctly', () => {
    render(<StatsDisplay stats={makeStats({ gamesPlayed: 1000, gamesWon: 500 })} />);
    expect(screen.getByTestId('stats-games-played').textContent).toBe('1000');
    expect(screen.getByTestId('stats-games-won').textContent).toBe('500');
    expect(screen.getByTestId('stats-win-rate').textContent).toBe('50.0%');
  });
});
