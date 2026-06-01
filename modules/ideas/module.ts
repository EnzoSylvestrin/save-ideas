import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import type { HubModule } from '../types';

function useIdeasTileData() {
  const overview = useQuery(api.ideas.getHubOverview);
  if (!overview) return {};
  return {
    count: overview.ideaCount,
    hint:
      overview.projectCount === 1
        ? '1 projeto'
        : `${overview.projectCount} projetos`,
  };
}

export const ideasModule: HubModule = {
  id: 'ideas',
  title: 'Ideias',
  icon: '💡',
  gradient: ['#6366f1', '#4f46e5'],
  route: '/ideas',
  useTileData: useIdeasTileData,
  capture: {
    label: 'Ideia (voz)',
    subtitle: 'Grava e a IA organiza',
    icon: '💡',
    quickActionId: 'capture-ideas',
    quickActionIcon: { ios: 'symbol:mic.fill', android: 'mic' },
    onTrigger: (router) => router.push('/quick-record'),
  },
};
