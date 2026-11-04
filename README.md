# Poké Atlas

Aplicativo educacional em **React Native + Expo + TypeScript**, que consome a [PokéAPI](https://pokeapi.co/docs/v2) e exibe seus dados em uma interface em português.

## Funcionalidades

- Coleção com paginação de 12 Pokémon.
- Busca exata por nome (em inglês) ou número: `pikachu`, `25`.
- Detalhes com tipos, altura, peso e seis estatísticas base.
- Indicador de carregamento, tempo limite, erros de rede e botão para tentar novamente.
- Cancelamento de consultas anteriores e ao sair do aplicativo.
- Mesma base de código para Android, iOS e web.

## Executar

Requisitos: Node.js LTS e npm. Instale o Expo Go compatível com SDK 57 para testar no celular.

```sh
npm ci
npm start
```

Escaneie o QR code com Expo Go. O celular e o computador devem estar na mesma rede. Também é possível usar `npm run android` com emulador Android configurado ou `npm run ios` com simulador em macOS.

```sh
npm run web
npm run typecheck
npx expo export --platform web
```

O último comando gera o site estático em `dist/`.

## API e estrutura

Não exige chave de API nem arquivo `.env`. É necessário acesso à internet.

- `GET /pokemon?limit=12&offset=0`: paginação.
- `GET /pokemon/{nome-ou-id}`: detalhes e imagens.
- `src/api.ts`: tipos e acesso HTTP.
- `App.tsx`: coleção, busca e modal de detalhes.

Busca sem correspondência retorna uma mensagem; em caso de falha os dados anteriores permanecem visíveis. Imagens são carregadas diretamente das URLs retornadas pela API. Não há autenticação, backend próprio ou armazenamento de dados pessoais.

## Créditos

Dados: PokéAPI. Pokémon e seus personagens pertencem à Nintendo, Game Freak e Creatures. Projeto independente para fins educacionais. O código segue a licença do arquivo `LICENSE`; marcas e imagens de terceiros não estão incluídas nessa licença.
