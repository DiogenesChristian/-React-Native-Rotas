import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getPage, getPokemon, Pokemon } from '../api';
import { PokemonCard } from '../components/PokemonCard';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';
import { getTheme } from '../theme';

export function HomeScreen() {
  const [items, setItems] = useState<Pokemon[]>([]);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDarkMode, isFavorite, toggleFavorite } = useApp();
  const theme = getTheme(isDarkMode);
  const active = useRef<AbortController | null>(null);
  const retry = useRef<() => void>(() => {});

  async function load(mode: 'reset' | 'more' | 'search') {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setLoading(true);
    setError('');
    retry.current = () => {
      void load(mode);
    };

    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      if (mode === 'search') {
        const result = await getPokemon(query, controller.signal);
        if (!controller.signal.aborted) {
          setItems([result]);
          setSearched(true);
        }
      } else {
        const page = await getPage(mode === 'more' ? items.length : 0, controller.signal);
        if (!controller.signal.aborted) {
          setItems((previous) => (mode === 'more' ? [...previous, ...page.items] : page.items));
          setHasMore(page.hasMore);
          setSearched(false);
        }
      }
    } catch (e) {
      if (active.current === controller) {
        setError(
          controller.signal.aborted
            ? 'A consulta demorou demais. Tente novamente.'
            : e instanceof TypeError
              ? 'Verifique sua internet e tente novamente.'
              : e instanceof Error
                ? e.message
                : 'Não foi possível buscar os dados.',
        );
      }
    } finally {
      clearTimeout(timeout);
      if (active.current === controller) setLoading(false);
    }
  }

  useEffect(() => {
    void load('reset');
    return () => {
      active.current?.abort();
      active.current = null;
    };
  }, []);

  return (
    <View style={[styles.safeArea, { backgroundColor: theme.background }]}> 
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={[styles.brand, { color: theme.accent }]}>◉ POKÉ ATLAS</Text>
          <Text style={[styles.eyebrow, { color: theme.muted }]}>EXPLORAR</Text>
        </View>

        <Text style={[styles.eyebrow, { color: theme.muted }]}>UM UNIVERSO PARA DESCOBRIR</Text>
        <Text accessibilityRole="header" style={[styles.heading, { color: theme.text }]}>{'Conheça seu\npróximo Pokémon.'}</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>Explore espécies, tipos e estatísticas em uma coleção cheia de descobertas.</Text>

        <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
          <TextInput
            accessibilityLabel="Nome ou número do Pokémon"
            placeholder="Nome ou número. Ex.: pikachu"
            placeholderTextColor={theme.muted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (query.trim() && !loading) void load('search');
            }}
            style={[styles.input, { color: theme.text }]}
          />
          <Pressable
            accessibilityRole="button"
            disabled={!query.trim() || loading}
            onPress={() => void load('search')}
            style={[styles.button, (!query.trim() || loading) && { opacity: 0.4 }, { backgroundColor: theme.accent }]}
          >
            <Text style={styles.buttonText}>Buscar</Text>
          </Pressable>
        </View>

        <View style={styles.headerRow}>
          <Text style={[styles.section, { color: theme.text }]}>{searched ? 'Sua descoberta' : 'Coleção de Pokémon'}</Text>
          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={() => {
              setQuery('');
              void load('reset');
            }}
          >
            <Text style={[styles.link, { color: theme.accent }]}>{searched ? 'Ver todos' : 'Atualizar ↻'}</Text>
          </Pressable>
        </View>

        {!!error && (
          <View accessibilityRole="alert" style={[styles.errorBox, { backgroundColor: theme.danger }]}> 
            <Text style={{ color: theme.text }}>{error}</Text>
            <Pressable accessibilityRole="button" disabled={loading} onPress={() => retry.current()}>
              <Text style={[styles.link, { color: theme.accent }]}>Tentar novamente</Text>
            </Pressable>
          </View>
        )}

        <FlatList
          data={items}
          keyExtractor={(pokemon) => String(pokemon.id)}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PokemonCard
              pokemon={item}
              isFavorite={isFavorite(String(item.id))}
              onToggleFavorite={() => toggleFavorite(String(item.id))}
              onPress={() => navigation.navigate('Details', { pokemonId: item.id })}
            />
          )}
          ListFooterComponent={
            <View style={styles.footer}>
              {loading ? (
                <>
                  <ActivityIndicator color={theme.accent} size="large" />
                  <Text style={[styles.subtitle, { color: theme.muted }]}>Buscando na PokéAPI…</Text>
                </>
              ) : !searched && items.length > 0 && hasMore ? (
                <Pressable accessibilityRole="button" onPress={() => void load('more')} style={[styles.moreButton, { borderColor: theme.border }]}> 
                  <Text style={[styles.link, { color: theme.accent }]}>Explorar mais Pokémon ↓</Text>
                </Pressable>
              ) : null}
              <Text style={[styles.credit, { color: theme.muted }]}>Dados ao vivo · PokéAPI</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 22 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  brand: { fontWeight: '900', letterSpacing: 2, fontSize: 16 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginVertical: 12 },
  heading: { fontSize: 34, fontWeight: '800', letterSpacing: -1.2, marginVertical: 12 },
  subtitle: { fontSize: 14, lineHeight: 22 },
  searchBox: { flexDirection: 'row', borderRadius: 16, padding: 6, marginVertical: 24, borderWidth: 1 },
  input: { flex: 1, minWidth: 0, paddingHorizontal: 10, fontSize: 13, minHeight: 46 },
  button: { paddingHorizontal: 17, borderRadius: 11, justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  section: { fontWeight: '700', fontSize: 15 },
  link: { fontWeight: '700', fontSize: 13, paddingVertical: 8 },
  footer: { alignItems: 'center', paddingVertical: 16 },
  moreButton: { padding: 10, alignItems: 'center', borderRadius: 12, borderWidth: 1 },
  credit: { fontSize: 11, lineHeight: 18, textAlign: 'center', marginVertical: 24 },
  errorBox: { padding: 14, borderRadius: 12, marginBottom: 12 },
});
