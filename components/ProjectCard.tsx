import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';

interface ProjectCardProps {
  id: string;
  title: string;
  createdAt: number;
  onPress: () => void;
}

export function ProjectCard({ title, createdAt, onPress }: ProjectCardProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.cardContent}>
        <ThemedView style={styles.header}>
          <ThemedView style={styles.titleContainer}>
            <ThemedView style={[styles.iconContainer, { backgroundColor: themeColors.tint + '15' }]}>
              <IconSymbol name="paperplane.fill" size={18} color={themeColors.tint} />
            </ThemedView>
            <ThemedView style={styles.textContainer}>
              <ThemedText type="subtitle" style={[styles.title, { color: themeColors.text }]}>
                {title}
              </ThemedText>
              <ThemedText style={[styles.date, { color: themeColors.muted }]}>
                {formatDate(createdAt)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <IconSymbol name="chevron.right" size={22} color={themeColors.icon} />
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardContent: {
    padding: 20,
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    fontWeight: '500',
  },
});

