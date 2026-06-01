import { ActionSheet } from '@/components/ActionSheet';
import { SkeletonCard } from '@/components/Skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CATEGORY_ALL, CategoryChips } from '@/components/wishlist/CategoryChips';
import { WishlistCard } from '@/components/wishlist/WishlistCard';
import { Colors } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatBRL } from '@/utils/currency';
import { useMutation, useQuery } from 'convex/react';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActionSheetIOS, Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WishlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = Colors[useColorScheme() ?? 'light'];

  const [showAcquired, setShowAcquired] = useState(false);
  const [category, setCategory] = useState(CATEGORY_ALL);
  const [sheetItemId, setSheetItemId] = useState<Id<'wishlistItems'> | null>(null);

  const items = useQuery(api.wishlist.listWishlistItems, { acquired: showAcquired });
  const stats = useQuery(api.wishlist.getWishlistStats);
  const setAcquired = useMutation(api.wishlist.setAcquired);
  const deleteItem = useMutation(api.wishlist.deleteWishlistItem);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (items ?? []).forEach((i) => i.category && set.add(i.category));
    return Array.from(set);
  }, [items]);

  const visible = useMemo(
    () => (items ?? []).filter((i) => category === CATEGORY_ALL || i.category === category),
    [items, category]
  );

  const openActions = (id: Id<'wishlistItems'>) => {
    const acquireLabel = showAcquired ? 'Reativar' : 'Marquei como conquistado';
    const onAcquire = async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await setAcquired({ id, acquired: !showAcquired });
    };
    const onEdit = () => router.push({ pathname: '/wishlist/add', params: { id } });
    const onDelete = () =>
      Alert.alert('Excluir desejo', 'Tem certeza? Esta ação não pode ser desfeita.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteItem({ id }) },
      ]);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancelar', acquireLabel, 'Editar', 'Excluir'], destructiveButtonIndex: 3, cancelButtonIndex: 0 },
        (i) => {
          if (i === 1) onAcquire();
          else if (i === 2) onEdit();
          else if (i === 3) onDelete();
        }
      );
    } else {
      setSheetItemId(id);
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>🛍️ Desejos</ThemedText>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/wishlist/add')}
          style={[styles.addBtn, { backgroundColor: '#ec4899' }]}
        >
          <Text style={styles.addPlus}>＋</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.segment}>
        {[{ k: false, label: 'Ativos' }, { k: true, label: 'Conquistados' }].map((s) => (
          <TouchableOpacity
            key={s.label}
            activeOpacity={0.8}
            onPress={() => { setShowAcquired(s.k); setCategory(CATEGORY_ALL); }}
            style={[styles.segBtn, { backgroundColor: showAcquired === s.k ? '#ec4899' : c.cardBackground }]}
          >
            <Text style={[styles.segLabel, { color: showAcquired === s.k ? '#fff' : c.muted }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {categories.length > 0 && (
        <CategoryChips categories={categories} selected={category} onSelect={setCategory} />
      )}

      {items === undefined ? (
        <View style={{ marginTop: 12 }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : visible.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛍️</Text>
          <ThemedText style={[styles.emptyTitle, { color: c.text }]}>
            {showAcquired ? 'Nada conquistado ainda' : 'Sua lista de desejos está vazia'}
          </ThemedText>
          {!showAcquired && (
            <ThemedText style={[styles.emptyText, { color: c.muted }]}>
              Cola um link pra começar
            </ThemedText>
          )}
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => (
            <WishlistCard
              item={item}
              onPress={() => router.push({ pathname: '/wishlist/add', params: { id: item._id } })}
              onLongPress={() => openActions(item._id)}
            />
          )}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {!showAcquired && stats && stats.activeCount > 0 && (
        <View style={[styles.totalBar, { paddingBottom: insets.bottom + 12, borderTopColor: c.border }]}>
          <Text style={[styles.totalText, { color: c.muted }]}>
            Total ativo · {formatBRL(stats.activeTotal)}
          </Text>
        </View>
      )}

      {Platform.OS === 'android' && (
        <ActionSheet
          visible={sheetItemId !== null}
          options={[
            {
              label: showAcquired ? 'Reativar' : 'Marquei como conquistado',
              onPress: async () => {
                if (sheetItemId) {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  await setAcquired({ id: sheetItemId, acquired: !showAcquired });
                }
              },
            },
            {
              label: 'Editar',
              onPress: () => sheetItemId && router.push({ pathname: '/wishlist/add', params: { id: sheetItemId } }),
            },
            {
              label: 'Excluir',
              destructive: true,
              onPress: () => {
                const id = sheetItemId;
                if (!id) return;
                Alert.alert('Excluir desejo', 'Tem certeza? Esta ação não pode ser desfeita.', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Excluir', style: 'destructive', onPress: () => deleteItem({ id }) },
                ]);
              },
            },
          ]}
          onCancel={() => setSheetItemId(null)}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.8 },
  addBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  addPlus: { color: '#fff', fontSize: 26, fontWeight: '300', lineHeight: 30 },
  segment: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  segBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  segLabel: { fontSize: 12.5, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  totalBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, alignItems: 'flex-end' },
  totalText: { fontSize: 13, fontWeight: '700' },
});
