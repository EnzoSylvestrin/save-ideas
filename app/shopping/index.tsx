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
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ShoppingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const c = Colors[useColorScheme() ?? 'light'];
  const params = useLocalSearchParams<{ focus?: string }>();

  const items = useQuery(api.shopping.listActiveItems);
  const saved = useQuery(api.shopping.listSavedItems);
  const addItem = useMutation(api.shopping.addItem);
  const toggleItem = useMutation(api.shopping.toggleItem);
  const deleteItem = useMutation(api.shopping.deleteItem);
  const changeQuantity = useMutation(api.shopping.changeQuantity);
  const updateItemName = useMutation(api.shopping.updateItemName);
  const clearChecked = useMutation(api.shopping.clearChecked);
  const sendToHistory = useMutation(api.shopping.sendToHistory);

  const [text, setText] = useState('');
  const [editId, setEditId] = useState<Id<'shoppingItems'> | null>(null);
  const [editName, setEditName] = useState('');

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

  const handleAddSaved = async (name: string) => {
    await Haptics.selectionAsync();
    await addItem({ name });
  };

  const handleToggle = async (id: Id<'shoppingItems'>) => {
    await Haptics.selectionAsync();
    await toggleItem({ id });
  };

  // "−": no 1, remove direto (sem perguntar); senão, diminui a quantidade.
  const handleDecrement = (id: Id<'shoppingItems'>, quantity: number) => {
    if (quantity <= 1) deleteItem({ id });
    else changeQuantity({ id, delta: -1 });
  };

  const openEdit = (id: Id<'shoppingItems'>, name: string) => {
    setEditId(id);
    setEditName(name);
  };

  const saveEdit = async () => {
    if (editId && editName.trim()) {
      await updateItemName({ id: editId, name: editName.trim() });
    }
    setEditId(null);
    setEditName('');
  };

  const handleSendToHistory = () => {
    Alert.alert(
      'Enviar para o histórico',
      'Guardar esta lista no histórico e começar uma nova?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await sendToHistory();
          },
        },
      ]
    );
  };

  const progress = total > 0 ? checked / total : 0;

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title" style={styles.title}>🛒 Compras</ThemedText>
          <Text style={[styles.sub, { color: c.muted }]}>Lista atual</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/shopping/history' as Href)}
          style={[styles.histBtn, { backgroundColor: c.cardBackground, borderColor: c.border }]}
        >
          <Text style={[styles.histText, { color: c.text }]}>Histórico</Text>
        </TouchableOpacity>
      </View>

      {total > 0 && (
        <View style={styles.progressWrap}>
          <View style={[styles.progressTrack, { backgroundColor: c.cardBackground }]}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.progressRow}>
            <Text style={[styles.progressText, { color: c.muted }]}>{checked}/{total} no carrinho</Text>
            {checked > 0 && (
              <TouchableOpacity activeOpacity={0.7} onPress={() => clearChecked()}>
                <Text style={[styles.clear, { color: c.muted }]}>Limpar comprados</Text>
              </TouchableOpacity>
            )}
          </View>
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

      {saved && saved.length > 0 && (
        <View style={styles.savedWrap}>
          <Text style={[styles.savedLabel, { color: c.muted }]}>Salvos · toque pra adicionar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedRow}>
            {saved.map((name) => (
              <TouchableOpacity
                key={name}
                activeOpacity={0.7}
                onPress={() => handleAddSaved(name)}
                style={[styles.chip, { backgroundColor: c.cardBackground, borderColor: c.border }]}
              >
                <Text style={[styles.chipText, { color: c.text }]}>+ {name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {items === undefined ? (
        <View style={{ marginTop: 12 }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <ThemedText style={[styles.emptyTitle, { color: c.text }]}>Lista vazia</ThemedText>
          <ThemedText style={[styles.emptyText, { color: c.muted }]}>
            Adicione itens ou toque nos salvos acima
          </ThemedText>
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
              onToggle={() => handleToggle(item._id)}
              onLongPress={() => openEdit(item._id, item.name)}
              onDecrement={() => handleDecrement(item._id, item.quantity ?? 1)}
              onIncrement={() => changeQuantity({ id: item._id, delta: 1 })}
              onDelete={() => deleteItem({ id: item._id })}
            />
          )}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 90 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {total > 0 && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSendToHistory}
          style={[styles.sendBtn, { backgroundColor: '#10b981', bottom: insets.bottom + 16 }]}
        >
          <Text style={styles.sendText}>Enviar para o histórico</Text>
        </TouchableOpacity>
      )}

      <Modal visible={editId !== null} transparent animationType="fade" onRequestClose={() => setEditId(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setEditId(null)}>
          <Pressable style={[styles.modal, { backgroundColor: c.background, borderColor: c.border }]} onPress={() => {}}>
            <Text style={[styles.modalTitle, { color: c.text }]}>Editar item</Text>
            <TextInput
              style={[styles.modalInput, { color: c.text, borderColor: c.border, backgroundColor: c.cardBackground }]}
              value={editName}
              onChangeText={setEditName}
              autoFocus
              onSubmitEditing={saveEdit}
              returnKeyType="done"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setEditId(null)} style={styles.modalCancel}>
                <Text style={[styles.modalCancelText, { color: c.muted }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} onPress={saveEdit} style={[styles.modalSave, { backgroundColor: '#10b981' }]}>
                <Text style={styles.modalSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.8 },
  sub: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  histBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  histText: { fontSize: 13, fontWeight: '700' },
  progressWrap: { marginBottom: 16 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 4 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  progressText: { fontSize: 12, fontWeight: '600' },
  clear: { fontSize: 12, fontWeight: '700' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, borderWidth: 1.5, paddingLeft: 16, paddingRight: 8, paddingVertical: 6, marginBottom: 12 },
  input: { flex: 1, fontSize: 16, fontWeight: '500', paddingVertical: 8 },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  addPlus: { color: '#fff', fontSize: 24, fontWeight: '300', lineHeight: 28 },
  savedWrap: { marginBottom: 8 },
  savedLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 },
  savedRow: { gap: 8, paddingBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  emptyText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
  sendBtn: { position: 'absolute', left: 24, right: 24, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  sendText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 32 },
  modal: { borderRadius: 20, borderWidth: 1, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalInput: { borderWidth: 1.5, borderRadius: 12, padding: 14, fontSize: 16, fontWeight: '500', marginBottom: 16 },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, alignItems: 'center' },
  modalCancel: { paddingHorizontal: 16, paddingVertical: 10 },
  modalCancelText: { fontSize: 15, fontWeight: '600' },
  modalSave: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 12 },
  modalSaveText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
