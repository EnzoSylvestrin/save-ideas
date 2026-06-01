import { api } from '@/convex/_generated/api';
import { formatBRL } from '@/utils/currency';
import { useQuery } from 'convex/react';
import type { HubModule } from '../types';

function useWishlistTileData() {
  const stats = useQuery(api.wishlist.getWishlistStats);
  if (!stats) return {};
  return {
    count: stats.activeCount,
    hint: stats.activeTotal > 0 ? formatBRL(stats.activeTotal) : undefined,
  };
}

export const wishlistModule: HubModule = {
  id: 'wishlist',
  title: 'Desejos',
  icon: '🛍️',
  gradient: ['#ec4899', '#db2777'],
  route: '/wishlist',
  useTileData: useWishlistTileData,
  capture: {
    label: 'Desejo',
    subtitle: 'Cola um link ou escreve o que você quer',
    icon: '🛍️',
    quickActionId: 'capture-wishlist',
    quickActionIcon: { ios: 'symbol:bag.fill', android: 'bag' },
    onTrigger: (router) => router.push('/wishlist/add'),
  },
};
