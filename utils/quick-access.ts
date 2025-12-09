import * as Linking from 'expo-linking';

const QUICK_RECORD_URL = 'saveideas://quick-record';

/**
 * Abre a tela de gravação rápida usando deep link
 * Útil para criar atalhos e comandos de voz
 */
export async function openQuickRecord(): Promise<void> {
  const url = QUICK_RECORD_URL;
  
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      console.warn('Não foi possível abrir o deep link. Certifique-se de que o app está instalado.');
    }
  } catch (error) {
    console.error('Erro ao abrir gravação rápida:', error);
  }
}

/**
 * Retorna a URL do deep link para gravação rápida
 * Útil para configurar atalhos e widgets
 */
export function getQuickRecordUrl(): string {
  return QUICK_RECORD_URL;
}

/**
 * Instruções para configurar atalhos em cada plataforma
 */
export const QUICK_ACCESS_INSTRUCTIONS = {
  ios: {
    siri: '1. Abra o app "Atalhos"\n2. Crie um novo atalho\n3. Adicione "Abrir URLs"\n4. URL: saveideas://quick-record\n5. Adicione à Siri',
    widget: '1. Toque e segure na tela inicial\n2. Toque no "+"\n3. Procure "Atalhos"\n4. Adicione o widget do atalho',
  },
  android: {
    shortcut: '1. Segure o ícone do app\n2. Toque em "Gravar Ideia Rápida"\n3. Ou use apps como "Shortcut Maker"',
    assistant: '1. Abra Google Assistant\n2. Configure rotina\n3. Comando: "Gravar ideia"\n4. Ação: Abrir app Save Ideas',
  },
};

