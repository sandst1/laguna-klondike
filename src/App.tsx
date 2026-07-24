import { useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { SettingsPanel } from './components/SettingsPanel';
import { StatsDisplay } from './components/StatsDisplay';
import { useGameState } from './hooks/useGameState';
import { useSettings } from './hooks/useSettings';
import { useStats } from './hooks/useStats';

function App() {
  const { settings, setSound, setHighContrast } = useSettings();
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

  const handleHighContrastChange = (highContrast: boolean) => {
    setHighContrast(highContrast);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-4 bg-green-950 p-4 text-slate-100">
      <header className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold">Klondike Solitaire</h1>
      </header>

      <main className="flex w-full max-w-7xl flex-col items-center gap-4">
        <GameBoard
          state={state}
          move={actions.move}
          draw={actions.draw}
          selectCard={actions.selectCard}
          autoMove={actions.autoMove}
        />

        <GameControls state={state} onNewGame={handleNewGame} onUndo={handleUndo} />

        <div className="flex w-full flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <SettingsPanel
            settings={settings}
            onSoundChange={handleSoundChange}
            onHighContrastChange={handleHighContrastChange}
          />
          <StatsDisplay stats={stats} onReset={resetStats} />
        </div>
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
