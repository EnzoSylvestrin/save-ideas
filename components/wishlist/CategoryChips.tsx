import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ALL = 'Todos';

export function CategoryChips({
  categories,
  selected,
  onSelect,
}: {
  categories: string[];
  selected: string;
  onSelect: (c: string) => void;
}) {
  const c = Colors[useColorScheme() ?? 'light'];
  const all = [ALL, ...categories];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {all.map((cat) => {
        const on = cat === selected;
        return (
          <TouchableOpacity
            key={cat}
            activeOpacity={0.8}
            onPress={() => onSelect(cat)}
            style={[
              styles.chip,
              { backgroundColor: on ? '#831843' : c.cardBackground, borderColor: c.border },
            ]}
          >
            <Text style={[styles.label, { color: on ? '#fbcfe8' : c.muted }]}>{cat}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export const CATEGORY_ALL = ALL;

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  label: { fontSize: 12, fontWeight: '600' },
});
