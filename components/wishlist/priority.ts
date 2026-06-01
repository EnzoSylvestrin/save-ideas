export type Priority = 'high' | 'medium' | 'low';

export const PRIORITY_ORDER: Priority[] = ['high', 'medium', 'low'];

export const PRIORITY: Record<
  Priority,
  { label: string; bg: string; fg: string }
> = {
  high: { label: 'Quero muito', bg: '#ec4899', fg: '#ffffff' },
  medium: { label: 'Médio', bg: '#7c3aed', fg: '#ffffff' },
  low: { label: 'Um dia', bg: '#334155', fg: '#cbd5e1' },
};
