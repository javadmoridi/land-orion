import { create } from 'zustand';
import { useGameStore } from '../game/useGameStore';
import { useGemStore } from './gemStore';

// ===========================================================================
// Land-Orion player resource system (coins + Orion Token + Gems)
// ===========================================================================

export interface PlayerResources {
  coins: number;
  tokens: number;
  gems: number;
}

export interface QuestContext {
  coins: number;
  tokens: number;
  gems: number;
  wood: number;
  stone: number;
  food: number;
  housesBuilt: number;
  questsClaimed: number;
}

export interface QuestCondition {
  label: string;
  test: (ctx: QuestContext) => boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  condition: QuestCondition;
  reward: PlayerResources;
}

export const STARTING_RESOURCES: PlayerResources = {
  coins: 1000,
  tokens: 0,
  gems: 0,
};

// ---------------------------------------------------------------------------
// Quest definitions
// ---------------------------------------------------------------------------

export const QUESTS: Quest[] = [
  {
    id: 'build-first-house',
    title: 'Build your first house',
    description: 'Place your very first house on your island.',
    condition: {
      label: 'Place a house on your island',
      test: (ctx) => ctx.housesBuilt >= 1,
    },
    reward: {
      coins: 100,
      tokens: 5,
      gems: 10,
    },
  },
  {
    id: 'harvest-first-tree',
    title: 'Harvest your first tree',
    description: 'Chop down a tree to gather its wood.',
    condition: {
      label: 'Gather at least 5 wood',
      test: (ctx) => ctx.wood >= 5,
    },
    reward: {
      coins: 50,
      tokens: 5,
      gems: 5,
    },
  },
  {
    id: 'harvest-first-stone',
    title: 'Harvest your first stone',
    description: 'Mine a rock to gather some stone.',
    condition: {
      label: 'Gather at least 3 stone',
      test: (ctx) => ctx.stone >= 3,
    },
    reward: {
      coins: 75,
      tokens: 3,
      gems: 3,
    },
  },
  {
    id: 'test-million-reward',
    title: 'Test Daily Reward',
    description: 'One day test reward.',
    condition: {
      label: 'Complete test',
      test: () => true,
    },
    reward: {
      coins: 1000000000,
      tokens: 1000000000,
      gems: 1000000,
    },
  },
  {
    id: 'gather-some-food',
    title: 'Gather some food',
    description: 'Tend your farm to gather fresh food.',
    condition: {
      label: 'Gather at least 10 food',
      test: (ctx) => ctx.food >= 10,
    },
    reward: {
      coins: 60,
      tokens: 2,
      gems: 2,
    },
  },
];export interface ResourceSaveData {
  coins: number;
  tokens: number;
  gems: number;
  claimedQuestIds: string[];
}

export interface ResourceBackend {
  load(): Promise<ResourceSaveData | null>;
  save(data: ResourceSaveData): Promise<void>;
}

const LOCAL_STORAGE_KEY = 'land-orion-resources';

const localResourceBackend: ResourceBackend = {
  async load(): Promise<ResourceSaveData | null> {
    if (typeof window === 'undefined') return null;

    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as ResourceSaveData;
    } catch {
      return null;
    }
  },

  async save(data: ResourceSaveData): Promise<void> {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(data)
      );
    }
  },
};

interface ResourceStoreState {
  resources: PlayerResources;
  claimedQuestIds: string[];
  backend: ResourceBackend;
  initialized: boolean;

  initialize: () => Promise<void>;
  persist: () => Promise<void>;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addTokens: (amount: number) => void;
  claimQuest: (questId: string) => void;
  canClaimQuest: (questId: string) => boolean;
  buildQuestContext: () => QuestContext;
  reset: () => void;
}

export const useResourceStore = create<ResourceStoreState>((set, get) => ({
  resources: { ...STARTING_RESOURCES },
  claimedQuestIds: [],
  backend: localResourceBackend,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    const data = await get().backend.load();

    if (data) {
      set({
        resources: {
          coins: data.coins,
          tokens: data.tokens,
          gems: data.gems ?? 0,
        },
        claimedQuestIds: Array.isArray(data.claimedQuestIds)
          ? data.claimedQuestIds
          : [],
        initialized: true,
      });
    } else {
      set({ initialized: true });
      void get().persist();
    }
  },

  persist: async () => {
    const { resources, claimedQuestIds, backend } = get();

    await backend.save({
      coins: resources.coins,
      tokens: resources.tokens,
      gems: resources.gems,
      claimedQuestIds,
    });
  },

  addCoins: (amount) => {
    set((s) => ({
      resources: {
        ...s.resources,
        coins: s.resources.coins + amount,
      },
    }));

    void get().persist();
  },

  spendCoins: (amount) => {
    if (amount < 0 || get().resources.coins < amount) {
      return false;
    }

    set((s) => ({
      resources: {
        ...s.resources,
        coins: s.resources.coins - amount,
      },
    }));

    void get().persist();
    return true;
  },

  addTokens: (amount) => {
    set((s) => ({
      resources: {
        ...s.resources,
        tokens: s.resources.tokens + amount,
      },
    }));

    void get().persist();
  },

  claimQuest: (questId) => {
    const quest = QUESTS.find((q) => q.id === questId);
    if (!quest) return;

    const { resources, claimedQuestIds } = get();

    if (claimedQuestIds.includes(questId)) return;
    if (!get().canClaimQuest(questId)) return;

    set({
      resources: {
        coins: resources.coins + quest.reward.coins,
        tokens: resources.tokens + quest.reward.tokens,
        gems: resources.gems,
      },
      claimedQuestIds: [...claimedQuestIds, questId],
    });

    if (quest.reward.gems > 0) {
      useGemStore.getState().addGems(quest.reward.gems);
    }

    void get().persist();
  },

  canClaimQuest: (questId) => {
    const quest = QUESTS.find((q) => q.id === questId);

    if (!quest) return false;
    if (get().claimedQuestIds.includes(questId)) return false;

    return quest.condition.test(get().buildQuestContext());
  },

  buildQuestContext: () => {
    const { resources, claimedQuestIds } = get();

    const gameState = useGameStore.getState().gameState;
    const harvested = gameState?.resources ?? {};

    return {
      coins: resources.coins,
      tokens: resources.tokens,
      gems: resources.gems,
      wood: harvested.wood ?? 0,
      stone: harvested.stone ?? 0,
      food: harvested.food ?? 0,
      housesBuilt: 1,
      questsClaimed: claimedQuestIds.length,
    };
  },

  reset: () => {
    set({
      resources: { ...STARTING_RESOURCES },
      claimedQuestIds: [],
    });

    void get().persist();
  },
}));