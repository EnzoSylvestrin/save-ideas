import { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { AudioRecorder } from '@/components/AudioRecorder';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface RecordingModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (uri: string, base64: string, mimeType: string, duration: number) => void;
  projectTitle?: string;
  minDuration?: number;
}

export function RecordingModal({
  visible,
  onClose,
  onConfirm,
  projectTitle,
  minDuration = 2,
}: RecordingModalProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingRecording, setPendingRecording] = useState<{
    uri: string;
    base64: string;
    mimeType: string;
    duration: number;
  } | null>(null);

  const handleAudioComplete = async (uri: string, base64: string, mimeType: string, duration: number) => {
    console.log('Recording duration received:', duration);
    
    if (!duration || duration < minDuration) {
      Alert.alert(
        'Gravação muito curta',
        `A gravação deve ter pelo menos ${minDuration} segundos. Tente gravar novamente.`
      );
      return;
    }

    setPendingRecording({ uri, base64, mimeType, duration });
    setShowConfirmation(true);
  };

  const handleConfirmSave = () => {
    if (!pendingRecording) return;
    
    onConfirm(
      pendingRecording.uri,
      pendingRecording.base64,
      pendingRecording.mimeType,
      pendingRecording.duration
    );
    
    setShowConfirmation(false);
    setPendingRecording(null);
    onClose();
  };

  const handleDiscard = () => {
    setShowConfirmation(false);
    setPendingRecording(null);
  };

  const handleClose = () => {
    if (showConfirmation) {
      handleDiscard();
    } else {
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!visible) return null;

  return (
    <>
      {/* Modal Overlay */}
      <ThemedView
        lightColor="transparent"
        darkColor="transparent"
        style={styles.overlay}
        onTouchEnd={handleClose}
      >
        {/* Recording Modal */}
        {!showConfirmation ? (
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
              style={styles.modalContent}
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <IconSymbol name="xmark" size={20} color={themeColors.text} />
              </TouchableOpacity>

              <ThemedText type="subtitle" style={[styles.modalTitle, { color: themeColors.text }]}>
                Nova Ideia
              </ThemedText>
              <ThemedText style={[styles.modalDescription, { color: themeColors.muted }]}>
                Grave um áudio com sua ideia
              </ThemedText>

              <AudioRecorder
                onRecordingComplete={handleAudioComplete}
                onError={(error) => Alert.alert('Erro', error)}
              />
            </ThemedView>
          </ThemedView>
        ) : (
          /* Confirmation Modal */
          <ThemedView
            lightColor={themeColors.cardBackground}
            darkColor={themeColors.cardBackground}
            style={[styles.confirmationModal, {
              backgroundColor: themeColors.cardBackground,
              borderColor: themeColors.border,
            }]}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <ThemedView
              lightColor="transparent"
              darkColor="transparent"
              style={styles.confirmationContent}
            >
              <IconSymbol name="checkmark.circle.fill" size={64} color={themeColors.tint} />
              <ThemedText type="title" style={[styles.confirmationTitle, { color: themeColors.text }]}>
                Confirmar Gravação
              </ThemedText>
              <ThemedText style={[styles.confirmationDuration, { color: themeColors.text }]}>
                {pendingRecording ? formatTime(pendingRecording.duration) : '0:00'}
              </ThemedText>
              <ThemedText style={[styles.confirmationMessage, { color: themeColors.muted }]}>
                {projectTitle
                  ? `Deseja salvar esta gravação no projeto "${projectTitle}"?`
                  : 'Deseja salvar esta gravação?'}
              </ThemedText>

              <ThemedView
                lightColor="transparent"
                darkColor="transparent"
                style={styles.confirmationButtons}
              >
                <TouchableOpacity
                  onPress={handleDiscard}
                  style={[styles.confirmationButton, styles.discardButton, {
                    borderColor: themeColors.border,
                  }]}
                  activeOpacity={0.7}
                >
                  <ThemedText style={[styles.discardButtonText, { color: themeColors.text }]}>
                    Descartar
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirmSave}
                  style={[styles.confirmationButton, styles.saveButton, {
                    backgroundColor: themeColors.tint,
                  }]}
                  activeOpacity={0.7}
                >
                  <ThemedText style={[styles.saveButtonText, { color: '#fff' }]}>
                    Salvar
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}
      </ThemedView>
    </>
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
    zIndex: 3000,
  },
  modal: {
    width: '90%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1.5,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  modalContent: {
    padding: 28,
    gap: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalTitle: {
    marginTop: 8,
    marginBottom: 6,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  modalDescription: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 8,
  },
  confirmationModal: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1.5,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  confirmationContent: {
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: 8,
  },
  confirmationDuration: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'],
    marginTop: 8,
    lineHeight: 56,
    paddingVertical: 4,
    includeFontPadding: false,
  },
  confirmationMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  confirmationButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discardButton: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  saveButton: {
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  discardButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

