import type { InventoryItem } from '../types';

export function createInventoryItem(id: string, name: string): InventoryItem {
  return {
    id,
    name,
    type: 'base',
    quantity: 1,
    rarity: 'common',
  };
}
