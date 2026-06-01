import { SkeletonCard } from '@/components/Skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatArchivedLabel } from '@/utils/date';
import { useQuery } from 'convex/react';
import { useRouter, type Href } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ShoppingHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const c = Colors[useColorScheme() ?? 'light'];

  const lists = useQuery(api.shopping.listHistory);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={[styles.back, { color: c.tint }]}>Voltar</Text>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>Histórico</ThemedText>
      </View>

      {lists === undefined ? (
        <View style={{ marginTop: 12 }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : lists.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📅</Text>
          <ThemedText style={[styles.emptyTitle, { color: c.text }]}>Nada no histórico ainda</ThemedText>
          <ThemedText style={[styles.emptyText, { color: c.muted }]}>
            Use &quot;Enviar para o histórico&quot; pra guardar uma lista aqui
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(l) => l.listId}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/shopping/list', params: { id: item.listId } } as Href)}
              style={[styles.row, { backgroundColor: c.cardBackground }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.day, { color: c.text }]}>{formatArchivedLabel(item.archivedAt)}</Text>
                <Text style={[styles.meta, { color: c.muted }]}>
                  {item.checked}/{item.total} comprados
                </Text>
              </View>
              <Text style={[styles.chevron, { color: c.muted }]}>›</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  header: { marginBottom: 16 },
  back: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.8 },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, marginBottom: 10 },
  day: { fontSize: 16, fontWeight: '700', textTransform: 'capitalize' },
  meta: { fontSize: 13, fontWeight: '500', marginTop: 3 },
  chevron: { fontSize: 24, fontWeight: '300' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  emptyText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
});
