import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getPokemon, Pokemon } from '../api';
import { PokemonCard } from '../components/PokemonCard';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { getTheme } from '../theme';

export function FavoritesScreen() {
  const { favorites, isDarkMode, isFavorite, toggleFavorite } = useApp();
  const theme = getTheme(isDarkMode);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<Pokemon[]>([]);

  useEffect(() => {
    if (favorites.length === 0) {
      setItems([]);
      return;
    }

    const controller = new AbortController();

    async function loadFavorites() {
      try {
        const result = await Promise.all(
          favorites.map((id) => getPokemon(String(id), controller.signal)),
        );
        if (!controller.signal.aborted) {
          setItems(result);
        }
      } catch {
        if (!controller.signal.aborted) {
          setItems([]);
        }
      }
    }

    void loadFavorites();
    return () => controller.abort();
  }, [favorites]);

  if (favorites.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.background }]}> 
        <Text style={[styles.emptyText, { color: theme.text }]}>Nenhum favorito ainda.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <FlatList
        data={items}
        keyExtractor={(pokemon) => String(pokemon.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <PokemonCard
            pokemon={item}
            isFavorite={isFavorite(String(item.id))}
            onToggleFavorite={() => toggleFavorite(String(item.id))}
            onPress={() => navigation.navigate('Details', { pokemonId: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 18, fontWeight: '600' },
});
