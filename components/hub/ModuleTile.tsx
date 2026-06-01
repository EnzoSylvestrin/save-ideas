import type { HubModule } from '@/modules/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function ModuleTile({ module }: { module: HubModule }) {
  const router = useRouter();
  const data = module.useTileData?.() ?? {};

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(module.route as Href)}
    >
      <LinearGradient
        colors={module.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tile}
      >
        <Text style={styles.icon}>{module.icon}</Text>
        <View>
          <Text style={styles.name}>{module.title}</Text>
          {data.count !== undefined && (
            <Text style={styles.count}>
              {data.count}
              {data.hint ? ` · ${data.hint}` : ''}
            </Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    height: 130,
    borderRadius: 22,
    padding: 16,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  icon: { fontSize: 26 },
  name: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  count: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5, fontWeight: '600', marginTop: 2 },
});
