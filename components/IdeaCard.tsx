import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';

interface IdeaCardProps {
  id: string;
  title?: string;
  transcribedText?: string;
  createdAt: number;
  onPress: () => void;
}

export function IdeaCard({ id, title, transcribedText, createdAt, onPress }: IdeaCardProps) {
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

  const getPreview = (text: string | undefined, maxLength: number = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.card, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.cardContent}>
        <ThemedView style={styles.topRow}>
          <ThemedView style={[styles.dateBadge, { backgroundColor: themeColors.background }]}>
            <ThemedText style={[styles.date, { color: themeColors.muted }]}>
              {formatDate(createdAt)}
            </ThemedText>
          </ThemedView>
          <IconSymbol name="chevron.right" size={20} color={themeColors.icon} />
        </ThemedView>
        
        <ThemedText style={[styles.title, { color: themeColors.text }]}>
          {title || getPreview(transcribedText, 60) || 'Ideia sem título'}
        </ThemedText>
        
        {transcribedText && title && (
          <ThemedText style={[styles.preview, { color: themeColors.muted }]}>
            {getPreview(transcribedText)}
          </ThemedText>
        )}
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
    shadowOpacity: 0.04,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateBadge: {
    paddingVertical: 5,
    borderRadius: 8,
  },
  date: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  preview: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
});

