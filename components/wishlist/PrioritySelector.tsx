import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PRIORITY, PRIORITY_ORDER, type Priority } from './priority';

export function PrioritySelector({
  value,
  onChange,
}: {
  value: Priority;
  onChange: (p: Priority) => void;
}) {
  return (
    <View style={styles.row}>
      {PRIORITY_ORDER.map((p) => {
        const selected = p === value;
        return (
          <TouchableOpacity
            key={p}
            activeOpacity={0.8}
            onPress={() => onChange(p)}
            style={[
              styles.btn,
              { backgroundColor: selected ? PRIORITY[p].bg : 'transparent', borderColor: PRIORITY[p].bg },
            ]}
          >
            <Text style={[styles.label, { color: selected ? PRIORITY[p].fg : PRIORITY[p].bg }]}>
              {PRIORITY[p].label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  label: { fontSize: 12.5, fontWeight: '700' },
});
