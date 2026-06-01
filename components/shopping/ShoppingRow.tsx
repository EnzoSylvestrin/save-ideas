import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function ShoppingRow({
  name,
  checked,
  onToggle,
  onLongPress,
}: {
  name: string;
  checked: boolean;
  onToggle: () => void;
  onLongPress: () => void;
}) {
  const c = Colors[useColorScheme() ?? 'light'];
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onToggle}
      onLongPress={onLongPress}
      style={[styles.row, { backgroundColor: c.cardBackground }]}
    >
      <View
        style={[
          styles.check,
          {
            borderColor: checked ? '#10b981' : c.border,
            backgroundColor: checked ? '#10b981' : 'transparent',
          },
        ]}
      >
        {checked && <Text style={styles.tick}>✓</Text>}
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.name,
          {
            color: checked ? c.muted : c.text,
            textDecorationLine: checked ? 'line-through' : 'none',
          },
        ]}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 14, padding: 14, marginBottom: 10 },
  check: { width: 26, height: 26, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  tick: { color: '#fff', fontSize: 15, fontWeight: '900', lineHeight: 18 },
  name: { flex: 1, fontSize: 16, fontWeight: '600' },
});
