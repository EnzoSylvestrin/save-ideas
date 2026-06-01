import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

export function ShoppingRow({
  name,
  checked,
  quantity = 1,
  onToggle,
  onLongPress,
  onDecrement,
  onIncrement,
  onDelete,
}: {
  name: string;
  checked: boolean;
  quantity?: number;
  onToggle: () => void;
  onLongPress: () => void;
  onDecrement?: () => void;
  onIncrement?: () => void;
  onDelete?: () => void;
}) {
  const c = Colors[useColorScheme() ?? 'light'];
  const hasStepper = !!onDecrement && !!onIncrement;

  const content = (
    <View style={[styles.row, { backgroundColor: c.cardBackground }]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggle}
        onLongPress={onLongPress}
        style={styles.main}
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

      {hasStepper ? (
        <View style={[styles.stepper, { borderColor: c.border }]}>
          <TouchableOpacity activeOpacity={0.6} onPress={onDecrement} style={styles.stepBtn} hitSlop={6}>
            <Text style={[styles.stepSign, { color: c.muted }]}>−</Text>
          </TouchableOpacity>
          <Text style={[styles.qty, { color: c.text }]}>{quantity}</Text>
          <TouchableOpacity activeOpacity={0.6} onPress={onIncrement} style={styles.stepBtn} hitSlop={6}>
            <Text style={[styles.stepSign, { color: '#10b981' }]}>＋</Text>
          </TouchableOpacity>
        </View>
      ) : quantity > 1 ? (
        <Text style={[styles.qtyStatic, { color: c.muted }]}>×{quantity}</Text>
      ) : null}
    </View>
  );

  if (!onDelete) return content;

  return (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity activeOpacity={0.8} onPress={onDelete} style={styles.deleteAction}>
          <Text style={styles.deleteText}>Remover</Text>
        </TouchableOpacity>
      )}
      overshootRight={false}
    >
      {content}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10 },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  check: { width: 26, height: 26, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  tick: { color: '#fff', fontSize: 15, fontWeight: '900', lineHeight: 18 },
  name: { flex: 1, fontSize: 16, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, marginLeft: 10 },
  stepBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  stepSign: { fontSize: 18, fontWeight: '700' },
  qty: { minWidth: 22, textAlign: 'center', fontSize: 15, fontWeight: '800' },
  qtyStatic: { fontSize: 14, fontWeight: '700', marginLeft: 10 },
  deleteAction: { backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', width: 96, borderRadius: 14, marginBottom: 10 },
  deleteText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
