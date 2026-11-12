import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { useApp } from '../context/AppContext';
import { getTheme } from '../theme';

export function SettingsScreen() {
  const { isDarkMode, toggleTheme, clearFavorites, favorites } = useApp();
  const theme = getTheme(isDarkMode);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <Text style={[styles.title, { color: theme.text }]}>Configurações</Text>

      <View style={[styles.row, { borderBottomColor: theme.border }]}> 
        <Text style={[styles.label, { color: theme.text }]}>Tema escuro</Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>

      <Pressable
        style={[styles.button, { backgroundColor: theme.accent }]}
        onPress={clearFavorites}
        disabled={favorites.length === 0}
      >
        <Text style={[styles.buttonText, favorites.length === 0 && styles.buttonDisabledText]}>Limpar favoritos</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  label: { fontSize: 16, fontWeight: '600' },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  buttonDisabledText: { opacity: 0.5 },
});
