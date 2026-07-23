/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DrawModeToggle } from './DrawModeToggle';

describe('DrawModeToggle', () => {
  it('renders the toggle section with aria-label', () => {
    render(<DrawModeToggle drawMode={3} />);
    expect(screen.getByLabelText('Draw mode toggle')).toBeTruthy();
  });

  it('renders a Draw 1 button', () => {
    render(<DrawModeToggle drawMode={3} />);
    expect(screen.getByLabelText('Draw 1')).toBeTruthy();
  });

  it('renders a Draw 3 button', () => {
    render(<DrawModeToggle drawMode={1} />);
    expect(screen.getByLabelText('Draw 3')).toBeTruthy();
  });

  it('marks Draw 1 as pressed when drawMode is 1', () => {
    render(<DrawModeToggle drawMode={1} />);
    const button = screen.getByTestId('draw-mode-1');
    expect(button.hasAttribute('aria-pressed')).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('marks Draw 3 as pressed when drawMode is 3', () => {
    render(<DrawModeToggle drawMode={3} />);
    const button = screen.getByTestId('draw-mode-3');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('does not mark Draw 1 as pressed when drawMode is 3', () => {
    render(<DrawModeToggle drawMode={3} />);
    const button = screen.getByTestId('draw-mode-1');
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('does not mark Draw 3 as pressed when drawMode is 1', () => {
    render(<DrawModeToggle drawMode={1} />);
    const button = screen.getByTestId('draw-mode-3');
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('applies the active style to the pressed button', () => {
    render(<DrawModeToggle drawMode={3} />);
    const button = screen.getByTestId('draw-mode-3');
    expect(button.className).toContain('bg-blue-600');
    expect(button.className).toContain('text-white');
  });

  it('applies the inactive style to the non-pressed button', () => {
    render(<DrawModeToggle drawMode={3} />);
    const button = screen.getByTestId('draw-mode-1');
    expect(button.className).toContain('bg-slate-700');
    expect(button.className).toContain('text-slate-300');
  });

  it('calls onChange with 1 when Draw 1 is clicked and current mode is 3', () => {
    const onChange = vi.fn();
    render(<DrawModeToggle drawMode={3} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('draw-mode-1'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('calls onChange with 3 when Draw 3 is clicked and current mode is 1', () => {
    const onChange = vi.fn();
    render(<DrawModeToggle drawMode={1} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('draw-mode-3'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('does not call onChange when clicking the already-selected mode', () => {
    const onChange = vi.fn();
    render(<DrawModeToggle drawMode={3} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('draw-mode-3'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('applies the className prop to the toggle section', () => {
    const { container } = render(<DrawModeToggle drawMode={3} className="custom-class" />);
    expect(container.querySelector('.draw-mode-toggle')?.className).toContain('custom-class');
  });
});
