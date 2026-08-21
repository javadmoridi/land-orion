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
}

export interface QuestReward {
  coins?: number;
  tokens?: number;
  gems?: number;
}

export interface QuestCost {
  coins?: number;
  tokens?: number;
  gems?: number;

  water?: number;
  air?: number;
  earth?: number;
  fire?: number;

  wood?: number;
  stone?: number;
  iron?: number;
  gold?: number;
  crystal?: number;

  food?: number;
}

export interface QuestCondition {
  label: string;
  test: (ctx: QuestContext) => boolean;
}

export interface Quest {
  id: string;
  characterId: string;
  day?: number;

  title: string;
  description: string;

  condition: QuestCondition;

  reward: QuestReward;
  cost?: QuestCost;
}