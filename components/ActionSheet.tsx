import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface ActionSheetOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  options: ActionSheetOption[];
  onCancel: () => void;
}

export function ActionSheet({ visible, options, onCancel }: ActionSheetProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  if (!visible) return null;

  return (
    <ThemedView
      lightColor="transparent"
      darkColor="transparent"
      style={styles.overlay}
      onTouchEnd={onCancel}
    >
      <ThemedView
        lightColor={themeColors.cardBackground}
        darkColor={themeColors.cardBackground}
        style={[styles.container, {
          backgroundColor: themeColors.cardBackground,
          borderColor: themeColors.border,
        }]}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              option.onPress();
              onCancel();
            }}
            style={[
              styles.option,
              index === 0 && styles.firstOption,
              index === options.length - 1 && styles.lastOption,
            ]}
            activeOpacity={0.7}
          >
            <ThemedText
              style={[
                styles.optionText,
                {
                  color: option.destructive
                    ? themeColors.error || '#ef4444'
                    : themeColors.text,
                },
              ]}
            >
              {option.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={onCancel}
          style={[styles.cancelButton, { backgroundColor: themeColors.background }]}
          activeOpacity={0.7}
        >
          <ThemedText style={[styles.cancelText, { color: themeColors.text }]}>
            Cancelar
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 2000,
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingBottom: 20,
    paddingTop: 8,
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  firstOption: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  lastOption: {
    borderBottomWidth: 0,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
  cancelButton: {
    marginHorizontal: 12,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '600',
  },
});

