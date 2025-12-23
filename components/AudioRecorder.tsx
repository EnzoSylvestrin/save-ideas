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
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';

interface AudioRecorderProps {
  onRecordingComplete: (uri: string, base64: string, mimeType: string, duration: number) => void;
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
  const recordingDurationRef = useRef(0);
  
  useEffect(() => {
    recordingDurationRef.current = recordingDuration;
  }, [recordingDuration]);
  
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
        const finalDuration = recordingDurationRef.current;
        console.log('Recording processed, calling onRecordingComplete with duration:', finalDuration);
        isProcessingRef.current = false;
        onRecordingComplete(uri, base64Data, blob.type, finalDuration);
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
    // Get current status from recorder to access durationMillis
    const currentStatus = recorder?.getStatus();
    console.log('Status listener called:', status, 'hasStartedRecording:', hasStartedRecordingRef.current, 'duration:', recordingDuration, 'durationMillis:', currentStatus?.durationMillis);
    // Handle finished recording with URL - only if we actually started recording
    if (hasStartedRecordingRef.current && status.isFinished && status.url) {
      const currentProcessedId = processedRecordingId;
      if (status.url !== currentProcessedId && !isProcessingRef.current) {
        // Capture duration from recorder status FIRST (most reliable), then ref, then state
        const finalDuration = currentStatus?.durationMillis 
          ? Math.floor(currentStatus.durationMillis / 1000)
          : (recordingDurationRef.current || recordingDuration);
        console.log('Recording finished with URL (status listener):', status.url, 'final duration:', finalDuration, 'from status:', currentStatus?.durationMillis);
        // Update ref BEFORE any state changes to preserve duration
        recordingDurationRef.current = finalDuration;
        setProcessedRecordingId(status.url);
        hasStartedRecordingRef.current = false;
        // Don't reset localIsRecording here - it causes duration to reset to 0
        // The stopRecording function will handle state reset
        processRecording(status.url);
      }
    } else if (hasStartedRecordingRef.current && status.isFinished && !status.url) {
      console.warn('Recording finished but URL is null. Status:', status);
      hasStartedRecordingRef.current = false;
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
        // Use duration from recorderState if available, otherwise use ref
        const finalDuration = recorderState.durationMillis 
          ? Math.floor(recorderState.durationMillis / 1000)
          : recordingDurationRef.current;
        console.log('URL available in recorderState (useEffect fallback):', recorderState.url, 'duration:', finalDuration, 'durationMillis:', recorderState.durationMillis);
        setProcessedRecordingId(recorderState.url);
        hasStartedRecordingRef.current = false;
        recordingDurationRef.current = finalDuration;
        processRecording(recorderState.url);
      }
    }
  }, [recorderState.url, recorderState.isRecording, recorderState.durationMillis, localIsRecording, processedRecordingId, processRecording]);
  
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
        const durationSeconds = Math.floor(recorderState.durationMillis / 1000);
        setRecordingDuration(durationSeconds);
        // Also update ref to keep it in sync
        recordingDurationRef.current = durationSeconds;
      } else {
        // If recording but no duration yet, start counting manually
        const interval = setInterval(() => {
          setRecordingDuration((prev) => {
            const newDuration = prev + 1;
            recordingDurationRef.current = newDuration;
            return newDuration;
          });
        }, 1000);
        return () => clearInterval(interval);
      }
    } else {
      // Only reset if we're not processing
      if (!isProcessingRef.current) {
        setRecordingDuration(0);
      }
    }
  }, [isRecording, recorderState.durationMillis]);


  const startRecording = async () => {
    console.log('Starting recording - hasPermission:', hasPermission, 'recorder:', !!recorder);
    
    if (!recorder) {
      console.error('Recorder not initialized');
      onError?.('Gravador não inicializado. Tente novamente.');
      return;
    }
    
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

      // Check recorder status before preparing
      const currentStatus = recorder.getStatus();
      console.log('Current recorder status:', currentStatus);
      
      // If recorder is already recording, stop it first
      if (currentStatus.isRecording) {
        console.log('Recorder is already recording, stopping first...');
        try {
          await recorder.stop();
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error('Error stopping existing recording:', error);
        }
      }
      
      // Only prepare if not already prepared or if canRecord is false
      if (!recorderState.canRecord) {
        console.log('Preparing recorder...');
        try {
          // Check status again before preparing
          const statusBeforePrepare = recorder.getStatus();
          if (!statusBeforePrepare.isRecording && !statusBeforePrepare.canRecord) {
            await recorder.prepareToRecordAsync();
            console.log('Recorder prepared');
            // Wait a bit for state to update
            await new Promise(resolve => setTimeout(resolve, 200));
          } else {
            console.log('Recorder already prepared, skipping prepare');
          }
        } catch (error: any) {
          // If error is about already being prepared, that's okay
          if (error?.message?.includes('already been prepared')) {
            console.log('Recorder already prepared, continuing...');
          } else {
            console.error('Error preparing recorder:', error);
            onError?.('Erro ao preparar gravador. Tente novamente.');
            return;
          }
        }
      } else {
        console.log('Recorder already ready, skipping prepare');
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
        hasStartedRecordingRef.current = true;
        console.log('recorder.record() called, localIsRecording set to true');
        
        // Wait and verify recording started
        setTimeout(() => {
          const currentState = recorder.getStatus();
          console.log('State after record (from getStatus):', {
            isRecording: currentState.isRecording,
            canRecord: currentState.canRecord,
            durationMillis: currentState.durationMillis,
          });
          
          if (!currentState.isRecording && !recorderState.isRecording && localIsRecording) {
            console.warn('Recording did not start, trying again...');
            setLocalIsRecording(false);
            recorder.record();
            setLocalIsRecording(true);
          }
        }, 500);
      } catch (error) {
        console.error('Error calling record():', error);
        setLocalIsRecording(false);
        onError?.('Erro ao iniciar gravação');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      setLocalIsRecording(false);
      onError?.('Erro ao iniciar gravação. Verifique se o microfone está disponível.');
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording, current duration:', recordingDuration, 'recorderState duration:', recorderState.durationMillis);
    if (!recorder) return;
    
    // Capture duration from recorderState if available, otherwise use local state
    // Get the status directly from recorder to get most accurate duration
    const currentStatus = recorder.getStatus();
    const finalDuration = currentStatus.durationMillis 
      ? Math.floor(currentStatus.durationMillis / 1000)
      : (recorderState.durationMillis 
          ? Math.floor(recorderState.durationMillis / 1000)
          : recordingDuration);
    
    console.log('Final duration captured:', finalDuration, 'from status:', currentStatus.durationMillis);
    
    // Update ref IMMEDIATELY before any state changes
    recordingDurationRef.current = finalDuration;
    
    // Don't reset localIsRecording yet - wait until after processing
    // This prevents the useEffect from resetting recordingDuration to 0

    try {
      await recorder.stop();
      console.log('recorder.stop() called, final duration in ref:', recordingDurationRef.current);
      
      // Check recorder.uri directly first
      const directUri = recorder.uri;
      console.log('Direct recorder.uri:', directUri);
      
      if (directUri) {
        if (directUri !== processedRecordingId) {
          setProcessedRecordingId(directUri);
          // Process with the duration we captured
          await processRecording(directUri);
          // Only reset after processing starts
          setLocalIsRecording(false);
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
      
      // Reset after a delay to ensure processing has started
      setTimeout(() => {
        setLocalIsRecording(false);
      }, 100);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setLocalIsRecording(false);
      onError?.('Erro ao parar gravação');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const buttonScale = useSharedValue(1);
  const pulseScale1 = useSharedValue(0);
  const pulseScale2 = useSharedValue(0);
  const pulseOpacity1 = useSharedValue(0);
  const pulseOpacity2 = useSharedValue(0);
  const waveformScale = useSharedValue(0);

  useEffect(() => {
    if (isRecording) {
      buttonScale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
      pulseScale1.value = withRepeat(
        withTiming(1.8, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
      const timeoutId = setTimeout(() => {
        pulseScale2.value = withRepeat(
          withTiming(1.8, { duration: 2000, easing: Easing.out(Easing.ease) }),
          -1,
          false
        );
        pulseOpacity2.value = withRepeat(
          withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
          -1,
          false
        );
      }, 1000);
      pulseOpacity1.value = withRepeat(
        withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
      waveformScale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
      
      return () => clearTimeout(timeoutId);
    } else {
      buttonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      pulseScale1.value = withTiming(0, { duration: 200 });
      pulseScale2.value = withTiming(0, { duration: 200 });
      pulseOpacity1.value = withTiming(0, { duration: 200 });
      pulseOpacity2.value = withTiming(0, { duration: 200 });
      waveformScale.value = withTiming(0, { duration: 200 });
    }
  }, [isRecording, buttonScale, pulseScale1, pulseScale2, pulseOpacity1, pulseOpacity2, waveformScale]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const pulse1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale1.value }],
    opacity: pulseOpacity1.value,
  }));

  const pulse2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale2.value }],
    opacity: pulseOpacity2.value,
  }));

  const waveformAnimatedStyle = useAnimatedStyle(() => ({
    opacity: waveformScale.value,
    transform: [{ scaleY: interpolate(waveformScale.value, [0, 1], [0.3, 1]) }],
  }));

  const WaveformBar = ({ index, isActive }: { index: number; isActive: boolean }) => {
    const barScale = useSharedValue(0.3);
    const animationSpeed = useRef(300 + (index % 5) * 100);
    const delay = useRef((index % 7) * 50);
    
    useEffect(() => {
      if (isActive) {
        const maxHeight = 0.4 + (index % 4) * 0.15;
        
        const startAnimation = () => {
          barScale.value = withRepeat(
            withTiming(maxHeight, {
              duration: animationSpeed.current,
              easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
          );
        };
        
        if (delay.current > 0) {
          setTimeout(startAnimation, delay.current);
        } else {
          startAnimation();
        }
      } else {
        barScale.value = withTiming(0.3, { duration: 200 });
      }
    }, [isActive, index, barScale]);

    const barStyle = useAnimatedStyle(() => {
      const scale = Math.max(0.3, Math.min(1, barScale.value));
      return {
        transform: [{ scaleY: scale }],
      };
    });

    return (
      <Animated.View
        style={[
          styles.waveformBar,
          { backgroundColor: themeColors.tint },
          barStyle,
        ]}
      />
    );
  };

  if (hasPermission === null) {
    return (
      <ThemedView 
        lightColor="transparent"
        darkColor="transparent"
        style={styles.container}>
        <ActivityIndicator size="large" color={themeColors.tint} />
        <ThemedText style={[styles.loadingText, { color: themeColors.muted }]}>
          Solicitando permissões...
        </ThemedText>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    return (
      <ThemedView 
        lightColor="transparent"
        darkColor="transparent"
        style={styles.container}>
        <IconSymbol name="mic.slash.fill" size={48} color={themeColors.muted} />
        <ThemedText style={[styles.errorText, { color: themeColors.text }]}>
          Permissão de gravação necessária
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView 
      lightColor="transparent"
      darkColor="transparent"
      style={styles.container}>
      <View style={styles.recordButtonWrapper}>
        <Animated.View
          style={[
            styles.pulseRing,
            {
              borderColor: themeColors.tint,
            },
            pulse1AnimatedStyle,
          ]}
          pointerEvents="none"
        />
        <Animated.View
          style={[
            styles.pulseRing,
            {
              borderColor: themeColors.tint,
            },
            pulse2AnimatedStyle,
          ]}
          pointerEvents="none"
        />
        <Animated.View style={buttonAnimatedStyle} pointerEvents="box-none">
          <TouchableOpacity
            style={[
              styles.recordButton,
              {
                backgroundColor: isRecording ? '#ef4444' : themeColors.tint,
                shadowColor: isRecording ? '#ef4444' : themeColors.tint,
              },
            ]}
            onPress={isRecording ? stopRecording : startRecording}
            activeOpacity={0.9}
          >
            <IconSymbol
              name={isRecording ? 'stop.fill' : 'mic.fill'}
              size={isRecording ? 32 : 36}
              color="#fff"
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {isRecording && (
        <Animated.View style={[styles.waveformContainer, waveformAnimatedStyle]}>
          {[...Array(20)].map((_, i) => (
            <WaveformBar key={i} index={i} isActive={isRecording} />
          ))}
        </Animated.View>
      )}

      {isRecording && (
        <View style={styles.durationContainer}>
          <View style={[styles.recordingIndicator, { backgroundColor: '#ef4444' }]} />
          <ThemedText style={[styles.duration, { color: themeColors.text }]} numberOfLines={1} allowFontScaling={false}>
            {formatTime(recordingDuration)}
          </ThemedText>
        </View>
      )}

      <ThemedText style={[styles.label, { color: themeColors.text }]}>
        {isRecording ? 'Gravando...' : 'Toque para gravar'}
      </ThemedText>
      
      {!isRecording && (
        <ThemedText style={[styles.hint, { color: themeColors.muted }]}>
          Sua voz será transcrita automaticamente
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 24,
    minHeight: 400,
    width: '100%',
  },
  recordButtonWrapper: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    zIndex: 10,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    zIndex: 1,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 4,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
    minHeight: 8,
    maxHeight: 50,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
    paddingHorizontal: 20,
    minWidth: 150,
    height: 60,
  },
  duration: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    minWidth: 120,
    includeFontPadding: false,
    lineHeight: 50,
    paddingVertical: 4,
  },
  recordingIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 15,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

