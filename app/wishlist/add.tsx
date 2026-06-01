import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrioritySelector } from '@/components/wishlist/PrioritySelector';
import type { Priority } from '@/components/wishlist/priority';
import { Colors } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAction, useMutation, useQuery } from 'convex/react';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WishlistAddScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = Colors[useColorScheme() ?? 'light'];
  const params = useLocalSearchParams<{ id?: string }>();
  const editingId = params.id as Id<'wishlistItems'> | undefined;

  const existing = useQuery(
    api.wishlist.getWishlistItem,
    editingId ? { id: editingId } : 'skip'
  );

  const getLinkPreview = useAction(api.linkPreview.getLinkPreview);
  const createItem = useMutation(api.wishlist.createWishlistItem);
  const updateItem = useMutation(api.wishlist.updateWishlistItem);

  const [link, setLink] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [fetching, setFetching] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    if (!editingId || !existing) return;
    setLink(existing.link ?? '');
    setTitle(existing.title);
    setPrice(existing.price !== undefined ? String(existing.price) : '');
    setImageUrl(existing.imageUrl);
    setPriority(existing.priority);
    setCategory(existing.category ?? '');
    setNote(existing.note ?? '');
  }, [editingId, existing]);

  const handleFetch = async () => {
    if (!link.trim()) return;
    setFetching(true);
    setHint(null);
    try {
      const preview = await getLinkPreview({ url: link.trim() });
      if (preview.title) setTitle(preview.title);
      if (preview.imageUrl) setImageUrl(preview.imageUrl);
      if (preview.price !== undefined) setPrice(String(preview.price));
      if (!preview.title && !preview.imageUrl && preview.price === undefined) {
        setHint('Não consegui ler esse link, preenche na mão 🙂');
      }
    } catch {
      setHint('Não consegui ler esse link, preenche na mão 🙂');
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'Dá um título pro desejo');
      return;
    }
    const parsedPrice = price.trim() ? parseFloat(price.replace(',', '.')) : undefined;
    const payload = {
      title: title.trim(),
      link: link.trim() || undefined,
      imageUrl,
      price: parsedPrice !== undefined && !isNaN(parsedPrice) ? parsedPrice : undefined,
      priority,
      category: category.trim() || undefined,
      note: note.trim() || undefined,
    };
    try {
      if (editingId) await updateItem({ id: editingId, ...payload });
      else await createItem(payload);
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    }
  };

  const inputStyle = [styles.input, { borderColor: c.border, backgroundColor: c.cardBackground, color: c.text }];

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={[styles.cancel, { color: c.muted }]}>Cancelar</Text>
            </TouchableOpacity>
            <ThemedText type="subtitle" style={styles.title}>{editingId ? 'Editar desejo' : 'Novo desejo'}</ThemedText>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
              <Text style={[styles.save, { color: '#ec4899' }]}>Salvar</Text>
            </TouchableOpacity>
          </View>

          {!editingId && (
            <View style={styles.linkRow}>
              <TextInput
                style={[...inputStyle, { flex: 1, marginBottom: 0 }]}
                placeholder="Cola o link do produto"
                placeholderTextColor={c.muted}
                value={link}
                onChangeText={setLink}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <TouchableOpacity
                onPress={handleFetch}
                activeOpacity={0.8}
                style={[styles.fetchBtn, { backgroundColor: '#ec4899' }]}
                disabled={fetching}
              >
                {fetching ? <ActivityIndicator color="#fff" /> : <Text style={styles.fetchText}>Buscar</Text>}
              </TouchableOpacity>
            </View>
          )}

          {hint && <Text style={[styles.hint, { color: c.muted }]}>{hint}</Text>}

          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.preview} contentFit="cover" transition={150} />
          ) : null}

          <Text style={[styles.label, { color: c.muted }]}>Título</Text>
          <TextInput style={inputStyle} placeholder="Nome do desejo" placeholderTextColor={c.muted} value={title} onChangeText={setTitle} />

          <Text style={[styles.label, { color: c.muted }]}>Preço (R$)</Text>
          <TextInput style={inputStyle} placeholder="0,00" placeholderTextColor={c.muted} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

          <Text style={[styles.label, { color: c.muted }]}>Prioridade</Text>
          <View style={{ marginBottom: 16 }}>
            <PrioritySelector value={priority} onChange={setPriority} />
          </View>

          <Text style={[styles.label, { color: c.muted }]}>Categoria</Text>
          <TextInput style={inputStyle} placeholder="Ex: Tech, Casa, Presentes" placeholderTextColor={c.muted} value={category} onChangeText={setCategory} />

          <Text style={[styles.label, { color: c.muted }]}>Nota</Text>
          <TextInput style={[...inputStyle, styles.textArea]} placeholder="Cor, tamanho, onde vi mais barato…" placeholderTextColor={c.muted} value={note} onChangeText={setNote} multiline textAlignVertical="top" />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '700' },
  cancel: { fontSize: 15, fontWeight: '500' },
  save: { fontSize: 15, fontWeight: '800' },
  linkRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  fetchBtn: { paddingHorizontal: 18, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  fetchText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  hint: { fontSize: 12.5, fontWeight: '500', marginBottom: 12 },
  preview: { width: '100%', height: 160, borderRadius: 16, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 },
  input: { borderWidth: 1.5, borderRadius: 14, padding: 16, marginBottom: 16, fontSize: 16, fontWeight: '500' },
  textArea: { minHeight: 80 },
});
