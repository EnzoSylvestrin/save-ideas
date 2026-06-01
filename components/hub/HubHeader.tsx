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
