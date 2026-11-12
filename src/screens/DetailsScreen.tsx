import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

import { getPokemon, Pokemon } from '../api';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { getTheme } from '../theme';

export function DetailsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Details'>>();
  const { isDarkMode, isFavorite, toggleFavorite } = useApp();
  const theme = getTheme(isDarkMode);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError('');

      try {
        const item = await getPokemon(String(route.params.pokemonId), controller.signal);
        if (!controller.signal.aborted) {
          setPokemon(item);
        }
      } catch (e) {
        if (!controller.signal.aborted) {
          setError(e instanceof Error ? e.message : 'Não foi possível carregar o Pokémon.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [route.params.pokemonId]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}> 
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.subtitle, { color: theme.muted }]}>Carregando detalhes…</Text>
      </View>
    );
  }

  if (error || !pokemon) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}> 
        <Text style={[styles.error, { color: theme.dangerText }]}>{error || 'Pokémon não encontrado.'}</Text>
      </View>
    );
  }

  const stats = pokemon.stats.map((stat) => ({
    label: statLabels[stat.stat.name] ?? stat.stat.name,
    value: stat.base_stat,
  }));

  const typeText = pokemon.types.map((item) => labels[item.type.name] ?? item.type.name).join(' · ');
  const favorite = isFavorite(String(pokemon.id));

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={[styles.hero, { backgroundColor: colors[pokemon.types[0]?.type.name] ?? '#e6e5ed' }]}> 
        <Pressable
          accessibilityRole="button"
          onPress={() => toggleFavorite(String(pokemon.id))}
          style={styles.favoriteButton}
        >
          <Text style={styles.favoriteText}>{favorite ? '♥' : '♡'}</Text>
        </Pressable>

        <Text style={styles.number}>#{String(pokemon.id).padStart(3, '0')}</Text>
        {pokemon.sprites.front_default && (
          <Image source={{ uri: pokemon.sprites.front_default }} style={styles.image} />
        )}
        <Text style={[styles.heading, { textTransform: 'capitalize', color: theme.text }]}>{pokemon.name}</Text>
        <Text style={[styles.pill, { color: theme.text }]}>{typeText}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.section, { color: theme.text }]}>Altura: {pokemon.height / 10} m</Text>
        <Text style={[styles.section, { color: theme.text }]}>Peso: {pokemon.weight / 10} kg</Text>
      </View>

      <Text style={[styles.section, { color: theme.text }]}>Estatísticas base</Text>

      {stats.map((stat) => (
        <View key={stat.label} style={{ marginTop: 18 }}>
          <View style={styles.row}>
            <Text style={[styles.subtitle, { color: theme.muted }]}>{stat.label}</Text>
            <Text style={[styles.section, { color: theme.text }]}>{stat.value}</Text>
          </View>
          <View style={[styles.track, { backgroundColor: theme.border }]}> 
            <View style={[styles.bar, { width: `${Math.min((stat.value / 255) * 100, 100)}%` }]} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const labels: Record<string, string> = {
  grass: 'Planta',
  fire: 'Fogo',
  water: 'Água',
  bug: 'Inseto',
  normal: 'Normal',
  poison: 'Veneno',
  electric: 'Elétrico',
  ground: 'Terra',
  fairy: 'Fada',
  fighting: 'Lutador',
  psychic: 'Psíquico',
  rock: 'Pedra',
  ghost: 'Fantasma',
  ice: 'Gelo',
  dragon: 'Dragão',
  dark: 'Sombrio',
  steel: 'Aço',
  flying: 'Voador',
};

const colors: Record<string, string> = {
  grass: '#dcebd7',
  fire: '#f8dfd1',
  water: '#d8e8f8',
  electric: '#f8edbc',
  bug: '#e7ebce',
  poison: '#eadcf3',
};

const statLabels: Record<string, string> = {
  hp: 'Vida',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Atq. especial',
  'special-defense': 'Def. especial',
  speed: 'Velocidade',
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  container: { padding: 24, width: '100%', maxWidth: 760, alignSelf: 'center' },
  hero: { borderRadius: 26, padding: 24, marginVertical: 24, position: 'relative' },
  image: { width: '100%', height: 220, resizeMode: 'contain' },
  heading: { fontSize: 34, fontWeight: '800', letterSpacing: -1.2, marginVertical: 12 },
  number: { color: '#526b5b', fontSize: 12, fontWeight: '600' },
  pill: { fontSize: 11, fontWeight: '600', backgroundColor: '#ffffff80', borderRadius: 8, padding: 7, alignSelf: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  section: { fontWeight: '700', fontSize: 15 },
  subtitle: { fontSize: 14, lineHeight: 22 },
  track: { height: 8, borderRadius: 5 },
  bar: { height: 8, borderRadius: 5, backgroundColor: '#4c8063' },
  error: { fontWeight: '700', fontSize: 15, textAlign: 'center' },
  favoriteButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 38,
    height: 38,
    backgroundColor: '#ffffffaa',
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteText: { fontSize: 22, color: '#203d32' },
});
