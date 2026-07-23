/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsPanel } from './SettingsPanel';
import type { Settings } from '../hooks/useSettings';

const makeSettings = (overrides: Partial<Settings>): Settings => ({
  drawMode: 3,
  sound: true,
  highContrast: false,
  ...overrides,
});

describe('SettingsPanel', () => {
  it('renders the settings section with aria-label', () => {
    render(<SettingsPanel settings={makeSettings({})} />);
    expect(screen.getByLabelText('Settings')).toBeTruthy();
  });

  it('renders a Sound toggle button', () => {
    render(<SettingsPanel settings={makeSettings({ sound: true })} />);
    expect(screen.getByLabelText('Sound on')).toBeTruthy();
  });

  it('renders a High Contrast toggle button', () => {
    render(<SettingsPanel settings={makeSettings({ highContrast: true })} />);
    expect(screen.getByLabelText('High contrast on')).toBeTruthy();
  });

  it('marks Sound as pressed when sound is true', () => {
    render(<SettingsPanel settings={makeSettings({ sound: true })} />);
    const button = screen.getByTestId('sound-toggle');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('marks Sound as not pressed when sound is false', () => {
    render(<SettingsPanel settings={makeSettings({ sound: false })} />);
    const button = screen.getByTestId('sound-toggle');
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('marks High Contrast as pressed when highContrast is true', () => {
    render(<SettingsPanel settings={makeSettings({ highContrast: true })} />);
    const button = screen.getByTestId('high-contrast-toggle');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('marks High Contrast as not pressed when highContrast is false', () => {
    render(<SettingsPanel settings={makeSettings({ highContrast: false })} />);
    const button = screen.getByTestId('high-contrast-toggle');
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('applies the active style to the Sound button when sound is on', () => {
    render(<SettingsPanel settings={makeSettings({ sound: true })} />);
    const button = screen.getByTestId('sound-toggle');
    expect(button.className).toContain('bg-blue-600');
    expect(button.className).toContain('text-white');
  });

  it('applies the inactive style to the Sound button when sound is off', () => {
    render(<SettingsPanel settings={makeSettings({ sound: false })} />);
    const button = screen.getByTestId('sound-toggle');
    expect(button.className).toContain('bg-slate-700');
    expect(button.className).toContain('text-slate-300');
  });

  it('applies the active style to the High Contrast button when on', () => {
    render(<SettingsPanel settings={makeSettings({ highContrast: true })} />);
    const button = screen.getByTestId('high-contrast-toggle');
    expect(button.className).toContain('bg-blue-600');
    expect(button.className).toContain('text-white');
  });

  it('applies the inactive style to the High Contrast button when off', () => {
    render(<SettingsPanel settings={makeSettings({ highContrast: false })} />);
    const button = screen.getByTestId('high-contrast-toggle');
    expect(button.className).toContain('bg-slate-700');
    expect(button.className).toContain('text-slate-300');
  });

  it('displays "On" when sound is true', () => {
    render(<SettingsPanel settings={makeSettings({ sound: true })} />);
    expect(screen.getByTestId('sound-toggle').textContent).toBe('On');
  });

  it('displays "Off" when sound is false', () => {
    render(<SettingsPanel settings={makeSettings({ sound: false })} />);
    expect(screen.getByTestId('sound-toggle').textContent).toBe('Off');
  });

  it('displays "On" when highContrast is true', () => {
    render(<SettingsPanel settings={makeSettings({ highContrast: true })} />);
    expect(screen.getByTestId('high-contrast-toggle').textContent).toBe('On');
  });

  it('displays "Off" when highContrast is false', () => {
    render(<SettingsPanel settings={makeSettings({ highContrast: false })} />);
    expect(screen.getByTestId('high-contrast-toggle').textContent).toBe('Off');
  });

  it('calls onSoundChange with false when Sound is clicked and sound is true', () => {
    const onSoundChange = vi.fn();
    render(
      <SettingsPanel settings={makeSettings({ sound: true })} onSoundChange={onSoundChange} />
    );
    fireEvent.click(screen.getByTestId('sound-toggle'));
    expect(onSoundChange).toHaveBeenCalledTimes(1);
    expect(onSoundChange).toHaveBeenCalledWith(false);
  });

  it('calls onSoundChange with true when Sound is clicked and sound is false', () => {
    const onSoundChange = vi.fn();
    render(
      <SettingsPanel settings={makeSettings({ sound: false })} onSoundChange={onSoundChange} />
    );
    fireEvent.click(screen.getByTestId('sound-toggle'));
    expect(onSoundChange).toHaveBeenCalledTimes(1);
    expect(onSoundChange).toHaveBeenCalledWith(true);
  });

  it('calls onHighContrastChange with true when High Contrast is clicked and off', () => {
    const onHighContrastChange = vi.fn();
    render(
      <SettingsPanel
        settings={makeSettings({ highContrast: false })}
        onHighContrastChange={onHighContrastChange}
      />
    );
    fireEvent.click(screen.getByTestId('high-contrast-toggle'));
    expect(onHighContrastChange).toHaveBeenCalledTimes(1);
    expect(onHighContrastChange).toHaveBeenCalledWith(true);
  });

  it('calls onHighContrastChange with false when High Contrast is clicked and on', () => {
    const onHighContrastChange = vi.fn();
    render(
      <SettingsPanel
        settings={makeSettings({ highContrast: true })}
        onHighContrastChange={onHighContrastChange}
      />
    );
    fireEvent.click(screen.getByTestId('high-contrast-toggle'));
    expect(onHighContrastChange).toHaveBeenCalledTimes(1);
    expect(onHighContrastChange).toHaveBeenCalledWith(false);
  });

  it('does not call onSoundChange when no handler is provided', () => {
    render(<SettingsPanel settings={makeSettings({ sound: true })} />);
    expect(() => fireEvent.click(screen.getByTestId('sound-toggle'))).not.toThrow();
  });

  it('does not call onHighContrastChange when no handler is provided', () => {
    render(<SettingsPanel settings={makeSettings({ highContrast: true })} />);
    expect(() => fireEvent.click(screen.getByTestId('high-contrast-toggle'))).not.toThrow();
  });

  it('applies the className prop to the settings section', () => {
    const { container } = render(
      <SettingsPanel settings={makeSettings({})} className="custom-class" />
    );
    expect(container.querySelector('.settings-panel')?.className).toContain('custom-class');
  });
});
