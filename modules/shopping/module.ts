import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import type { Href } from 'expo-router';
import type { HubModule } from '../types';

function useShoppingTileData() {
  const stats = useQuery(api.shopping.getActiveStats);
  if (!stats) return {};
  return {
    count: stats.pendingCount,
    hint:
      stats.total > 0
        ? `${stats.total - stats.pendingCount}/${stats.total} no carrinho`
        : undefined,
  };
}

export const shoppingModule: HubModule = {
  id: 'shopping',
  title: 'Compras',
  icon: '🛒',
  gradient: ['#10b981', '#059669'],
  route: '/shopping',
  useTileData: useShoppingTileData,
  capture: {
    label: 'Item de compra',
    subtitle: 'Adiciona na lista num toque',
    icon: '🛒',
    quickActionId: 'capture-shopping',
    quickActionIcon: { ios: 'symbol:cart.fill', android: 'cart' },
    onTrigger: (router) => router.push('/shopping?focus=1' as Href),
  },
};
