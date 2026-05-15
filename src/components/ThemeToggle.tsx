import React from 'react';
import { SunIcon, MoonIcon } from 'lucide-react';
interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}
export function ThemeToggle({
  theme,
  onToggle
}: ThemeToggleProps) {
  return <button onClick={onToggle} className="p-2 rounded-lg bg-secondary border border-primary hover:bg-tertiary transition-colors" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
      {theme === 'light' ? <MoonIcon className="w-5 h-5 text-primary" /> : <SunIcon className="w-5 h-5 text-primary" />}
    </button>;
}