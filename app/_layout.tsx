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

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || '';

if (!convexUrl) {
  console.warn('EXPO_PUBLIC_CONVEX_URL não está configurada. Configure no arquivo .env');
}

const convex = new ConvexReactClient(convexUrl);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    QuickActions.setItems([
      {
        id: 'quick-record',
        title: 'Gravar Ideia',
        subtitle: 'Iniciar uma nova gravação',
        icon: Platform.OS === 'ios' ? 'symbol:mic.fill' : 'mic',
        params: { href: '/quick-record' },
      },
    ]);

    const subscription = QuickActions.addListener((action) => {
      if (action.id === 'quick-record') {
        router.push('/quick-record');
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
