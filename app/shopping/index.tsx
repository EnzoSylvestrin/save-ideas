import { SkeletonCard } from '@/components/Skeleton';
import { ShoppingRow } from '@/components/shopping/ShoppingRow';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMutation, useQuery } from 'convex/react';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ShoppingScreen() {
  const insets = useSafeAreaInsets();
  const c = Colors[useColorScheme() ?? 'light'];
  const params = useLocalSearchParams<{ focus?: string }>();

  const items = useQuery(api.shopping.listShoppingItems);
  const addItem = useMutation(api.shopping.addShoppingItem);
  const toggleItem = useMutation(api.shopping.toggleShoppingItem);
  const deleteItem = useMutation(api.shopping.deleteShoppingItem);
  const clearChecked = useMutation(api.shopping.clearCheckedItems);

  const [text, setText] = useState('');

  const { total, checked } = useMemo(() => {
    const list = items ?? [];
    return { total: list.length, checked: list.filter((i) => i.checked).length };
  }, [items]);

  const handleAdd = async () => {
    const n = text.trim();
    if (!n) return;
    setText('');
    await addItem({ name: n });
  };

  const handleToggle = async (id: Id<'shoppingItems'>) => {
    await Haptics.selectionAsync();
    await toggleItem({ id });
  };

  const handleLongPress = (id: Id<'shoppingItems'>, name: string) => {
    Alert.alert('Remover item', `Remover "${name}" da lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => deleteItem({ id }) },
    ]);
  };

  const progress = total > 0 ? checked / total : 0;

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>🛒 Compras</ThemedText>
        {checked > 0 && (
          <TouchableOpacity activeOpacity={0.7} onPress={() => clearChecked()}>
            <Text style={[styles.clear, { color: c.muted }]}>Limpar comprados</Text>
          </TouchableOpacity>
        )}
      </View>

      {total > 0 && (
        <View style={styles.progressWrap}>
          <View style={[styles.progressTrack, { backgroundColor: c.cardBackground }]}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={[styles.progressText, { color: c.muted }]}>{checked}/{total} no carrinho</Text>
        </View>
      )}

      <View style={[styles.addRow, { backgroundColor: c.cardBackground, borderColor: c.border }]}>
        <TextInput
          style={[styles.input, { color: c.text }]}
          placeholder="Adicionar item…"
          placeholderTextColor={c.muted}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleAdd}
          blurOnSubmit={false}
          returnKeyType="done"
          autoFocus={params.focus === '1'}
        />
        <TouchableOpacity activeOpacity={0.8} onPress={handleAdd} style={[styles.addBtn, { backgroundColor: '#10b981' }]}>
          <Text style={styles.addPlus}>＋</Text>
        </TouchableOpacity>
      </View>

      {items === undefined ? (
        <View style={{ marginTop: 12 }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <ThemedText style={[styles.emptyTitle, { color: c.text }]}>Lista vazia</ThemedText>
          <ThemedText style={[styles.emptyText, { color: c.muted }]}>Adicione o que precisa comprar</ThemedText>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => (
            <ShoppingRow
              name={item.name}
              checked={item.checked}
              onToggle={() => handleToggle(item._id)}
              onLongPress={() => handleLongPress(item._id, item.name)}
            />
          )}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.8 },
  clear: { fontSize: 13, fontWeight: '700' },
  progressWrap: { marginBottom: 16 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 4 },
  progressText: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, borderWidth: 1.5, paddingLeft: 16, paddingRight: 8, paddingVertical: 6, marginBottom: 8 },
  input: { flex: 1, fontSize: 16, fontWeight: '500', paddingVertical: 8 },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  addPlus: { color: '#fff', fontSize: 24, fontWeight: '300', lineHeight: 28 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  emptyText: { fontSize: 14, textAlign: 'center' },
});
