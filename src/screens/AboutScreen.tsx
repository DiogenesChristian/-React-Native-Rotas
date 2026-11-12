import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useApp } from '../context/AppContext';
import { getTheme } from '../theme';

export function AboutScreen() {
  const { isDarkMode } = useApp();
  const theme = getTheme(isDarkMode);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <Text style={[styles.title, { color: theme.text }]}>Poké Atlas</Text>
      <Text style={[styles.text, { color: theme.muted }]}> 
        App em React Native + Expo com integração à PokéAPI, navegação em Drawer, Tabs e Stack,
        além de favoritos e tema personalizável.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  text: { textAlign: 'center', fontSize: 16, lineHeight: 24 },
});
