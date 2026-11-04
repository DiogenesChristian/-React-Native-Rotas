import test from 'node:test';
import assert from 'node:assert/strict';
import { getPokemon, getPage } from './api.ts';

test('normaliza busca e mantém os dados retornados', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async url => {
      assert.equal(url, 'https://pokeapi.co/api/v2/pokemon/pikachu');
      return { ok: true, json: async () => ({ id: 25, name: 'pikachu' }) };
    };
    assert.equal((await getPokemon(' Pikachu ', new AbortController().signal)).id, 25);
  } finally { globalThis.fetch = original; }
});
test('exibe mensagem útil para busca inexistente', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: false, status: 404 });
    await assert.rejects(() => getPokemon('inexistente', new AbortController().signal), /não encontrado/);
  } finally { globalThis.fetch = original; }
});
test('pagina e busca detalhes preservando a ordem e o sinal de cancelamento', async () => {
  const original = globalThis.fetch;
  const signal = new AbortController().signal;
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(options.signal, signal);
      return { ok: true, json: async () => url.includes('?') ? { results: [{ name: 'bulbasaur' }, { name: 'ivysaur' }], next: null } : { name: url.split('/').at(-1) } };
    };
    const page = await getPage(12, signal);
    assert.deepEqual(page.items.map(p => p.name), ['bulbasaur', 'ivysaur']);
    assert.equal(page.hasMore, false);
  } finally { globalThis.fetch = original; }
});
