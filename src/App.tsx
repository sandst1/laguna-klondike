import { useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { SettingsPanel } from './components/SettingsPanel';
import { StatsDisplay } from './components/StatsDisplay';
import { useGameState } from './hooks/useGameState';
import { useSettings } from './hooks/useSettings';
import { useStats } from './hooks/useStats';

function App() {
  const { settings, setSound } = useSettings();
  const { state, actions, gameOver } = useGameState(settings.drawMode, settings.sound);
  const { stats, recordGame, resetStats } = useStats();

  useEffect(() => {
    if (gameOver) {
      recordGame(true);
    }
  }, [gameOver, recordGame]);

  const handleNewGame = () => {
    actions.deal(settings.drawMode);
  };

  const handleUndo = () => {
    actions.undo();
  };

  const handleSoundChange = (sound: boolean) => {
    setSound(sound);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-4 bg-green-950 p-4 text-slate-100">
      <main className="flex w-full max-w-7xl flex-col items-center gap-2" style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}>
        <header className="flex w-full flex-wrap items-center justify-between gap-1.5 rounded-lg bg-green-950/50 px-3 py-1.5 text-sm">
          <GameControls state={state} onNewGame={handleNewGame} onUndo={handleUndo} />
          <div className="flex flex-wrap items-center gap-2">
            <SettingsPanel settings={settings} onSoundChange={handleSoundChange} />
            <StatsDisplay stats={stats} onReset={resetStats} />
          </div>
        </header>

        <GameBoard
          state={state}
          move={actions.move}
          draw={actions.draw}
          selectCard={actions.selectCard}
          autoMove={actions.autoMove}
        />
      </main>

      {gameOver && (
        <div
          aria-label="You win!"
          className="fixed inset-0 flex items-center justify-center bg-black/50"
        >
          <div className="rounded-lg bg-green-900 p-8 text-center">
            <h2 className="text-3xl font-bold">You Win!</h2>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
