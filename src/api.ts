export interface Pokemon {
  id: number; name: string; height: number; weight: number;
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  sprites: { front_default: string | null };
}
export async function request<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`https://pokeapi.co/api/v2/${path}`, { signal });
  if (!response.ok) throw new Error(response.status === 404 ? 'Pokémon não encontrado. Confira o nome ou número.' : 'A API está indisponível. Tente novamente.');
  return response.json();
}
export async function getPage(offset: number, signal: AbortSignal) {
  const page = await request<{ results: { name: string }[]; next: string | null }>(`pokemon?limit=12&offset=${offset}`, signal);
  return { items: await Promise.all(page.results.map(p => getPokemon(p.name, signal))), hasMore: !!page.next };
}
export const getPokemon = (name: string, signal: AbortSignal) => request<Pokemon>(`pokemon/${encodeURIComponent(name.trim().toLowerCase())}`, signal);
