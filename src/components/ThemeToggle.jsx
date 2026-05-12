'use client';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="p-2 rounded-full hover:bg-[var(--line)] transition-colors"
    >
      {resolvedTheme === 'dark' ? (
        <Sun size={20} style={{ color: 'var(--sun)' }} />
      ) : (
        <Moon size={20} style={{ color: 'var(--bark)' }} />
      )}
    </button>
  );
}
