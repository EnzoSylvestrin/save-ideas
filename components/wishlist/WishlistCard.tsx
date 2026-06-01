import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatBRL } from '@/utils/currency';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PriorityBadge } from './PriorityBadge';
import type { Priority } from './priority';

export type WishlistCardItem = {
  _id: string;
  title: string;
  imageUrl?: string;
  price?: number;
  priority: Priority;
  category?: string;
};

export function WishlistCard({
  item,
  onPress,
  onLongPress,
}: {
  item: WishlistCardItem;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const c = Colors[useColorScheme() ?? 'light'];
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.card, { backgroundColor: c.cardBackground }]}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.thumb} contentFit="cover" transition={150} />
      ) : (
        <View style={[styles.thumb, styles.placeholder, { backgroundColor: c.border }]}>
          <Text style={styles.placeholderIcon}>🛍️</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text numberOfLines={2} style={[styles.title, { color: c.text }]}>{item.title}</Text>
        <View style={styles.meta}>
          {item.price !== undefined && (
            <Text style={[styles.price, { color: c.text }]}>{formatBRL(item.price)}</Text>
          )}
          <PriorityBadge priority={item.priority} />
        </View>
        {item.category ? <Text style={[styles.category, { color: c.muted }]}>{item.category}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, borderRadius: 16, padding: 10, marginBottom: 12 },
  thumb: { width: 64, height: 64, borderRadius: 12 },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: { fontSize: 26 },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: '700' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  price: { fontSize: 13, fontWeight: '800' },
  category: { fontSize: 11, fontWeight: '500', marginTop: 4 },
});
