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
