import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { STORAGE_KEYS } from '../constants';
import { loadValue, saveValue } from '../storage';

type AppContextValue = {
  favorites: string[];
  isDarkMode: boolean;
  ready: boolean;
  isFavorite: (pokemonId: string) => boolean;
  toggleFavorite: (pokemonId: string) => void;
  toggleTheme: () => void;
  clearFavorites: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPersistedState() {
      const [savedFavorites, savedTheme] = await Promise.all([
        loadValue<string[]>(STORAGE_KEYS.favorites, []),
        loadValue<boolean>(STORAGE_KEYS.theme, false),
      ]);

      if (!active) return;
      setFavorites(savedFavorites);
      setIsDarkMode(savedTheme);
      setReady(true);
    }

    void loadPersistedState();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void saveValue(STORAGE_KEYS.favorites, favorites);
  }, [favorites, ready]);

  useEffect(() => {
    if (!ready) return;
    void saveValue(STORAGE_KEYS.theme, isDarkMode);
  }, [isDarkMode, ready]);

  const isFavorite = useCallback(
    (pokemonId: string) => favorites.includes(pokemonId),
    [favorites],
  );

  const toggleFavorite = useCallback((pokemonId: string) => {
    setFavorites((current) =>
      current.includes(pokemonId)
        ? current.filter((id) => id !== pokemonId)
        : [...current, pokemonId],
    );
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((current) => !current);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({ favorites, isDarkMode, ready, isFavorite, toggleFavorite, toggleTheme, clearFavorites }),
    [favorites, isDarkMode, ready, isFavorite, toggleFavorite, toggleTheme, clearFavorites],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
