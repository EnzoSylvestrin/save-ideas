# Hub Foundation — Design (Fatia 1)

**Data:** 2026-06-01
**Status:** Aprovado para implementação
**Escopo:** Transformar o app `save-ideas` num "hub" de soluções extensível. Esta é a **primeira fatia** de três; ela entrega a fundação e migra as Ideias existentes para dentro dela.

## Contexto

O app hoje é um capturador de ideias: lista de **projetos** → **ideias** dentro de cada projeto, com gravação de áudio, transcrição e processamento por IA (OpenAI). Stack: Expo (~54) + Expo Router + Convex + React Native 0.81. Tema indigo (`#6366f1`) com paleta slate light/dark em `constants/theme.ts`. Já existem `expo-quick-actions` (um atalho fixo "Gravar Ideia") e `expo-haptics`.

O objetivo do usuário é evoluir isso para um hub pessoal com várias soluções. As três primeiras soluções serão **Ideias** (já existe), **Lista de Desejos** e **Lista de Compras**. O usuário priorizou UX/UI distintiva (nada genérico) e facilidade de uso, e quer que adicionar soluções novas seja fácil.

## Decomposição em fatias

1. **Fundação do Hub** — este documento. Home launcher, arquitetura de módulos plugáveis, captura unificada, migração das Ideias.
2. **Lista de Desejos** — spec próprio depois.
3. **Lista de Compras** — spec próprio depois.

Cada fatia tem seu próprio ciclo spec → plano → implementação.

## Decisões de design (validadas com o usuário)

- **Navegação:** home no estilo **launcher** — grade de blocos coloridos, cada solução é um "app" dentro do app.
- **Captura rápida:** dois caminhos complementares — (1) botão "＋" no app abre uma folha "Capturar…" com uma ação por módulo; (2) **quick actions do sistema** (segurar o ícone do app) com os mesmos atalhos. O atalho de **Ideia abre já gravando**.
- **Extensibilidade:** um registro central de módulos é a única fonte da verdade; home, folha de captura e quick actions se montam a partir dele.

## Arquitetura: módulos plugáveis

### Descritor de módulo

```ts
// modules/types.ts
import type { Router } from 'expo-router';

export type ModuleTileData = { count?: number; hint?: string };

export type ModuleCapture = {
  label: string;        // 'Ideia (voz)'
  subtitle: string;     // 'Grava e a IA organiza'
  icon: string;         // emoji/símbolo exibido na folha de captura
  quickActionId: string;// id estável p/ expo-quick-actions (ex: 'capture-ideas')
  onTrigger: (router: Router) => void; // o que fazer ao acionar a captura
};

export type HubModule = {
  id: string;                 // 'ideas' | 'wishlist' | 'shopping'
  title: string;              // 'Ideias'
  icon: string;               // emoji/símbolo do bloco
  gradient: [string, string]; // cores do gradiente do bloco na home
  route: string;              // rota da tela do módulo, ex: '/ideas'
  useTileData?: () => ModuleTileData; // hook p/ preview vivo no bloco (Convex)
  capture?: ModuleCapture;    // se presente, entra na folha "＋" e nas quick actions
};
```

### Registro central

```ts
// modules/registry.ts — a ÚNICA fonte da verdade
import { ideasModule } from './ideas/module';

export const MODULES: HubModule[] = [ideasModule];
// Adicionar um módulo = importar o descritor e colocá-lo neste array. Nada mais.
```

A partir de `MODULES`, três superfícies se montam automaticamente:
- **Home launcher** → mapeia todos os módulos em blocos.
- **Folha de captura** → mapeia `MODULES.filter(m => m.capture)`.
- **Quick actions do SO** → gera os itens a partir de `MODULES.filter(m => m.capture)`.

### Restrição do Expo Router (file-based routing)

As rotas do Expo Router são baseadas em arquivos, então cada módulo ainda precisa de seus arquivos de tela reais sob `app/`. O campo `route` do descritor aponta para esses arquivos. "Adicionar um módulo" então significa, na prática: **criar a pasta de telas do módulo sob `app/` + adicionar 1 descritor ao registro**. O registro elimina o trabalho repetitivo nas três superfícies (home/captura/quick actions), que é onde o atrito real mora.

## Estrutura de arquivos

```
modules/
  types.ts            # tipo HubModule e auxiliares
  registry.ts         # array MODULES
  ideas/
    module.ts         # descritor das Ideias (aponta p/ telas existentes)
app/
  index.tsx           # NOVA home launcher (substitui a lista de projetos)
  ideas/
    index.tsx         # lista de projetos (movida da home antiga)
  project-detail.tsx  # inalterado
  idea-detail.tsx     # inalterado
  quick-record.tsx    # inalterado (vira o onTrigger do módulo Ideias)
  _layout.tsx         # quick actions geradas a partir de MODULES
components/
  hub/
    ModuleTile.tsx    # bloco da home (chama module.useTileData)
    CaptureSheet.tsx  # folha "＋"
    HubHeader.tsx     # saudação + data
```

A lógica das Ideias **não é reescrita**. A lista de projetos que hoje vive em `app/index.tsx` é movida para `app/ideas/index.tsx`; `app/index.tsx` passa a ser o launcher. As telas `project-detail`, `idea-detail` e `quick-record` permanecem como estão. Toda a criação/edição/exclusão de projetos e a captura por voz continuam idênticas.

## Fluxo de dados

### Home launcher (`app/index.tsx`)
- Renderiza `HubHeader` (saudação + data) e uma grade de `<ModuleTile module={m} />`, um por item de `MODULES`, mais um bloco "＋" que abre a `CaptureSheet`.
- Cada `ModuleTile` chama `module.useTileData?.()` internamente. Como `MODULES` é um array fixo e ordenado, a contagem de hooks é estável entre renders (regra dos hooks respeitada).
- `ideasModule.useTileData` usa `useQuery` do Convex para trazer o total de projetos/ideias e um hint (ex: título do último projeto). Estado de carregamento usa os componentes `Skeleton` existentes.
- Tocar num bloco → `router.push(module.route)`.

### Captura (`CaptureSheet`)
- Mapeia `MODULES.filter(m => m.capture)` e mostra um botão por ação (ícone + label + subtitle).
- Tocar → `capture.onTrigger(router)` + haptic. Para Ideias, navega para `/quick-record` já em modo de gravação.
- A folha é aberta pelo bloco "＋" da home e pode ser reaproveitada como ação global.

### Quick actions do SO (`app/_layout.tsx`)
- Substitui a lista fixa atual por geração dinâmica:
```ts
QuickActions.setItems(
  MODULES.filter(m => m.capture).map(m => ({
    id: m.capture!.quickActionId,
    title: m.capture!.label,
    subtitle: m.capture!.subtitle,
    icon: Platform.OS === 'ios' ? 'symbol:...' : '...',
    params: { moduleId: m.id },
  }))
);
```
- O listener encontra o módulo pelo `quickActionId`/`moduleId` e chama `capture.onTrigger(router)`. Módulo novo com `capture` aparece nos atalhos sem tocar no `_layout`.

## Identidade visual

- Mantém a base indigo (`#6366f1`) e a paleta slate light/dark de `constants/theme.ts`.
- Cada módulo tem um **gradiente próprio** (Ideias: indigo; reservado p/ Desejos: rosa; Compras: verde) — define o visual de "apps coloridos" do launcher.
- Home: header com saudação + data; grade de blocos com ícone, nome e contador/hint; bloco "＋" tracejado para captura. Espaçamento generoso, cantos arredondados, sombras suaves.
- Haptics (`expo-haptics`) nas ações de captura para sensação premium.

## Tratamento de erros

- Queries do Convex em estado `undefined` → Skeletons (padrão atual).
- Falha ao registrar quick actions não deve quebrar o app (try/catch + warn, como o código atual já tolera ausência de config).
- Navegação para rota inexistente é evitada porque `route`/`onTrigger` vêm de descritores estáticos revisados em build.

## Testes e verificação

O projeto não possui suíte de testes e é um app Expo (teste de UI majoritariamente manual). Para esta fatia:
- `expo lint` e type-check do TypeScript limpos.
- Verificação manual no app:
  - A home mostra o bloco "Ideias" com contador.
  - Tocar em Ideias abre a lista de projetos (comportamento idêntico ao atual).
  - Criar/editar/excluir projeto e a captura por voz funcionam como antes.
  - O botão "＋" abre a folha de captura; "Ideia (voz)" abre `/quick-record` gravando.
  - As quick actions do ícone do app aparecem e acionam a captura correta.
- Teste unitário fica adiado para quando houver lógica de verdade (ex: auto-fetch de link nos Desejos, fatia 2).

## Fora de escopo (fatias futuras)

- Módulos Lista de Desejos e Lista de Compras (telas, schema Convex, lógica).
- Auto-fetch de metadados de link, categorização por IA, itens frequentes, etc.
- Qualquer reescrita da lógica de Ideias além de mover a tela de lista.
