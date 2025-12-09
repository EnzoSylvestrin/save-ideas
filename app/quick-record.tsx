import { AudioRecorder } from '@/components/AudioRecorder';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getLastProjectId, setLastProjectId } from '@/utils/storage';
import { useAction, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function QuickRecordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ projectId?: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const projects = useQuery(api.projects.listProjects);
  const processAudioIdea = useAction(api.ideas.processAudioIdea);
  const [targetProjectId, setTargetProjectId] = useState<Id<'projects'> | null>(null);
  const [targetProjectTitle, setTargetProjectTitle] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  useEffect(() => {
    const setupProject = async () => {
      // Aguardar o carregamento dos projetos
      if (projects === undefined) {
        return; // Ainda carregando
      }

      // Só mostrar erro se realmente não houver projetos após carregar
      if (projects.length === 0) {
        Alert.alert('Atenção', 'Crie um projeto primeiro para gravar ideias', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') },
        ]);
        return;
      }

      // Se um projectId foi passado via deep link, use ele
      if (params.projectId) {
        const specifiedProject = projects.find(p => p._id === params.projectId);
        if (specifiedProject) {
          setTargetProjectId(specifiedProject._id);
          setTargetProjectTitle(specifiedProject.title);
          return;
        }
      }

      // Caso contrário, use o último projeto usado ou o primeiro
      const lastProjectId = await getLastProjectId();
      const lastProject = lastProjectId 
        ? projects.find(p => p._id === lastProjectId)
        : null;

      if (lastProject) {
        setTargetProjectId(lastProject._id);
        setTargetProjectTitle(lastProject.title);
      } else {
        setTargetProjectId(projects[0]._id);
        setTargetProjectTitle(projects[0].title);
      }
    };

    setupProject();
  }, [projects, router, params.projectId]);

  const handleProjectSelect = async (projectId: Id<'projects'>, projectTitle: string) => {
    setTargetProjectId(projectId);
    setTargetProjectTitle(projectTitle);
    await setLastProjectId(projectId);
    setShowProjectSelector(false);
  };

  const handleAudioComplete = async (uri: string, base64: string, mimeType: string) => {
    if (!targetProjectId) return;

    setIsProcessing(true);

    try {
      await processAudioIdea({
        projectId: targetProjectId,
        audioBase64: base64,
        audioMimeType: mimeType,
      });
      Alert.alert('Sucesso', 'Ideia salva com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a ideia. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (projects === undefined || !targetProjectId) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="large" color={themeColors.tint} />
        <ThemedText style={[styles.loadingText, { color: themeColors.text }]}>
          Carregando...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: themeColors.text }]}>
          Gravar Ideia Rápida
        </ThemedText>
        {targetProjectTitle && projects && projects.length > 1 && (
          <TouchableOpacity
            onPress={() => setShowProjectSelector(true)}
            style={[styles.projectSelector, { 
              backgroundColor: themeColors.cardBackground,
              borderColor: themeColors.border,
            }]}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.projectSelectorText, { color: themeColors.text }]}>
              {targetProjectTitle}
            </ThemedText>
            <IconSymbol name="chevron.right" size={18} color={themeColors.icon} />
          </TouchableOpacity>
        )}
        {targetProjectTitle && projects && projects.length === 1 && (
          <ThemedText style={[styles.subtitle, { color: themeColors.muted }]}>
            {targetProjectTitle}
          </ThemedText>
        )}
      </ThemedView>

      {isProcessing ? (
        <ThemedView 
          lightColor="transparent"
          darkColor="transparent"
          style={styles.processingContainer}>
          <ActivityIndicator size="large" color={themeColors.tint} />
          <ThemedText style={[styles.processingText, { color: themeColors.text }]}>
            Processando áudio...
          </ThemedText>
          <ThemedText style={[styles.processingSubtext, { color: themeColors.muted }]}>
            Isso pode levar alguns segundos
          </ThemedText>
        </ThemedView>
      ) : (
        <AudioRecorder
          onRecordingComplete={handleAudioComplete}
          onError={(error) => Alert.alert('Erro', error)}
        />
      )}

      {showProjectSelector && projects && (
        <ThemedView 
          lightColor="transparent"
          darkColor="transparent"
          style={styles.selectorOverlay}
          onTouchEnd={() => setShowProjectSelector(false)}
        >
          <ThemedView
            lightColor={themeColors.cardBackground}
            darkColor={themeColors.cardBackground}
            style={[styles.selectorModal, {
              backgroundColor: themeColors.cardBackground,
              borderColor: themeColors.border,
            }]}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <ThemedView 
              lightColor="transparent"
              darkColor="transparent"
              style={styles.selectorHeader}>
              <ThemedText type="subtitle" style={[styles.selectorTitle, { color: themeColors.text }]}>
                Escolher Projeto
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowProjectSelector(false)}
                style={[styles.closeButton, { backgroundColor: themeColors.background }]}
                activeOpacity={0.7}
              >
                <IconSymbol name="chevron.right" size={20} color={themeColors.icon} />
              </TouchableOpacity>
            </ThemedView>
            <ScrollView style={styles.selectorList} showsVerticalScrollIndicator={false}>
              {projects.map((project) => (
                <TouchableOpacity
                  key={project._id}
                  onPress={() => handleProjectSelect(project._id, project.title)}
                  style={[
                    styles.projectOption,
                    {
                      backgroundColor: project._id === targetProjectId 
                        ? themeColors.tint + '15' 
                        : 'transparent',
                      borderColor: project._id === targetProjectId 
                        ? themeColors.tint 
                        : themeColors.border,
                    }
                  ]}
                  activeOpacity={0.7}
                >
                  <ThemedView 
                    lightColor="transparent"
                    darkColor="transparent"
                    style={styles.projectOptionContent}>
                    <ThemedView 
                      lightColor="transparent"
                      darkColor="transparent"
                      style={[styles.projectOptionIcon, { backgroundColor: themeColors.tint + '15' }]}>
                      <IconSymbol name="paperplane.fill" size={16} color={themeColors.tint} />
                    </ThemedView>
                    <ThemedText 
                      style={[
                        styles.projectOptionText,
                        { 
                          color: themeColors.text,
                          fontWeight: project._id === targetProjectId ? '700' : '500',
                        }
                      ]}
                    >
                      {project.title}
                    </ThemedText>
                  </ThemedView>
                  {project._id === targetProjectId && (
                    <IconSymbol name="chevron.right" size={18} color={themeColors.tint} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  processingContainer: {
    alignItems: 'center',
    gap: 16,
    padding: 32,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  processingSubtext: {
    fontSize: 14,
  },
  projectSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 12,
    minWidth: 200,
  },
  projectSelectorText: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  selectorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  selectorModal: {
    width: '85%',
    maxWidth: 400,
    maxHeight: '70%',
    borderRadius: 24,
    borderWidth: 1.5,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  selectorTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorList: {
    maxHeight: 400,
    padding: 16,
  },
  projectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  projectOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  projectOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectOptionText: {
    fontSize: 16,
    flex: 1,
  },
});

