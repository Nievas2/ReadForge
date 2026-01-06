"use client"
import { useState, useEffect, useCallback } from 'react';
import { saveToStorage, loadFromStorage } from '@/lib/storage';
import type { ThemeMode, ReadingMode } from '@/types';

const THEME_KEY = 'theme';
const READING_MODE_KEY = 'reading_mode';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => loadFromStorage<ThemeMode>(THEME_KEY, 'system'));
  const [readingMode, setReadingModeState] = useState<ReadingMode>(() => loadFromStorage<ReadingMode>(READING_MODE_KEY, 'normal'));

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('sepia');
    
    if (readingMode === 'sepia') {
      root.classList.add('sepia');
    }
  }, [readingMode]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    saveToStorage(THEME_KEY, newTheme);
  }, []);

  const setReadingMode = useCallback((newMode: ReadingMode) => {
    setReadingModeState(newMode);
    saveToStorage(READING_MODE_KEY, newMode);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  return {
    theme,
    readingMode,
    setTheme,
    setReadingMode,
    toggleTheme,
  };
}