import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  type RecordingStatus
} from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';

interface AudioRecorderProps {
  onRecordingComplete: (uri: string, base64: string, mimeType: string) => void;
  onError?: (error: string) => void;
}

export function AudioRecorder({ onRecordingComplete, onError }: AudioRecorderProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [processedRecordingId, setProcessedRecordingId] = useState<string | null>(null);
  const [localIsRecording, setLocalIsRecording] = useState(false);
  const hasStartedRecordingRef = useRef(false);
  const isProcessingRef = useRef(false);
  
  const processRecording = useCallback(async (uri: string) => {
    // Prevent duplicate processing
    if (isProcessingRef.current) {
      console.log('Already processing, skipping duplicate call');
      return;
    }
    
    isProcessingRef.current = true;
    try {
      console.log('Processing recording from URI:', uri);
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        console.log('Recording processed, calling onRecordingComplete');
        isProcessingRef.current = false;
        onRecordingComplete(uri, base64Data, blob.type);
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        isProcessingRef.current = false;
        onError?.('Erro ao ler arquivo de gravação');
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error processing recording:', error);
      isProcessingRef.current = false;
      onError?.('Erro ao processar gravação');
    }
  }, [onRecordingComplete, onError]);
  
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (status: RecordingStatus) => {
    console.log('Status listener called:', status, 'hasStartedRecording:', hasStartedRecordingRef.current);
    // Handle finished recording with URL - only if we actually started recording
    if (hasStartedRecordingRef.current && status.isFinished && status.url) {
      const currentProcessedId = processedRecordingId;
      if (status.url !== currentProcessedId && !isProcessingRef.current) {
        console.log('Recording finished with URL (status listener):', status.url);
        setProcessedRecordingId(status.url);
        setLocalIsRecording(false);
        hasStartedRecordingRef.current = false; // Reset flag
        processRecording(status.url);
      }
    } else if (hasStartedRecordingRef.current && status.isFinished && !status.url) {
      console.warn('Recording finished but URL is null. Status:', status);
      hasStartedRecordingRef.current = false; // Reset flag even if no URL
    }
  });
  
  // Prepare recorder on mount
  useEffect(() => {
    const prepareRecorder = async () => {
      if (recorder && hasPermission) {
        try {
          console.log('Preparing recorder on mount...');
          await recorder.prepareToRecordAsync();
          console.log('Recorder prepared on mount');
        } catch (error) {
          console.error('Error preparing recorder on mount:', error);
        }
      }
    };
    
    prepareRecorder();
  }, [recorder, hasPermission]);

  const recorderState = useAudioRecorderState(recorder, 100);
  // Use local state as primary, fallback to recorderState
  const isRecording = localIsRecording || recorderState.isRecording;
  
  // Monitor recorderState for URL availability after stopping (fallback if status listener doesn't fire)
  useEffect(() => {
    // Only process if we've actually started a recording and it's now finished
    // And only if we haven't already processed this URL
    if (hasStartedRecordingRef.current && !localIsRecording && !recorderState.isRecording && recorderState.url) {
      // Recording just finished and URL is available
      if (recorderState.url !== processedRecordingId && !isProcessingRef.current) {
        console.log('URL available in recorderState (useEffect fallback):', recorderState.url);
        setProcessedRecordingId(recorderState.url);
        hasStartedRecordingRef.current = false; // Reset flag
        processRecording(recorderState.url);
      }
    }
  }, [recorderState.url, recorderState.isRecording, localIsRecording, processedRecordingId, processRecording]);
  
  // Debug logs
  useEffect(() => {
    console.log('Recorder state:', {
      isRecording: recorderState.isRecording,
      canRecord: recorderState.canRecord,
      durationMillis: recorderState.durationMillis,
      url: recorderState.url,
      localIsRecording,
    });
  }, [recorderState, localIsRecording]);

  const initPermissions = useCallback(async () => {
    try {
      const permissionResponse = await getRecordingPermissionsAsync();
      
      if (permissionResponse.granted) {
        setHasPermission(true);
        return;
      }

      const requestResponse = await requestRecordingPermissionsAsync();
      setHasPermission(requestResponse.granted);
      
      if (!requestResponse.granted) {
        onError?.('Permissão de gravação negada. Por favor, permita o acesso ao microfone nas configurações do dispositivo.');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      onError?.('Erro ao solicitar permissões de gravação');
      setHasPermission(false);
    }
  }, [onError]);

  useEffect(() => {
    initPermissions();
  }, [initPermissions]);

  useEffect(() => {
    return () => {
      if (recorder && isRecording) {
        recorder.stop().catch(() => {});
      }
    };
  }, [recorder, isRecording]);

  useEffect(() => {
    if (isRecording) {
      if (recorderState.durationMillis) {
        setRecordingDuration(Math.floor(recorderState.durationMillis / 1000));
      } else {
        // If recording but no duration yet, start counting manually
        const interval = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
      }
    } else {
      setRecordingDuration(0);
    }
  }, [isRecording, recorderState.durationMillis]);


  const startRecording = async () => {
    console.log('Starting recording - hasPermission:', hasPermission);
    try {
      if (!hasPermission) {
        const permissionResponse = await getRecordingPermissionsAsync();
        console.log('Permission response:', permissionResponse);
        if (!permissionResponse.granted) {
          const requestResponse = await requestRecordingPermissionsAsync();
          console.log('Request response:', requestResponse);
          if (!requestResponse.granted) {
            onError?.('Permissão de gravação necessária');
            return;
          }
        }
        setHasPermission(true);
      }

      console.log('Setting audio mode...');
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      // Prepare recorder if not already ready
      if (!recorderState.canRecord) {
        console.log('Preparing recorder...');
        try {
          await recorder.prepareToRecordAsync();
          console.log('Recorder prepared');
          // Wait a bit for state to update
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error('Error preparing recorder:', error);
        }
      }

      console.log('Calling recorder.record()...');
      console.log('Can record before:', recorderState.canRecord);
      
      // Reset processing flag for new recording
      isProcessingRef.current = false;
      setProcessedRecordingId(null);
      
      // Try to record
      try {
        recorder.record();
        setLocalIsRecording(true);
        hasStartedRecordingRef.current = true; // Mark that we've started recording
        console.log('recorder.record() called, localIsRecording set to true');
        
        // Wait and verify recording started
        setTimeout(() => {
          const currentState = recorder.getStatus();
          console.log('State after record (from getStatus):', {
            isRecording: currentState.isRecording,
            canRecord: currentState.canRecord,
            durationMillis: currentState.durationMillis,
          });
          
          if (!currentState.isRecording && !recorderState.isRecording) {
            console.warn('Recording did not start, trying again...');
            // Try once more
            recorder.record();
          }
        }, 300);
      } catch (error) {
        console.error('Error calling record():', error);
        onError?.('Erro ao iniciar gravação');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      onError?.('Erro ao iniciar gravação. Verifique se o microfone está disponível.');
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording');
    if (!recorder) return;
    
    setLocalIsRecording(false);

    try {
      await recorder.stop();
      console.log('recorder.stop() called');
      
      // Check recorder.uri directly first
      const directUri = recorder.uri;
      console.log('Direct recorder.uri:', directUri);
      
      if (directUri) {
        if (directUri !== processedRecordingId) {
          setProcessedRecordingId(directUri);
          await processRecording(directUri);
          return;
        }
      }
      
      // If no direct URI, wait a bit for recorderState to update
      // The useEffect above will handle it when recorderState.url becomes available
      setTimeout(() => {
        if (!recorderState.url) {
          console.warn('No URI available after stopping recording');
          onError?.('Não foi possível obter o arquivo de gravação. Tente gravar novamente.');
        }
      }, 1000);
    } catch (error) {
      console.error('Error stopping recording:', error);
      onError?.('Erro ao parar gravação');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === null) {
    return (
      <ThemedView 
        lightColor="transparent"
        darkColor="transparent"
        style={styles.container}>
        <ActivityIndicator />
        <ThemedText>Solicitando permissões...</ThemedText>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    return (
      <ThemedView 
        lightColor="transparent"
        darkColor="transparent"
        style={styles.container}>
        <ThemedText>Permissão de gravação necessária</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView 
      lightColor="transparent"
      darkColor="transparent"
      style={styles.container}>
      <ThemedView 
        lightColor="transparent"
        darkColor="transparent"
        style={[styles.recordButtonContainer, isRecording && styles.recordingContainer]}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive,
            { 
              backgroundColor: isRecording ? '#ef4444' : themeColors.tint,
              shadowColor: isRecording ? '#ef4444' : themeColors.tint,
            }
          ]}
          onPress={isRecording ? stopRecording : startRecording}
          activeOpacity={0.85}
        >
          <IconSymbol
            name={isRecording ? 'stop.fill' : 'mic.fill'}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
        {isRecording && (
          <ThemedView 
            lightColor="transparent"
            darkColor="transparent"
            style={[styles.pulseRing, { borderColor: themeColors.tint }]} />
        )}
      </ThemedView>
      {isRecording && (
        <ThemedView 
          lightColor="transparent"
          darkColor="transparent"
          style={styles.durationContainer}>
          <ThemedText style={[styles.duration, { color: themeColors.text }]}>
            {formatTime(recordingDuration)}
          </ThemedText>
          <ThemedView style={[styles.recordingIndicator, { backgroundColor: '#ef4444' }]} />
        </ThemedView>
      )}
      <ThemedText style={[styles.label, { color: themeColors.text }]}>
        {isRecording ? 'Gravando... Toque para parar' : 'Toque para gravar sua ideia'}
      </ThemedText>
      {!isRecording && (
        <ThemedText style={[styles.hint, { color: themeColors.muted }]}>
          Sua voz será transcrita e processada automaticamente
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 20,
    minHeight: 320,
  },
  recordButtonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    zIndex: 2,
  },
  recordButtonActive: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    opacity: 0.3,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  duration: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 32,
    lineHeight: 18,
  },
});

