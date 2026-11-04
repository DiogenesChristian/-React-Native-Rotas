import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { getPage, getPokemon, Pokemon } from './src/api';

export default function App() {
  const [items, setItems] = useState<Pokemon[]>([]);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [selected, setSelected] = useState<Pokemon | null>(null);
  const active = useRef<AbortController | null>(null);
  const retry = useRef<() => void>(() => {});
  async function load(mode: 'reset' | 'more' | 'search') {
    active.current?.abort();
    const controller = new AbortController(); active.current = controller;
    setLoading(true); setError('');
    retry.current = () => { void load(mode); };
    const timeout = setTimeout(() => controller.abort('timeout'), 20000);
    try {
      if (mode === 'search') {
        const result = await getPokemon(query, controller.signal);
        if (!controller.signal.aborted) { setItems([result]); setSearched(true); }
      } else {
        const page = await getPage(mode === 'more' ? items.length : 0, controller.signal);
        if (!controller.signal.aborted) { setItems(previous => mode === 'more' ? [...previous, ...page.items] : page.items); setHasMore(page.hasMore); setSearched(false); }
      }
    } catch (e) {
      if (active.current === controller) setError(controller.signal.aborted ? 'A consulta demorou demais. Tente novamente.' : e instanceof TypeError ? 'Verifique sua internet e tente novamente.' : e instanceof Error ? e.message : 'Não foi possível buscar os dados.');
    } finally { clearTimeout(timeout); if (active.current === controller) setLoading(false); }
  }
  useEffect(() => { void load('reset'); return () => { active.current?.abort(); active.current = null; }; }, []);
  const types = (p: Pokemon) => p.types.map(t => labels[t.type.name] ?? t.type.name).join(' · ');
  return <SafeAreaView style={s.safe}><StatusBar barStyle="dark-content" backgroundColor="#f6f5ef" />
    <View style={s.container}>
      <View style={s.row}><Text style={s.brand}>◉  POKÉ ATLAS</Text><Text style={s.eyebrow}>EXPLORAR</Text></View>
      <Text style={s.eyebrow}>UM UNIVERSO PARA DESCOBRIR</Text>
      <Text accessibilityRole="header" style={s.heading}>Conheça seu{'\n'}próximo Pokémon.</Text>
      <Text style={s.subtitle}>Explore espécies, tipos e estatísticas em uma coleção cheia de descobertas.</Text>
      <View style={s.search}><TextInput accessibilityLabel="Nome ou número do Pokémon" placeholder="Nome ou número. Ex.: pikachu" value={query} onChangeText={setQuery} autoCapitalize="none" autoCorrect={false} returnKeyType="search" onSubmitEditing={() => { if (query.trim() && !loading) void load('search'); }} style={s.input} /><Pressable accessibilityRole="button" disabled={!query.trim() || loading} onPress={() => void load('search')} style={[s.button, (!query.trim() || loading) && { opacity: 0.4 }]}><Text style={s.white}>Buscar</Text></Pressable></View>
      <View style={s.row}><Text style={s.section}>{searched ? 'Sua descoberta' : 'Coleção de Pokémon'}</Text><Pressable accessibilityRole="button" disabled={loading} onPress={() => { setQuery(''); void load('reset'); }}><Text style={s.link}>{searched ? 'Ver todos' : 'Atualizar ↻'}</Text></Pressable></View>
      {!!error && <View accessibilityRole="alert" style={s.error}><Text>{error}</Text><Pressable accessibilityRole="button" disabled={loading} onPress={() => retry.current()}><Text style={s.link}>Tentar novamente</Text></Pressable></View>}
      <FlatList data={items} keyExtractor={p => String(p.id)} numColumns={2} columnWrapperStyle={{ gap: 12 }} showsVerticalScrollIndicator={false} renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`Detalhes de ${item.name}`} onPress={() => setSelected(item)} style={[s.card, { backgroundColor: colors[item.types[0].type.name] ?? '#e6e5ed' }]}><Text style={s.number}>#{String(item.id).padStart(3, '0')}</Text>{item.sprites.front_default && <Image source={{ uri: item.sprites.front_default }} style={s.image} />}<Text style={s.name}>{item.name}</Text><Text style={s.pill}>{types(item)}</Text></Pressable>} ListFooterComponent={<View style={s.footer}>{loading ? <><ActivityIndicator color="#244f40" size="large" /><Text style={s.subtitle}>Buscando na PokéAPI…</Text></> : !searched && items.length > 0 && hasMore ? <Pressable accessibilityRole="button" onPress={() => void load('more')} style={s.more}><Text style={s.link}>Explorar mais Pokémon ↓</Text></Pressable> : null}<Text style={s.credit}>Dados ao vivo · PokéAPI</Text></View>} />
    </View>
    <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}><SafeAreaView style={s.safe}>{selected && <ScrollView contentContainerStyle={s.detail}><Pressable accessibilityRole="button" onPress={() => setSelected(null)} style={s.more}><Text style={s.link}>← Voltar à coleção</Text></Pressable><View style={[s.hero, { backgroundColor: colors[selected.types[0].type.name] ?? '#e6e5ed' }]}><Text style={s.number}>#{selected.id}</Text>{selected.sprites.front_default && <Image source={{ uri: selected.sprites.front_default }} style={s.detailImage} />}<Text style={[s.heading, { textTransform: 'capitalize' }]}>{selected.name}</Text><Text style={s.pill}>{types(selected)}</Text></View><View style={s.row}><Text style={s.section}>Altura: {selected.height / 10} m</Text><Text style={s.section}>Peso: {selected.weight / 10} kg</Text></View><Text style={s.section}>Estatísticas base</Text>{selected.stats.map(stat => <View key={stat.stat.name} style={{ marginTop: 18 }}><View style={s.row}><Text style={s.subtitle}>{statLabels[stat.stat.name] ?? stat.stat.name}</Text><Text style={s.section}>{stat.base_stat}</Text></View><View style={s.track}><View style={[s.bar, { width: `${Math.min(stat.base_stat / 255 * 100, 100)}%` }]} /></View></View>)}<Text style={s.credit}>Projeto educacional independente. Pokémon pertence à Nintendo, Game Freak e Creatures.</Text></ScrollView>}</SafeAreaView></Modal>
  </SafeAreaView>;
}

const labels: Record<string, string> = { grass: 'Planta', fire: 'Fogo', water: 'Água', bug: 'Inseto', normal: 'Normal', poison: 'Veneno', electric: 'Elétrico', ground: 'Terra', fairy: 'Fada', fighting: 'Lutador', psychic: 'Psíquico', rock: 'Pedra', ghost: 'Fantasma', ice: 'Gelo', dragon: 'Dragão', dark: 'Sombrio', steel: 'Aço', flying: 'Voador' };
const colors: Record<string, string> = { grass: '#dcebd7', fire: '#f8dfd1', water: '#d8e8f8', electric: '#f8edbc', bug: '#e7ebce', poison: '#eadcf3' };
const statLabels: Record<string, string> = { hp: 'Vida', attack: 'Ataque', defense: 'Defesa', 'special-attack': 'Atq. especial', 'special-defense': 'Def. especial', speed: 'Velocidade' };
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f5ef', paddingTop: StatusBar.currentHeight ?? 0 }, container: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 22 },
  brand: { fontWeight: '900', color: '#244f40', letterSpacing: 2, fontSize: 16 }, eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: '#738371', marginVertical: 12 }, heading: { fontSize: 34, fontWeight: '800', letterSpacing: -1.2, color: '#203d32', marginVertical: 12 }, subtitle: { fontSize: 14, lineHeight: 22, color: '#68756d' },
  search: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 6, marginVertical: 24, borderWidth: 1, borderColor: '#e1e5dc' }, input: { flex: 1, minWidth: 0, paddingHorizontal: 10, fontSize: 13, color: '#203d32', minHeight: 46 }, button: { backgroundColor: '#244f40', paddingHorizontal: 17, borderRadius: 11, justifyContent: 'center' }, white: { color: '#fff', fontWeight: '700' }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }, section: { color: '#203d32', fontWeight: '700', fontSize: 15 }, link: { color: '#244f40', fontWeight: '700', fontSize: 13, paddingVertical: 8 },
  card: { flex: 1, maxWidth: '50%', padding: 14, borderRadius: 22, marginBottom: 12 }, number: { color: '#526b5b', fontSize: 12, fontWeight: '600' }, image: { width: '100%', height: 125, resizeMode: 'contain' }, name: { fontSize: 18, color: '#203d32', fontWeight: '800', marginBottom: 8, textTransform: 'capitalize' }, pill: { fontSize: 11, fontWeight: '600', color: '#354e40', backgroundColor: '#ffffff80', borderRadius: 8, padding: 7, alignSelf: 'flex-start' }, footer: { alignItems: 'center', paddingVertical: 16 }, more: { padding: 10, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#cbd7ca' }, credit: { color: '#7e8a80', fontSize: 11, lineHeight: 18, textAlign: 'center', marginVertical: 24 }, error: { padding: 14, borderRadius: 12, backgroundColor: '#f8e3dd', marginBottom: 12 }, detail: { padding: 24, width: '100%', maxWidth: 760, alignSelf: 'center' }, hero: { borderRadius: 26, padding: 24, marginVertical: 24 }, detailImage: { width: '100%', height: 220, resizeMode: 'contain' }, track: { height: 8, backgroundColor: '#e1e5dc', borderRadius: 5 }, bar: { height: 8, borderRadius: 5, backgroundColor: '#4c8063' },
});
