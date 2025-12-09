import { Skeleton, SkeletonCard } from '@/components/Skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IdeaDetailScreen() {
  const { ideaId } = useLocalSearchParams<{ ideaId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  const idea = useQuery(
    api.ideas.getIdea,
    ideaId ? { ideaId: ideaId as Id<'ideas'> } : 'skip'
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    
    const formatBoldText = (text: string): React.ReactNode[] => {
      const boldRegex = /\*\*([^*]+)\*\*/g;
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;
      let partIndex = 0;
      
      while ((match = boldRegex.exec(text)) !== null) {
        // Add text before the bold section
        if (match.index > lastIndex) {
          const beforeText = text.substring(lastIndex, match.index);
          if (beforeText.length > 0) {
            parts.push(beforeText);
          }
        }
        // Add the bold text
        parts.push(
          <ThemedText key={`bold-${partIndex++}`} style={[styles.boldText, { color: themeColors.text }]}>
            {match[1]}
          </ThemedText>
        );
        lastIndex = match.index + match[0].length;
      }
      
      // Add remaining text after last bold section
      if (lastIndex < text.length) {
        const afterText = text.substring(lastIndex);
        if (afterText.length > 0) {
          parts.push(afterText);
        }
      }
      
      // If no bold text found, just return the whole text
      if (parts.length === 0) {
        parts.push(text);
      }
      
      return parts;
    };

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ThemedView 
            key={`list-${elements.length}`} 
            lightColor="transparent"
            darkColor="transparent"
            style={styles.listContainer}>
            {currentList.map((item, idx) => (
              <ThemedView 
                key={idx} 
                lightColor="transparent"
                darkColor="transparent"
                style={styles.listItem}>
                <ThemedView style={[styles.bulletPoint, { backgroundColor: themeColors.tint }]} />
                <ThemedText style={[styles.listText, { color: themeColors.text }]}>
                  {formatBoldText(item)}
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        );
        currentList = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <ThemedView 
            key={index} 
            lightColor="transparent"
            darkColor="transparent"
            style={styles.sectionDivider}>
            <ThemedView style={[styles.dividerLine, { backgroundColor: themeColors.border }]} />
            <ThemedText style={[styles.markdownH2, { color: themeColors.text }]}>
              {trimmed.replace(/^##+\s*/, '')}
            </ThemedText>
            <ThemedView style={[styles.dividerLine, { backgroundColor: themeColors.border }]} />
          </ThemedView>
        );
      } else if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(
          <ThemedText key={index} style={[styles.markdownH3, { color: themeColors.text }]}>
            {trimmed.replace(/^###+\s*/, '')}
          </ThemedText>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
        const listItem = trimmed.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
        currentList.push(listItem);
      } else if (trimmed === '') {
        flushList();
        elements.push(
          <ThemedView 
            key={index} 
            lightColor="transparent"
            darkColor="transparent"
            style={styles.spacer} 
          />
        );
      } else if (trimmed.length > 0) {
        flushList();
        const formattedParts = formatBoldText(trimmed);
        elements.push(
          <ThemedText key={index} style={[styles.markdownText, { color: themeColors.text }]}>
            {formattedParts}
          </ThemedText>
        );
      }
    });
    
    flushList();
    return elements;
  };

  if (idea === undefined) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom }]}>
        <ThemedView style={styles.header}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <Skeleton width={150} height={28} borderRadius={8} />
          <Skeleton width={40} height={40} borderRadius={20} />
        </ThemedView>
        <SkeletonCard />
        <SkeletonCard />
      </ThemedView>
    );
  }

  if (idea === null) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom }]}>
        <ThemedText>Ideia não encontrada</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom }]}>
      <ThemedView style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: themeColors.cardBackground }]}
          activeOpacity={0.7}
        >
          <IconSymbol name="chevron.right" size={20} color={themeColors.icon} />
        </TouchableOpacity>
        <ThemedText type="title" style={[styles.headerTitle, { color: themeColors.text }]}>
          Detalhes da Ideia
        </ThemedText>
        <ThemedView style={{ width: 40 }} />
      </ThemedView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView 
          lightColor={themeColors.cardBackground}
          darkColor={themeColors.cardBackground}
          style={[styles.titleCard, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <ThemedText style={[styles.title, { color: themeColors.text }]}>
            {idea.title || idea.transcribedText?.substring(0, 80) || 'Ideia sem título'}
          </ThemedText>
          <ThemedView 
            lightColor="transparent"
            darkColor="transparent"
            style={styles.dateBadge}>
            <ThemedText style={[styles.date, { color: themeColors.muted }]}>
              {formatDate(idea.createdAt)}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {idea.transcribedText && (
          <ThemedView 
            lightColor={themeColors.cardBackground}
            darkColor={themeColors.cardBackground}
            style={[styles.section, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
            <ThemedView 
              lightColor="transparent"
              darkColor="transparent"
              style={styles.sectionHeader}>
              <IconSymbol name="mic.fill" size={18} color={themeColors.tint} />
              <ThemedText style={[styles.sectionTitle, { color: themeColors.text }]}>
                Minha Fala
              </ThemedText>
            </ThemedView>
            <ThemedText style={[styles.transcription, { color: themeColors.text }]}>
              {idea.transcribedText}
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView 
          lightColor={themeColors.cardBackground}
          darkColor={themeColors.cardBackground}
          style={[styles.section, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <ThemedView 
            lightColor="transparent"
            darkColor="transparent"
            style={styles.sectionHeader}>
            <IconSymbol name="paperplane.fill" size={18} color={themeColors.tint} />
            <ThemedText style={[styles.sectionTitle, { color: themeColors.text }]}>
              Ideias Estruturadas
            </ThemedText>
          </ThemedView>
          <ThemedView 
            lightColor="transparent"
            darkColor="transparent"
            style={styles.markdownContainer}>
            {formatMarkdown(idea.processedIdea)}
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  titleCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  dateBadge: {
    alignSelf: 'flex-start',
  },
  date: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  section: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  transcription: {
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  markdownContainer: {
    gap: 8,
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  markdownH2: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    paddingHorizontal: 8,
  },
  markdownH3: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  markdownText: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  boldText: {
    fontWeight: '700',
  },
  listContainer: {
    marginVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  spacer: {
    height: 12,
  },
});

