import type { PlayerResources } from '../resourceStore';

export type QuestCharacterId =
  | 'lyra'
  | 'kael'
  | 'nyx'
  | 'aeris'
  | 'orion';

/**
 * Extra context passed to quest condition tests.
 * `inventoryQuantities` maps inventory item ids
 * (fruits, foods, ...) to the owned amount.
 */
export interface QuestContext {
  coins: number;
  tokens: number;
  gems: number;

  water: number;
  air: number;
  earth: number;
  fire: number;

  wood: number;
  stone: number;
  iron: number;
  gold: number;
  crystal: number;

  food: number;
  housesBuilt: number;
  questsClaimed: number;

  inventoryQuantities?: Record<
    string,
    number
  >;
}

export interface QuestCondition {
  label: string;
  test: (
    ctx: QuestContext,
  ) => boolean;
}

export interface QuestCharacter {
  id: QuestCharacterId;
  name: string;
  title: string;
  image: string;
}

/** What the character asks the player to deliver. */
export interface QuestRequirement {
  /** 'resource' = PlayerResources key, 'inventory' = inventory item id. */
  kind: 'resource' | 'inventory';

  id: string;
  name: string;
  amount: number;
  image?: string;
}

export interface QuestInventoryCost {
  id: string;
  name: string;
  quantity: number;
}

export interface Quest {
  id: string;
  characterId: QuestCharacterId;

  title: string;
  description: string;

  requirement: QuestRequirement;
  condition: QuestCondition;

  reward: PlayerResources;

  /**
   * Resources actually consumed when claimed.
   */
  cost?: Partial<PlayerResources>;

  /**
   * Inventory items actually consumed when claimed
   * (fruits, cooked foods, ...).
   */
  inventoryCost?: QuestInventoryCost[];
}