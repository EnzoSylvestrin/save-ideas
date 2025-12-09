import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: themeColors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

interface SkeletonCardProps {
  style?: any;
}

export function SkeletonCard({ style }: SkeletonCardProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  return (
    <View
      style={[
        {
          padding: 20,
          borderRadius: 20,
          borderWidth: 1.5,
          borderColor: themeColors.border,
          backgroundColor: themeColors.cardBackground,
          marginBottom: 16,
        },
        style,
      ]}>
      <Skeleton width="60%" height={20} borderRadius={8} style={{ marginBottom: 12 }} />
      <Skeleton width="100%" height={16} borderRadius={6} style={{ marginBottom: 8 }} />
      <Skeleton width="80%" height={16} borderRadius={6} />
    </View>
  );
}

