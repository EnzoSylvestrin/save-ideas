# Lista de Desejos — Design (Fatia 2)

**Data:** 2026-06-01
**Status:** Aprovado para implementação
**Escopo:** Segundo módulo do hub. Adiciona uma **Lista de Desejos** plugada na arquitetura de módulos da Fatia 1.

## Contexto

A Fatia 1 (Hub Foundation, ver `2026-06-01-hub-foundation-design.md`) transformou o app num hub extensível: um registro central (`modules/registry.ts`) de descritores `HubModule` alimenta a home launcher, a folha de captura e as quick actions do sistema. As Ideias são o primeiro módulo. Esta fatia adiciona a Lista de Desejos como segundo módulo, sem alterar a fundação.

Decisão de ordem (validada): Desejos primeiro, Compras (Fatia 3) depois, cada uma com seu próprio ciclo spec → plano → implementação.

## Decisões de design (validadas com o usuário)

- **Adicionar:** colar link → preview automático (título + imagem confiáveis via Open Graph; preço best-effort) com fallback/edição manual sempre disponível.
- **Atributos:** prioridade, preço, categoria e nota (além de título/imagem/link).
- **Conquistado:** ao comprar/ganhar, o item vai para um arquivo "Conquistados" (sai da lista de Ativos; histórico preservado; dá pra desfazer).
- **Layout:** lista rica — cada item numa linha com thumb, preço, badge de prioridade e categoria; segmento Ativos/Conquistados; chips de categoria; total ativo no rodapé.
- **Categoria:** texto livre; os chips de filtro derivam das categorias existentes (sem tela de gerenciamento).
- **Moeda:** apenas BRL nesta fatia (sem multi-moeda).

## Arquitetura — módulo plugável

A Lista de Desejos entra pela arquitetura existente: um descritor `HubModule` é adicionado a `MODULES`, e a home/captura/quick-actions o reconhecem automaticamente. O `_layout.tsx` recebe as `<Stack.Screen>` das novas rotas (restrição de roteamento por arquivos do Expo Router, já documentada na Fatia 1).

### Estrutura de arquivos

```
modules/wishlist/module.ts        # descritor: id 'wishlist', título 'Desejos',
                                  # gradiente rosa, route '/wishlist',
                                  # useTileData (contador de ativos), capture 'Desejo'
convex/schema.ts (modificar)      # + tabela wishlistItems
convex/wishlist.ts (criar)        # queries, mutations e a action getLinkPreview
app/wishlist/index.tsx (criar)    # tela da lista (Ativos/Conquistados + chips + total)
app/wishlist/add.tsx (criar)      # fluxo de adicionar/editar (colar link → preview → salvar)
app/_layout.tsx (modificar)       # + Stack.Screen 'wishlist/index' e 'wishlist/add'
components/wishlist/
  WishlistCard.tsx                # linha da lista (thumb, título, preço, prioridade, categoria)
  PriorityBadge.tsx               # selo de prioridade colorido
  CategoryChips.tsx               # chips de filtro derivados das categorias existentes
  PrioritySelector.tsx            # 3 botões de prioridade no form
```

Tudo seguindo os padrões existentes: tema de `constants/theme.ts`, `ThemedView`, `useColorScheme`, Convex `useQuery`/`useMutation`/`useAction`, `Skeleton` para carregamento, `expo-haptics` para feedback.

## Modelo de dados (Convex)

```ts
wishlistItems: defineTable({
  title: v.string(),
  link: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  price: v.optional(v.number()),        // BRL
  priority: v.union(
    v.literal("high"),    // quero muito
    v.literal("medium"),  // médio
    v.literal("low")      // um dia
  ),
  category: v.optional(v.string()),     // texto livre
  note: v.optional(v.string()),
  acquired: v.boolean(),                // false = Ativos, true = Conquistados
  acquiredAt: v.optional(v.number()),
  createdAt: v.number(),
}).index("by_acquired", ["acquired"])
```

### Queries / mutations (`convex/wishlist.ts`)

- `listWishlistItems({ acquired })` — itens filtrados por `acquired`, ordenados por prioridade (high→low) e depois `createdAt` desc. Usa o índice `by_acquired`.
- `getWishlistStats()` — `{ activeCount, activeTotal }` (contagem e soma de preços dos ativos) para o tile do hub e o rodapé.
- `createWishlistItem({ title, link?, imageUrl?, price?, priority, category?, note? })` — insere com `acquired:false`, `createdAt:now`.
- `updateWishlistItem({ id, ...campos opcionais })` — patch dos campos editáveis.
- `setAcquired({ id, acquired })` — alterna `acquired` e grava/limpa `acquiredAt`.
- `deleteWishlistItem({ id })`.

### Action de preview de link

- `getLinkPreview({ url })` → `{ title?, imageUrl?, price? }`.
  - `fetch` da URL com timeout de ~8s e um User-Agent de navegador.
  - Extrai `og:title`/`twitter:title`/`<title>` para o título; `og:image`/`twitter:image` para a imagem.
  - Preço best-effort: `og:price:amount` / `product:price:amount` / JSON-LD `offers.price` quando presentes; caso contrário, indefinido.
  - Qualquer falha (timeout, status não-2xx, parsing) resolve com objeto vazio — nunca lança para a tela.

## Telas e fluxos

### Lista (`app/wishlist/index.tsx`, rota `/wishlist`)
- Header "🛍️ Desejos" + botão "＋" (abre `/wishlist/add`).
- Segmento **Ativos / Conquistados** (estado local; troca o `acquired` passado à query).
- **CategoryChips**: "Todos" + categorias distintas presentes nos itens carregados; filtro client-side por categoria selecionada.
- Lista de `WishlistCard`. Ações por item via toque longo (Android: ActionSheet existente; iOS: `ActionSheetIOS`, mesmo padrão da tela de Ideias): **Conquistado/Reativar**, **Editar**, **Excluir** (excluir confirma via `Alert`).
- Rodapé com **total ativo** (`activeTotal`) visível só na aba Ativos.
- Vazio: estado caprichado ("Sua lista de desejos está vazia — cola um link pra começar" + botão).
- Carregamento: `Skeleton`.

### Adicionar / Editar (`app/wishlist/add.tsx`)
- Modo adicionar: campo de link no topo + botão "Buscar"; ao tocar, chama `getLinkPreview`, mostra loading curto e preenche título/imagem/preço. Falha → preenche nada e mostra aviso sutil ("não consegui ler esse link, preenche na mão 🙂"); o form continua utilizável.
- Campos: título (obrigatório), preço (numérico opcional), **PrioritySelector** (3 botões; default "médio"), categoria (texto com sugestões das categorias existentes), nota (multiline opcional), preview da imagem quando houver.
- Modo editar: mesma tela recebendo `id` via params; pré-preenche e pula a etapa de busca (link editável).
- Salvar → `createWishlistItem`/`updateWishlistItem` → `router.back()`.

### Conquistar
- `setAcquired({ id, acquired:true })` → item sai dos Ativos e aparece em Conquistados; haptic + micro-feedback (✨) no toque. Em Conquistados, ação "Reativar" chama `setAcquired(false)`.

### Captura rápida
- O descritor declara `capture` com label "Desejo", ícone 🛍️, `quickActionId: 'capture-wishlist'`, `quickActionIcon` (ios `symbol:bag.fill`, android `bag`), e `onTrigger: (router) => router.push('/wishlist/add')`. Aparece automaticamente na folha "＋" e nas quick actions do sistema.

## Identidade visual

- Accent rosa `#ec4899`; gradiente do tile `['#ec4899', '#db2777']`.
- Prioridade colorida: quero muito = rosa forte, médio = roxo, um dia = cinza.
- Imagens com cantos arredondados; placeholder com ícone quando ausentes.
- Espaçamento e sombras coerentes com os componentes do hub.

## Tratamento de erros

- `getLinkPreview` nunca lança para a UI (sempre objeto possivelmente vazio); o form segue manual.
- Queries `undefined` → Skeletons.
- Mutations com try/catch + `Alert` de erro (padrão da tela de Ideias).
- Excluir pede confirmação via `Alert`.

## Testes e verificação

- `./node_modules/.bin/tsc.exe --noEmit` (binário local; `npx tsc` não funciona neste repo) e `npm run lint` limpos.
- Verificação manual: adicionar via link (preview preenche), ajustar prioridade/categoria/nota, salvar, conquistar (vai pra Conquistados), reativar, filtrar por categoria, ver total ativo.
- **Flows do Maestro** de caminho feliz: abrir Desejos a partir do hub; abrir o "＋"; salvar um item manual e vê-lo na lista. (Os flows não dependem de preview de link para não ficarem flaky.)
- Teste leve da action `getLinkPreview` só se houver fôlego; o foco é o caminho feliz.

## Fora de escopo (futuro)

- Multi-moeda, conversão e rastreamento de preço ao longo do tempo.
- Compartilhar lista / presentear.
- Notificações de queda de preço.
- Módulo Lista de Compras (Fatia 3).
