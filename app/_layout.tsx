import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || '';

if (!convexUrl) {
  console.warn('EXPO_PUBLIC_CONVEX_URL não está configurada. Configure no arquivo .env');
}

const convex = new ConvexReactClient(convexUrl);

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ConvexProvider client={convex}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="quick-record" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
            <Stack.Screen name="idea-detail" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ConvexProvider>
    </SafeAreaProvider>
  );
}
