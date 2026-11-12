import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Pokemon } from '../api';
import { POKEMON_COLORS } from '../constants';

type Props = {
  pokemon: Pokemon;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
};

export function PokemonCard({ pokemon, isFavorite, onPress, onToggleFavorite }: Props) {
  const typeText = pokemon.types.map((item) => labels[item.type.name] ?? item.type.name).join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Detalhes de ${pokemon.name}`}
      onPress={onPress}
      style={[styles.card, { backgroundColor: POKEMON_COLORS[pokemon.types[0]?.type.name] ?? '#e6e5ed' }]}
    >
      <Pressable
        accessibilityRole="button"
        onPress={(event) => {
          event.stopPropagation();
          onToggleFavorite();
        }}
        style={styles.favoriteButton}
      >
        <Text style={styles.favoriteText}>{isFavorite ? '♥' : '♡'}</Text>
      </Pressable>

      <Text style={styles.number}>#{String(pokemon.id).padStart(3, '0')}</Text>
      {pokemon.sprites.front_default && <Image source={{ uri: pokemon.sprites.front_default }} style={styles.image} />}
      <Text style={styles.name}>{pokemon.name}</Text>
      <Text style={styles.pill}>{typeText}</Text>
    </Pressable>
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

const styles = StyleSheet.create({
  card: {
    flex: 1,
    maxWidth: '50%',
    padding: 14,
    borderRadius: 22,
    marginBottom: 12,
    minHeight: 220,
  },
  favoriteButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffffaa',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  favoriteText: { fontSize: 18, color: '#203d32' },
  number: { color: '#526b5b', fontSize: 12, fontWeight: '600' },
  image: { width: '100%', height: 125, resizeMode: 'contain' },
  name: { fontSize: 18, color: '#203d32', fontWeight: '800', marginBottom: 8, textTransform: 'capitalize' },
  pill: { fontSize: 11, fontWeight: '600', color: '#354e40', backgroundColor: '#ffffff80', borderRadius: 8, padding: 7, alignSelf: 'flex-start' },
});
