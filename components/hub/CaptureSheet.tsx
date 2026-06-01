import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MODULES } from '@/modules/registry';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CaptureSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const captureModules = MODULES.filter((m) => m.capture);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Pressable interno captura o toque p/ não fechar ao tocar na folha */}
        <Pressable
          style={[styles.sheet, { backgroundColor: c.background, paddingBottom: insets.bottom + 16 }]}
          onPress={() => {}}
        >
          <View style={[styles.handle, { backgroundColor: c.border }]} />
          <Text style={[styles.title, { color: c.text }]}>Capturar…</Text>
          {captureModules.map((m) => (
            <TouchableOpacity
              key={m.id}
              activeOpacity={0.7}
              style={[styles.row, { backgroundColor: c.cardBackground, borderColor: c.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onClose();
                m.capture!.onTrigger(router);
              }}
            >
              <Text style={styles.rowIcon}>{m.capture!.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: c.text }]}>{m.capture!.label}</Text>
                <Text style={[styles.rowSub, { color: c.muted }]}>{m.capture!.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 12 },
  handle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  rowIcon: { fontSize: 24 },
  rowLabel: { fontSize: 15, fontWeight: '700' },
  rowSub: { fontSize: 12.5, fontWeight: '500', marginTop: 2 },
});
