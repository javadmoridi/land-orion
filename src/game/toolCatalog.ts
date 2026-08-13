// ===========================================================================
// Tool catalog — sold in the Orion Supply (tool shop).
//   * Orion Axe
//   * Stone / Iron / Gold / Crystal Pickaxe
// ===========================================================================

export type ToolId =
  | 'orion-axe'
  | 'stone-pickaxe'
  | 'iron-pickaxe'
  | 'gold-pickaxe'
  | 'crystal-pickaxe';

export interface ToolCost {
  coins?: number;
  wood?: number;
  stone?: number;
  iron?: number;
  gold?: number;
}

export interface ToolDef {
  id: ToolId;
  name: string;
  image: string;
  type: 'tool';
  /** Pickaxe tier: axe = 0, stone = 1, iron = 2, gold = 3, crystal = 4. */
  rank: number;
  cost: ToolCost;
}

export const TOOLS: ToolDef[] = [
  {
    id: 'orion-axe',
    name: 'Orion Axe',
    image: '/assets/orion-axe.png',
    type: 'tool',
    rank: 0,
    cost: { coins: 30 },
  },
  {
    id: 'stone-pickaxe',
    name: 'Stone Pickaxe',
    image: '/assets/orion-stone-pickaxe.png',
    type: 'tool',
    rank: 1,
    cost: { wood: 3, coins: 45 },
  },
  {
    id: 'iron-pickaxe',
    name: 'Iron Pickaxe',
    image: '/assets/orion-iron-pickaxe.png',
    type: 'tool',
    rank: 2,
    cost: { wood: 3, stone: 5, coins: 60 },
  },
  {
    id: 'gold-pickaxe',
    name: 'Gold Pickaxe',
    image: '/assets/orion-gold-pickaxe.png',
    type: 'tool',
    rank: 3,
    cost: { wood: 3, iron: 5, coins: 100 },
  },
  {
    id: 'crystal-pickaxe',
    name: 'Crystal Pickaxe',
    image: '/assets/orion-crystal-pickaxe.png',
    type: 'tool',
    rank: 4,
    cost: { wood: 3, gold: 3, coins: 200 },
  },
];

/** Minimum pickaxe rank required to mine each mineral. */
export const PICKAXE_MIN_RANK: Record<
  'stone' | 'iron' | 'gold' | 'crystal',
  number
> = {
  stone: 1,
  iron: 2,
  gold: 3,
  crystal: 4,
};