import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

interface ProjectCardProps {
  id: string;
  title: string;
  createdAt: number;
  onPress: () => void;
  onLongPress?: () => void;
}

export function ProjectCard({ title, createdAt, onPress, onLongPress }: ProjectCardProps) {
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
      onLongPress={onLongPress}
      style={[styles.card, { backgroundColor: themeColors.cardBackground }]}
      activeOpacity={0.6}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.iconContainer, { backgroundColor: themeColors.tint + '15' }]}>
            <IconSymbol name="paperplane.fill" size={18} color={themeColors.tint} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: themeColors.text }]}>
              {title}
            </Text>
            <Text style={[styles.date, { color: themeColors.muted }]}>
              {formatDate(createdAt)}
            </Text>
          </View>
        </View>
        <IconSymbol name="chevron.right" size={22} color={themeColors.icon} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    overflow: 'hidden',
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

