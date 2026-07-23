import clsx from 'clsx';
import type { Settings } from '../hooks/useSettings';

export interface SettingsPanelProps {
  settings: Settings;
  onSoundChange?: (sound: boolean) => void;
  onHighContrastChange?: (highContrast: boolean) => void;
  className?: string;
}

export function SettingsPanel({
  settings,
  onSoundChange = () => {},
  onHighContrastChange = () => {},
  className,
}: SettingsPanelProps) {
  const { sound, highContrast } = settings;

  return (
    <section
      aria-label="Settings"
      className={clsx(
        'settings-panel inline-flex items-center gap-4 rounded-lg bg-green-950/50 px-4 py-2 text-sm',
        'sm:flex-wrap sm:justify-center',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-slate-300">Sound:</span>
        <button
          type="button"
          data-testid="sound-toggle"
          aria-pressed={sound}
          aria-label={sound ? 'Sound on' : 'Sound off'}
          className={clsx(
            'rounded-md px-2.5 py-1 font-semibold transition-colors',
            sound ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
            'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
          )}
          onClick={() => onSoundChange(!sound)}
        >
          {sound ? 'On' : 'Off'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-300">High Contrast:</span>
        <button
          type="button"
          data-testid="high-contrast-toggle"
          aria-pressed={highContrast}
          aria-label={highContrast ? 'High contrast on' : 'High contrast off'}
          className={clsx(
            'rounded-md px-2.5 py-1 font-semibold transition-colors',
            highContrast
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
            'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
          )}
          onClick={() => onHighContrastChange(!highContrast)}
        >
          {highContrast ? 'On' : 'Off'}
        </button>
      </div>
    </section>
  );
}

export default SettingsPanel;
