import { CaptureSheet } from '@/components/hub/CaptureSheet';
import { HubHeader } from '@/components/hub/HubHeader';
import { ModuleTile } from '@/components/hub/ModuleTile';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MODULES } from '@/modules/registry';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HubScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const [showCapture, setShowCapture] = useState(false);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <HubHeader />
      <ScrollView
        contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {MODULES.map((m) => (
          <View key={m.id} style={styles.cell}>
            <ModuleTile module={m} />
          </View>
        ))}
        <View style={styles.cell}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.addTile, { borderColor: c.border }]}
            onPress={() => setShowCapture(true)}
          >
            <Text style={[styles.addPlus, { color: c.muted }]}>＋</Text>
            <Text style={[styles.addLabel, { color: c.muted }]}>Capturar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <CaptureSheet visible={showCapture} onClose={() => setShowCapture(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cell: { width: '48%', marginBottom: 16 },
  addTile: {
    height: 130,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addPlus: { fontSize: 32, fontWeight: '300' },
  addLabel: { fontSize: 13, fontWeight: '600' },
});
