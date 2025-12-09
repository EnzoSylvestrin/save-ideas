import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { Id } from '@/convex/_generated/dataModel';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAction, useQuery } from 'convex/react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AudioRecorder } from '@/components/AudioRecorder';
import { IdeaCard } from '@/components/IdeaCard';
import { Skeleton, SkeletonCard } from '@/components/Skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { setLastProjectId } from '@/utils/storage';

import { api } from '@/convex/_generated/api';

export default function ProjectDetailScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const project = useQuery(
    api.projects.getProject,
    projectId ? { projectId: projectId as Id<'projects'> } : 'skip'
  );
  const ideas = useQuery(
    api.ideas.listIdeasByProject,
    projectId ? { projectId: projectId as Id<'projects'> } : 'skip'
  );
  const processAudioIdea = useAction(api.ideas.processAudioIdea);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCreateIdea, setShowCreateIdea] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: showCreateIdea ? 'none' : 'flex' },
    });
  }, [showCreateIdea, navigation]);

  useEffect(() => {
    if (projectId) {
      setLastProjectId(projectId);
    }
  }, [projectId]);

  const handleAudioComplete = async (uri: string, base64: string, mimeType: string) => {
    if (!projectId) return;

    setIsProcessing(true);
    setShowCreateIdea(false);

    try {
      await processAudioIdea({
        projectId: projectId as Id<'projects'>,
        audioBase64: base64,
        audioMimeType: mimeType,
      });
      Alert.alert('Sucesso', 'Ideia processada e salva com sucesso!');
    } catch {
      Alert.alert('Erro', 'Não foi possível processar a ideia. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!projectId) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ThemedText>Selecione um projeto para ver as ideias</ThemedText>
      </ThemedView>
    );
  }

  if (project === undefined || ideas === undefined) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom }]}>
        <ThemedView style={styles.header}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <ThemedView style={styles.titleContainer}>
            <Skeleton width={180} height={32} borderRadius={8} style={{ marginBottom: 6 }} />
            <Skeleton width={80} height={18} borderRadius={6} />
          </ThemedView>
          <Skeleton width={48} height={48} borderRadius={24} />
        </ThemedView>
        <ThemedView style={styles.list}>
          <SkeletonCard />
          <SkeletonCard />
        </ThemedView>
      </ThemedView>
    );
  }

  if (project === null) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ThemedText>Projeto não encontrado</ThemedText>
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
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" style={[styles.title, { color: themeColors.text }]}>
            {project.title}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: themeColors.muted }]}>
            {ideas?.length || 0} {ideas?.length === 1 ? 'ideia' : 'ideias'}
          </ThemedText>
        </ThemedView>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: themeColors.tint }]}
          onPress={() => setShowCreateIdea(true)}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          <IconSymbol name="paperplane.fill" size={18} color="#fff" />
        </TouchableOpacity>
      </ThemedView>

      {showCreateIdea && (
        <ThemedView style={[styles.createIdeaContainer, {
          backgroundColor: themeColors.cardBackground,
          borderColor: themeColors.border,
        }]}>
          <ThemedText type="subtitle" style={[styles.createIdeaTitle, { color: themeColors.text }]}>
            Nova Ideia
          </ThemedText>
          <ThemedText style={[styles.createIdeaDescription, { color: themeColors.muted }]}>
            Grave um áudio com sua ideia
          </ThemedText>
          <AudioRecorder
            onRecordingComplete={handleAudioComplete}
            onError={(error) => Alert.alert('Erro', error)}
          />
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: themeColors.background }]}
            onPress={() => setShowCreateIdea(false)}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.cancelButtonText, { color: themeColors.text }]}>
              Cancelar
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {isProcessing && (
        <ThemedView style={[styles.processingContainer, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <ActivityIndicator size="large" color={themeColors.tint} />
          <ThemedText style={[styles.processingText, { color: themeColors.text }]}>
            Processando áudio...
          </ThemedText>
          <ThemedText style={[styles.processingSubtext, { color: themeColors.muted }]}>
            Isso pode levar alguns segundos
          </ThemedText>
        </ThemedView>
      )}

      {ideas.length === 0 && !showCreateIdea ? (
        <ThemedView style={styles.emptyState}>
          <ThemedView style={[styles.emptyIconContainer, { backgroundColor: themeColors.cardBackground }]}>
            <IconSymbol name="paperplane.fill" size={48} color={themeColors.muted} />
          </ThemedView>
          <ThemedText style={[styles.emptyTitle, { color: themeColors.text }]}>
            Nenhuma ideia ainda
          </ThemedText>
          <ThemedText style={[styles.emptyText, { color: themeColors.muted }]}>
            Grave sua primeira ideia usando o botão acima
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={ideas}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <IdeaCard
              id={item._id}
              title={item.title || item.transcribedText?.substring(0, 60)}
              transcribedText={item.transcribedText}
              createdAt={item.createdAt}
              onPress={() => router.push({
                pathname: '/idea-detail',
                params: { ideaId: item._id },
              })}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
    gap: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  list: {
    paddingBottom: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 32,
  },
  createIdeaContainer: {
    marginBottom: 24,
    padding: 28,
    borderRadius: 20,
    borderWidth: 1.5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  createIdeaTitle: {
    marginBottom: 6,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  createIdeaDescription: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 24,
  },
  cancelButton: {
    marginTop: 24,
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  processingContainer: {
    padding: 28,
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  processingSubtext: {
    fontSize: 13,
  },
});
