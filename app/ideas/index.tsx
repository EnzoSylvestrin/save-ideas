import { Colors } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActionSheetIOS, Alert, FlatList, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionSheet } from '@/components/ActionSheet';
import { ProjectCard } from '@/components/ProjectCard';
import { QuickRecordModal } from '@/components/QuickRecordModal';
import { Skeleton, SkeletonCard } from '@/components/Skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getLastProjectId, setLastProjectId } from '@/utils/storage';

export default function IdeasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const projects = useQuery(api.projects.listProjects);
  const createProject = useMutation(api.projects.createProject);
  const updateProject = useMutation(api.projects.updateProject);
  const deleteProject = useMutation(api.projects.deleteProject);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuickRecord, setShowQuickRecord] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [quickRecordProjectId, setQuickRecordProjectId] = useState<Id<'projects'> | null>(null);
  const [quickRecordProjectTitle, setQuickRecordProjectTitle] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<Id<'projects'> | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<{ id: Id<'projects'>; title: string; description?: string } | null>(null);
  const [editProjectTitle, setEditProjectTitle] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) {
      Alert.alert('Erro', 'Por favor, insira um título para o projeto');
      return;
    }

    try {
      await createProject({ 
        title: newProjectTitle.trim(),
        description: newProjectDescription.trim() || undefined,
      });
      setNewProjectTitle('');
      setNewProjectDescription('');
      setShowCreateModal(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível criar o projeto');
    }
  };

  const handleProjectPress = (projectId: string) => {
    setLastProjectId(projectId);
    router.push({
      pathname: '/project-detail',
      params: { projectId },
    });
  };

  const handleProjectLongPress = (projectId: Id<'projects'>) => {
    setSelectedProjectId(projectId);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Editar Projeto', 'Excluir Projeto'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleEditProject(projectId);
          } else if (buttonIndex === 2) {
            handleDeleteProject(projectId);
          }
        }
      );
    } else {
      setShowActionSheet(true);
    }
  };

  const handleEditProject = (projectId: Id<'projects'>) => {
    const project = projects?.find(p => p._id === projectId);
    if (project) {
      setEditingProject({
        id: projectId,
        title: project.title,
        description: project.description,
      });
      setEditProjectTitle(project.title);
      setEditProjectDescription(project.description || '');
      setShowEditModal(true);
      setShowActionSheet(false);
      setSelectedProjectId(null);
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject || !editProjectTitle.trim()) {
      Alert.alert('Erro', 'Por favor, insira um título para o projeto');
      return;
    }

    try {
      await updateProject({
        projectId: editingProject.id,
        title: editProjectTitle.trim(),
        description: editProjectDescription.trim() || undefined,
      });
      setShowEditModal(false);
      setEditingProject(null);
      setEditProjectTitle('');
      setEditProjectDescription('');
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o projeto');
    }
  };

  const handleDeleteProject = async (projectId: Id<'projects'>) => {
    const project = projects?.find(p => p._id === projectId);
    Alert.alert(
      'Excluir Projeto',
      `Tem certeza que deseja excluir o projeto "${project?.title}"? Todas as ideias associadas também serão excluídas. Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject({ projectId });
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir o projeto');
            }
          },
        },
      ]
    );
    setSelectedProjectId(null);
    setShowActionSheet(false);
  };

  const handleQuickRecord = async () => {
    if (!projects || projects.length === 0) {
      Alert.alert('Atenção', 'Crie um projeto primeiro para gravar ideias');
      return;
    }

    let targetProjectId: Id<'projects'>;
    let targetProjectTitle: string;

    const lastProjectId = await getLastProjectId();
    const lastProject = lastProjectId
      ? projects.find(p => p._id === lastProjectId)
      : null;

    if (lastProject) {
      targetProjectId = lastProject._id;
      targetProjectTitle = lastProject.title;
    } else {
      targetProjectId = projects[0]._id;
      targetProjectTitle = projects[0].title;
    }

    setQuickRecordProjectId(targetProjectId);
    setQuickRecordProjectTitle(targetProjectTitle);
    setShowQuickRecord(true);
  };

  const themeColors = Colors[colorScheme ?? 'light'];

  if (projects === undefined) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom }]}>
        <ThemedView style={styles.header}>
          <ThemedView>
            <Skeleton width={120} height={36} borderRadius={8} style={{ marginBottom: 8 }} />
            <Skeleton width={150} height={20} borderRadius={6} />
          </ThemedView>
          <Skeleton width={56} height={56} borderRadius={28} />
        </ThemedView>
        <ThemedView style={styles.list}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom }]}>
      <ThemedView style={styles.header}>
        <ThemedView>
          <ThemedText type="title" style={styles.headerTitle}>Projetos</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: themeColors.muted }]}>
            Organize suas ideias
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.quickRecordButton, { backgroundColor: themeColors.tint }]}
            onPress={handleQuickRecord}
            activeOpacity={0.8}
          >
            <IconSymbol name="mic.fill" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.8}
          >
            <IconSymbol name="paperplane.fill" size={20} color={themeColors.tint} />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {showQuickRecord && quickRecordProjectId && (
        <QuickRecordModal
          projectId={quickRecordProjectId}
          projectTitle={quickRecordProjectTitle}
          visible={showQuickRecord}
          onClose={() => setShowQuickRecord(false)}
          onSuccess={() => {
            // Refresh projects if needed
          }}
        />
      )}

      {Platform.OS === 'android' && (
        <ActionSheet
          visible={showActionSheet}
          options={[
            {
              label: 'Editar Projeto',
              onPress: () => {
                if (selectedProjectId) {
                  handleEditProject(selectedProjectId);
                }
              },
            },
            {
              label: 'Excluir Projeto',
              onPress: () => {
                if (selectedProjectId) {
                  handleDeleteProject(selectedProjectId);
                }
              },
              destructive: true,
            },
          ]}
          onCancel={() => {
            setShowActionSheet(false);
            setSelectedProjectId(null);
          }}
        />
      )}

      {showEditModal && editingProject && (
        <ThemedView style={styles.modalOverlay} onTouchEnd={() => setShowEditModal(false)}>
          <ThemedView style={[styles.modal, {
            backgroundColor: themeColors.background,
            borderColor: themeColors.border,
          }]} onTouchEnd={(e) => e.stopPropagation()}>
            <ThemedText type="subtitle" style={styles.modalTitle}>Editar Projeto</ThemedText>
            <ThemedText style={[styles.modalDescription, { color: themeColors.muted }]}>
              Atualize as informações do projeto
            </ThemedText>
            <TextInput
              style={[styles.input, {
                borderColor: themeColors.border,
                backgroundColor: themeColors.cardBackground,
                color: themeColors.text,
              }]}
              placeholder="Nome do projeto"
              placeholderTextColor={themeColors.muted}
              value={editProjectTitle}
              onChangeText={setEditProjectTitle}
              autoFocus
            />
            <TextInput
              style={[styles.input, styles.textArea, {
                borderColor: themeColors.border,
                backgroundColor: themeColors.cardBackground,
                color: themeColors.text,
              }]}
              placeholder="Descrição do projeto (opcional)"
              placeholderTextColor={themeColors.muted}
              value={editProjectDescription}
              onChangeText={setEditProjectDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <ThemedView style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, {
                  backgroundColor: themeColors.cardBackground,
                  borderColor: themeColors.border,
                }]}
                onPress={() => {
                  setShowEditModal(false);
                  setEditingProject(null);
                  setEditProjectTitle('');
                  setEditProjectDescription('');
                }}
                activeOpacity={0.7}
              >
                <ThemedText style={[styles.buttonText, { color: themeColors.text }]}>
                  Cancelar
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton, { backgroundColor: themeColors.tint }]}
                onPress={handleUpdateProject}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.buttonText, styles.createButtonText]}>
                  Salvar
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      )}

      {showCreateModal && (
        <ThemedView style={styles.modalOverlay} onTouchEnd={() => setShowCreateModal(false)}>
          <ThemedView style={[styles.modal, {
            backgroundColor: themeColors.background,
            borderColor: themeColors.border,
          }]} onTouchEnd={(e) => e.stopPropagation()}>
            <ThemedText type="subtitle" style={styles.modalTitle}>Novo Projeto</ThemedText>
            <ThemedText style={[styles.modalDescription, { color: themeColors.muted }]}>
              Dê um nome e descrição para seu novo projeto
            </ThemedText>
            <TextInput
              style={[styles.input, {
                borderColor: themeColors.border,
                backgroundColor: themeColors.cardBackground,
                color: themeColors.text,
              }]}
              placeholder="Nome do projeto (ex: App Mobile, Website, Startup...)"
              placeholderTextColor={themeColors.muted}
              value={newProjectTitle}
              onChangeText={setNewProjectTitle}
              autoFocus
            />
            <TextInput
              style={[styles.input, styles.textArea, {
                borderColor: themeColors.border,
                backgroundColor: themeColors.cardBackground,
                color: themeColors.text,
              }]}
              placeholder="Descrição do projeto (opcional - ajuda a IA a entender melhor o contexto)"
              placeholderTextColor={themeColors.muted}
              value={newProjectDescription}
              onChangeText={setNewProjectDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <ThemedView style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, {
                  backgroundColor: themeColors.cardBackground,
                  borderColor: themeColors.border,
                }]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewProjectTitle('');
                  setNewProjectDescription('');
                }}
                activeOpacity={0.7}
              >
                <ThemedText style={[styles.buttonText, { color: themeColors.text }]}>
                  Cancelar
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton, { backgroundColor: themeColors.tint }]}
                onPress={handleCreateProject}
                activeOpacity={0.8}
              >
                <ThemedText style={[styles.buttonText, styles.createButtonText]}>
                  Criar Projeto
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      )}

      {projects.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <ThemedView style={[styles.emptyIconContainer, { backgroundColor: themeColors.cardBackground }]}>
            <IconSymbol name="paperplane.fill" size={48} color={themeColors.muted} />
          </ThemedView>
          <ThemedText style={[styles.emptyTitle, { color: themeColors.text }]}>
            Nenhum projeto ainda
          </ThemedText>
          <ThemedText style={[styles.emptyText, { color: themeColors.muted }]}>
            Crie seu primeiro projeto para começar a salvar ideias
          </ThemedText>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: themeColors.tint }]}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.emptyButtonText}>Criar Projeto</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ProjectCard
              id={item._id}
              title={item.title}
              createdAt={item.createdAt}
              onPress={() => handleProjectPress(item._id)}
              onLongPress={() => handleProjectLongPress(item._id)}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 4,
    lineHeight: 44,
    includeFontPadding: false,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  quickRecordButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  emptyButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '90%',
    maxWidth: 420,
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  modalTitle: {
    marginBottom: 8,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 18,
    paddingBottom: 18,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 110,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 2,
  },
  createButton: {
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  createButtonText: {
    color: '#fff',
  },
});

