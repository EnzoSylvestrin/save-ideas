# Hub Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o app `save-ideas` num hub launcher extensível, com registro central de módulos e captura unificada, migrando as Ideias existentes para a nova estrutura.

**Architecture:** Um descritor `HubModule` + um array `MODULES` (única fonte da verdade) alimentam três superfícies que se montam sozinhas: a home launcher, a folha de captura "＋" e as quick actions do sistema. As telas das Ideias permanecem; só a lista raiz é movida de `app/index.tsx` para `app/ideas/index.tsx`, e `app/index.tsx` vira o launcher.

**Tech Stack:** Expo ~54, Expo Router 6, Convex, React Native 0.81, TypeScript, expo-quick-actions, expo-haptics, expo-linear-gradient (a adicionar).

**Nota sobre testes (lida com a regra de TDD da skill):** o projeto não tem runner de testes e a Fatia 1 é quase toda UI/integração Expo, que não dá pra cobrir com testes unitários úteis. Conforme o spec aprovado, o portão de verificação de cada task é: **`npx tsc --noEmit` limpo + `npm run lint` limpo + verificação manual no app**. Testes automatizados ficam para quando houver lógica de domínio real (Fatia 2: auto-fetch de link).

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `convex/ideas.ts` (modificar) | + query `getHubOverview` (contagens p/ o tile) |
| `modules/types.ts` (criar) | Tipos `HubModule`, `ModuleCapture`, `ModuleTileData`, `AppRouter` |
| `modules/registry.ts` (criar) | Array `MODULES` — única fonte da verdade |
| `modules/ideas/module.ts` (criar) | Descritor do módulo Ideias |
| `components/hub/HubHeader.tsx` (criar) | Saudação + data |
| `components/hub/ModuleTile.tsx` (criar) | Bloco com gradiente + preview vivo |
| `components/hub/CaptureSheet.tsx` (criar) | Folha "Capturar…" gerada de `MODULES` |
| `app/ideas/index.tsx` (criar via move) | Lista de projetos (conteúdo da home antiga) |
| `app/index.tsx` (substituir) | Nova home launcher |
| `app/_layout.tsx` (modificar) | Registrar rota `ideas/index`; quick actions dinâmicas |

---

## Task 1: Dependência de gradiente + query de overview

**Files:**
- Modify: `convex/ideas.ts`
- Modify: `package.json` (via `expo install`)

- [ ] **Step 1: Instalar expo-linear-gradient**

Run: `npx expo install expo-linear-gradient`
Expected: adiciona `expo-linear-gradient` em `package.json` sem erros de peer-deps.

- [ ] **Step 2: Adicionar a query `getHubOverview` ao final de `convex/ideas.ts`**

Adicione (antes ou depois das outras exports, mantendo os imports `query` já existentes):

```ts
export const getHubOverview = query({
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    const ideas = await ctx.db.query("ideas").collect();
    return {
      projectCount: projects.length,
      ideaCount: ideas.length,
    };
  },
});
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS (sem erros). A query nova aparecerá em `api.ideas.getHubOverview` após o Convex regenerar os tipos; se `_generated` ainda não tiver, rode `npx convex codegen` e refaça o type-check.

- [ ] **Step 4: Commit**

```bash
git add convex/ideas.ts convex/_generated package.json bun.lock
git commit -m "feat: add expo-linear-gradient and getHubOverview query"
```

---

## Task 2: Tipos de módulo + registro + descritor das Ideias

**Files:**
- Create: `modules/types.ts`
- Create: `modules/ideas/module.ts`
- Create: `modules/registry.ts`

- [ ] **Step 1: Criar `modules/types.ts`**

```ts
import type { useRouter } from 'expo-router';

export type AppRouter = ReturnType<typeof useRouter>;

export type ModuleTileData = {
  count?: number;
  hint?: string;
};

export type ModuleCapture = {
  /** Texto principal na folha de captura, ex: 'Ideia (voz)' */
  label: string;
  /** Subtexto explicativo na folha de captura */
  subtitle: string;
  /** Emoji/símbolo exibido na folha de captura */
  icon: string;
  /** Id estável usado pelas quick actions do sistema */
  quickActionId: string;
  /** Ícone das quick actions por plataforma (formato do expo-quick-actions) */
  quickActionIcon: { ios: string; android: string };
  /** O que acontece ao acionar a captura (folha ou quick action) */
  onTrigger: (router: AppRouter) => void;
};

export type HubModule = {
  /** Identificador único, ex: 'ideas' */
  id: string;
  /** Nome exibido no bloco da home */
  title: string;
  /** Emoji/símbolo do bloco */
  icon: string;
  /** Cores do gradiente do bloco [início, fim] */
  gradient: readonly [string, string];
  /** Rota da tela do módulo (Expo Router), ex: '/ideas' */
  route: string;
  /** Hook opcional para preview vivo no bloco (usa Convex) */
  useTileData?: () => ModuleTileData;
  /** Se presente, o módulo entra na folha "＋" e nas quick actions */
  capture?: ModuleCapture;
};
```

- [ ] **Step 2: Criar `modules/ideas/module.ts`**

```ts
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import type { HubModule } from '../types';

function useIdeasTileData() {
  const overview = useQuery(api.ideas.getHubOverview);
  if (!overview) return {};
  return {
    count: overview.ideaCount,
    hint:
      overview.projectCount === 1
        ? '1 projeto'
        : `${overview.projectCount} projetos`,
  };
}

export const ideasModule: HubModule = {
  id: 'ideas',
  title: 'Ideias',
  icon: '💡',
  gradient: ['#6366f1', '#4f46e5'],
  route: '/ideas',
  useTileData: useIdeasTileData,
  capture: {
    label: 'Ideia (voz)',
    subtitle: 'Grava e a IA organiza',
    icon: '💡',
    quickActionId: 'capture-ideas',
    quickActionIcon: { ios: 'symbol:mic.fill', android: 'mic' },
    onTrigger: (router) => router.push('/quick-record'),
  },
};
```

- [ ] **Step 3: Criar `modules/registry.ts`**

```ts
import type { HubModule } from './types';
import { ideasModule } from './ideas/module';

/**
 * Única fonte da verdade dos módulos do hub.
 * Adicionar um módulo = importar o descritor e colocá-lo neste array.
 * Home, folha de captura e quick actions se montam a partir daqui.
 */
export const MODULES: HubModule[] = [ideasModule];
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS. Se acusar que `api.ideas.getHubOverview` não existe, rode `npx convex codegen` (Task 1 precisa ter sido aplicada) e refaça.

- [ ] **Step 5: Commit**

```bash
git add modules/
git commit -m "feat: add hub module registry with ideas descriptor"
```

---

## Task 3: Componentes do hub (header, tile, folha de captura)

**Files:**
- Create: `components/hub/HubHeader.tsx`
- Create: `components/hub/ModuleTile.tsx`
- Create: `components/hub/CaptureSheet.tsx`

- [ ] **Step 1: Criar `components/hub/HubHeader.tsx`**

```tsx
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, Text, View } from 'react-native';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function HubHeader() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <View style={styles.header}>
      <Text style={[styles.greeting, { color: c.text }]}>{getGreeting()} 👋</Text>
      <Text style={[styles.date, { color: c.muted }]}>{dateStr}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 40,
    includeFontPadding: false,
  },
  date: { fontSize: 15, fontWeight: '500', marginTop: 4, textTransform: 'capitalize' },
});
```

- [ ] **Step 2: Criar `components/hub/ModuleTile.tsx`**

```tsx
import type { HubModule } from '@/modules/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function ModuleTile({ module }: { module: HubModule }) {
  const router = useRouter();
  const data = module.useTileData?.() ?? {};

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(module.route as Href)}
    >
      <LinearGradient
        colors={module.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tile}
      >
        <Text style={styles.icon}>{module.icon}</Text>
        <View>
          <Text style={styles.name}>{module.title}</Text>
          {data.count !== undefined && (
            <Text style={styles.count}>
              {data.count}
              {data.hint ? ` · ${data.hint}` : ''}
            </Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    height: 130,
    borderRadius: 22,
    padding: 16,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  icon: { fontSize: 26 },
  name: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  count: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5, fontWeight: '600', marginTop: 2 },
});
```

- [ ] **Step 3: Criar `components/hub/CaptureSheet.tsx`**

```tsx
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MODULES } from '@/modules/registry';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CaptureSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const captureModules = MODULES.filter((m) => m.capture);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Pressable interno captura o toque p/ não fechar ao tocar na folha */}
        <Pressable
          style={[styles.sheet, { backgroundColor: c.background, paddingBottom: insets.bottom + 16 }]}
          onPress={() => {}}
        >
          <View style={[styles.handle, { backgroundColor: c.border }]} />
          <Text style={[styles.title, { color: c.text }]}>Capturar…</Text>
          {captureModules.map((m) => (
            <TouchableOpacity
              key={m.id}
              activeOpacity={0.7}
              style={[styles.row, { backgroundColor: c.cardBackground, borderColor: c.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onClose();
                m.capture!.onTrigger(router);
              }}
            >
              <Text style={styles.rowIcon}>{m.capture!.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: c.text }]}>{m.capture!.label}</Text>
                <Text style={[styles.rowSub, { color: c.muted }]}>{m.capture!.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12 },
  handle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  rowIcon: { fontSize: 24 },
  rowLabel: { fontSize: 15, fontWeight: '700' },
  rowSub: { fontSize: 12.5, fontWeight: '500', marginTop: 2 },
});
```

- [ ] **Step 4: Type-check + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS em ambos.

- [ ] **Step 5: Commit**

```bash
git add components/hub/
git commit -m "feat: add hub UI components (header, tile, capture sheet)"
```

---

## Task 4: Trocar a home pelo launcher (move + nova index)

**Files:**
- Move: `app/index.tsx` → `app/ideas/index.tsx`
- Modify: `app/ideas/index.tsx` (renomear componente)
- Create: `app/index.tsx` (launcher)
- Modify: `app/_layout.tsx` (registrar `ideas/index`)

- [ ] **Step 1: Mover a lista de projetos para a rota `/ideas`**

Run: `git mv app/index.tsx app/ideas/index.tsx`
Expected: arquivo movido; `git status` mostra rename.

- [ ] **Step 2: Renomear o componente em `app/ideas/index.tsx`**

Em `app/ideas/index.tsx`, troque a linha:

```tsx
export default function HomeScreen() {
```

por:

```tsx
export default function IdeasScreen() {
```

Não altere mais nada neste arquivo — toda a lógica de projetos/quick record continua igual, agora servida em `/ideas`.

- [ ] **Step 3: Registrar a rota no `app/_layout.tsx`**

Dentro do `<Stack>` em `app/_layout.tsx`, adicione a linha da nova rota logo após a do `index`:

```tsx
<Stack.Screen name="index" options={{ headerShown: false }} />
<Stack.Screen name="ideas/index" options={{ headerShown: false, presentation: 'card' }} />
```

- [ ] **Step 4: Criar a nova home launcher `app/index.tsx`**

```tsx
import { CaptureSheet } from '@/components/hub/CaptureSheet';
import { HubHeader } from '@/components/hub/HubHeader';
import { ModuleTile } from '@/components/hub/ModuleTile';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MODULES } from '@/modules/registry';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HubScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const [showCapture, setShowCapture] = useState(false);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <HubHeader />
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {MODULES.map((m) => (
          <View key={m.id} style={styles.cell}>
            <ModuleTile module={m} />
          </View>
        ))}
        <View style={styles.cell}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.addTile, { borderColor: c.border }]}
            onPress={() => setShowCapture(true)}
          >
            <Text style={[styles.addPlus, { color: c.muted }]}>＋</Text>
            <Text style={[styles.addLabel, { color: c.muted }]}>Capturar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <CaptureSheet visible={showCapture} onClose={() => setShowCapture(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  cell: { width: '48%', marginBottom: 16 },
  addTile: {
    height: 130,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addPlus: { fontSize: 32, fontWeight: '300' },
  addLabel: { fontSize: 13, fontWeight: '600' },
});
```

- [ ] **Step 5: Type-check + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS em ambos.

- [ ] **Step 6: Verificação manual**

Run: `npx expo start` (abrir no device/emulador)
Confirmar:
- A home agora mostra o header de saudação + bloco "Ideias" (com gradiente indigo e contador) + bloco "＋ Capturar".
- Tocar em "Ideias" abre a lista de projetos, idêntica ao comportamento antigo (criar/editar/excluir projeto, mic de gravação).
- Tocar em "＋ Capturar" abre a folha; "Ideia (voz)" abre `/quick-record` já gravando.

- [ ] **Step 7: Commit**

```bash
git add app/index.tsx app/ideas/index.tsx app/_layout.tsx
git commit -m "feat: launcher home with ideas migrated to /ideas route"
```

---

## Task 5: Quick actions dinâmicas a partir do registro

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Substituir o bloco de quick actions no `app/_layout.tsx`**

Troque o `useEffect` atual (que faz `QuickActions.setItems([...])` fixo para 'quick-record' e o `addListener` que só trata `'quick-record'`) por uma versão gerada de `MODULES`. O `useEffect` deve ficar assim:

```tsx
useEffect(() => {
  const captureModules = MODULES.filter((m) => m.capture);

  try {
    QuickActions.setItems(
      captureModules.map((m) => ({
        id: m.capture!.quickActionId,
        title: m.capture!.label,
        subtitle: m.capture!.subtitle,
        icon: Platform.OS === 'ios'
          ? m.capture!.quickActionIcon.ios
          : m.capture!.quickActionIcon.android,
        params: { moduleId: m.id },
      }))
    );
  } catch (e) {
    console.warn('Não foi possível registrar quick actions', e);
  }

  const subscription = QuickActions.addListener((action) => {
    const mod = MODULES.find((m) => m.capture?.quickActionId === action.id);
    if (mod?.capture) {
      mod.capture.onTrigger(router);
    }
  });

  return () => {
    subscription.remove();
  };
}, [router]);
```

- [ ] **Step 2: Adicionar o import de `MODULES` no topo de `app/_layout.tsx`**

```tsx
import { MODULES } from '@/modules/registry';
```

(`QuickActions`, `Platform`, `useEffect`, `useRouter` já estão importados no arquivo.)

- [ ] **Step 3: Type-check + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS em ambos.

- [ ] **Step 4: Verificação manual**

Build de dev (`npx expo run:android` ou `run:ios`, pois quick actions exigem build nativo, não Expo Go) e confirmar:
- Segurar o ícone do app mostra o atalho "Ideia (voz)".
- Tocar no atalho abre o app direto em `/quick-record` gravando.

- [ ] **Step 5: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: generate system quick actions from module registry"
```

---

## Self-Review (preenchido)

**Cobertura do spec:**
- Arquitetura de módulos plugáveis → Task 2.
- Estrutura de arquivos (move ideas, novo index) → Task 4.
- Home launcher / fluxo de dados → Tasks 3 e 4.
- Folha de captura → Task 3 + Task 4 (integração).
- Quick actions dinâmicas → Task 5.
- Identidade visual (gradientes, header, haptics) → Tasks 1 (lib), 3.
- Migração das Ideias sem reescrita → Task 4 (git mv + rename).
- Verificação (typecheck/lint/manual) → portões em cada task.

**Placeholders:** nenhum "TBD/TODO". Todos os steps de código têm código completo.

**Consistência de tipos:** `HubModule`, `ModuleCapture` (com `quickActionId`, `quickActionIcon`, `onTrigger`), `ModuleTileData`, `AppRouter` definidos em Task 2 e usados exatamente assim em Tasks 3 e 5. `getHubOverview` (Task 1) → consumido em `useIdeasTileData` (Task 2). Rota `/ideas` definida no descritor (Task 2) e registrada no `_layout` (Task 4).
