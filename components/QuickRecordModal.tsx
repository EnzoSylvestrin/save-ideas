import { Colors } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAction } from 'convex/react';
import { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { AudioRecorder } from './AudioRecorder';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';

interface QuickRecordModalProps {
  projectId: Id<'projects'>;
  projectTitle?: string;
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuickRecordModal({ 
  projectId, 
  projectTitle,
  visible, 
  onClose,
  onSuccess 
}: QuickRecordModalProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const processAudioIdea = useAction(api.ideas.processAudioIdea);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!visible) return null;

  const handleAudioComplete = async (uri: string, base64: string, mimeType: string) => {
    setIsProcessing(true);

    try {
      await processAudioIdea({
        projectId,
        audioBase64: base64,
        audioMimeType: mimeType,
      });
      Alert.alert('Sucesso', 'Ideia salva com sucesso!');
      onSuccess?.();
      onClose();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a ideia. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ThemedView style={styles.overlay} onTouchEnd={onClose}>
      <ThemedView 
        lightColor={themeColors.cardBackground}
        darkColor={themeColors.cardBackground}
        style={[styles.modal, { 
          backgroundColor: themeColors.cardBackground,
          borderColor: themeColors.border,
        }]} 
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <ThemedView 
          lightColor="transparent"
          darkColor="transparent"
          style={styles.header}>
          <ThemedView 
            lightColor="transparent"
            darkColor="transparent">
            <ThemedText type="subtitle" style={[styles.title, { color: themeColors.text }]}>
              Gravar Ideia Rápida
            </ThemedText>
            {projectTitle && (
              <ThemedText style={[styles.subtitle, { color: themeColors.muted }]}>
                {projectTitle}
              </ThemedText>
            )}
          </ThemedView>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: themeColors.background }]}
            activeOpacity={0.7}
          >
            <IconSymbol name="chevron.right" size={20} color={themeColors.icon} />
          </TouchableOpacity>
        </ThemedView>

        {isProcessing ? (
          <ThemedView 
            lightColor="transparent"
            darkColor="transparent"
            style={styles.processingContainer}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modal: {
    width: '90%',
    maxWidth: 500,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingContainer: {
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  processingSubtext: {
    fontSize: 13,
  },
});

