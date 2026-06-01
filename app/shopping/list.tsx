import { SkeletonCard } from '@/components/Skeleton';
import { ShoppingRow } from '@/components/shopping/ShoppingRow';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatArchivedLabel } from '@/utils/date';
import { useMutation, useQuery } from 'convex/react';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ShoppingListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const c = Colors[useColorScheme() ?? 'light'];
  const params = useLocalSearchParams<{ id?: string }>();
  const listId = params.id ?? '';

  const items = useQuery(api.shopping.listItemsByList, listId ? { listId } : 'skip');
  const reuseList = useMutation(api.shopping.reuseList);

  const archivedAt = items && items.length > 0 ? items[0].archivedAt : undefined;

  const handleReuse = () => {
    Alert.alert('Reutilizar lista', 'Copiar os itens desta lista para a lista atual?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Copiar',
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await reuseList({ listId });
          router.replace('/shopping' as Href);
        },
      },
    ]);
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={[styles.back, { color: c.tint }]}>Voltar</Text>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          {archivedAt ? formatArchivedLabel(archivedAt) : 'Lista'}
        </ThemedText>
      </View>

      {items === undefined ? (
        <View style={{ marginTop: 12 }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <ThemedText style={[styles.emptyText, { color: c.muted }]}>Lista vazia</ThemedText>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => (
            <ShoppingRow
              name={item.name}
              checked={item.checked}
              quantity={item.quantity}
              onToggle={() => {}}
              onLongPress={() => {}}
            />
          )}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 96 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {items && items.length > 0 && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleReuse}
          style={[styles.reuseBtn, { backgroundColor: '#10b981', bottom: insets.bottom + 16 }]}
        >
          <Text style={styles.reuseText}>Reutilizar no hoje</Text>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  header: { marginBottom: 16 },
  back: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.8, textTransform: 'capitalize' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 15, textAlign: 'center' },
  reuseBtn: { position: 'absolute', left: 24, right: 24, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  reuseText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
