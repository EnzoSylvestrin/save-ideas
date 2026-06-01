import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import * as QuickActions from 'expo-quick-actions';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { MODULES } from '@/modules/registry';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || '';

if (!convexUrl) {
  console.warn('EXPO_PUBLIC_CONVEX_URL não está configurada. Configure no arquivo .env');
}

const convex = new ConvexReactClient(convexUrl);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

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

  return (
    <SafeAreaProvider>
      <ConvexProvider client={convex}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="ideas/index" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="wishlist/index" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="wishlist/add" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="project-detail" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="quick-record" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
            <Stack.Screen name="idea-detail" options={{ headerShown: false, presentation: 'card' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ConvexProvider>
    </SafeAreaProvider>
  );
}
