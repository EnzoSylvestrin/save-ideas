import { StyleSheet, Text } from 'react-native';
import { PRIORITY, type Priority } from './priority';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const p = PRIORITY[priority];
  return (
    <Text style={[styles.badge, { backgroundColor: p.bg, color: p.fg }]}>
      {p.label.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
