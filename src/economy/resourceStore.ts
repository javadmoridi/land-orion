import { create } from 'zustand';
import { useGameStore } from '../game/useGameStore';
import { getPlayerEco, patchPlayerEco } from './playerApi';
import { QUESTS } from './quests';
import type { QuestContext } from './quests';

export interface PlayerResources {
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
}

export const STARTING_RESOURCES: PlayerResources = {
  coins: 0,
  tokens: 0,
  gems: 0,

  water: 0,
  air: 0,
  earth: 0,
  fire: 0,

  wood: 0,
  stone: 0,
  iron: 0,
  gold: 0,
  crystal: 0,
};

export interface ResourceSaveData extends PlayerResources {
  claimedQuestIds: string[];
}

export interface ResourceBackend {
  load(): Promise<ResourceSaveData | null>;
  save(data: ResourceSaveData): Promise<void>;
}

const supabaseResourceBackend: ResourceBackend = {
  async load() {
    // Resources load from the player's Supabase economy row — never from
    // browser storage, so they survive across devices.
    const eco = await getPlayerEco();

    if (!eco) {
      return null;
    }

    const r = eco.resources ?? {};

    return {
      coins: Number(r.coins ?? 0),
      tokens: Number(r.tokens ?? 0),
      gems: Number(r.gems ?? 0),
      water: Number(r.water ?? 0),
      air: Number(r.air ?? 0),
      earth: Number(r.earth ?? 0),
      fire: Number(r.fire ?? 0),
      wood: Number(r.wood ?? 0),
      stone: Number(r.stone ?? 0),
      iron: Number(r.iron ?? 0),
      gold: Number(r.gold ?? 0),
      crystal: Number(r.crystal ?? 0),
      claimedQuestIds: eco.claimedQuestIds ?? [],
    };
  },

  async save(data) {
    await patchPlayerEco({
      resources: {
        coins: Number(data.coins ?? 0),
        tokens: Number(data.tokens ?? 0),
        gems: Number(data.gems ?? 0),
        water: Number(data.water ?? 0),
        air: Number(data.air ?? 0),
        earth: Number(data.earth ?? 0),
        fire: Number(data.fire ?? 0),
        wood: Number(data.wood ?? 0),
        stone: Number(data.stone ?? 0),
        iron: Number(data.iron ?? 0),
        gold: Number(data.gold ?? 0),
        crystal: Number(data.crystal ?? 0),
      },
      claimedQuestIds: data.claimedQuestIds ?? [],
    });
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
  spendTokens: (amount: number) => boolean;

  addGems: (amount: number) => void;
  spendGems: (amount: number) => boolean;

  addWater: (amount: number) => void;
  addAir: (amount: number) => void;
  addEarth: (amount: number) => void;
  addFire: (amount: number) => void;

  spendWater: (amount: number) => boolean;
  spendAir: (amount: number) => boolean;
  spendEarth: (amount: number) => boolean;
  spendFire: (amount: number) => boolean;

  addWood: (amount: number) => void;
  addStone: (amount: number) => void;
  addIron: (amount: number) => void;
  addGold: (amount: number) => void;
  addCrystal: (amount: number) => void;

  spendWood: (amount: number) => boolean;
  spendStone: (amount: number) => boolean;
  spendIron: (amount: number) => boolean;
  spendGold: (amount: number) => boolean;
  spendCrystal: (amount: number) => boolean;

  addResource: (
    key: keyof PlayerResources,
    amount: number,
  ) => void;

  spendResource: (
    key: keyof PlayerResources,
    amount: number,
  ) => boolean;

  getResource: (
    key: keyof PlayerResources,
  ) => number;

  claimQuest: (questId: string) => void;
  canClaimQuest: (questId: string) => boolean;
  buildQuestContext: () => QuestContext;

  reset: () => void;
}

function isValidAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount > 0;
}

export const useResourceStore =
  create<ResourceStoreState>((set, get) => ({
    resources: {
      ...STARTING_RESOURCES,
    },

    claimedQuestIds: [],

    backend: supabaseResourceBackend,

    initialized: false,

    initialize: async () => {
      if (get().initialized) {
        return;
      }

      const data = await get().backend.load();

      if (data) {
        set({
          resources: {
            coins: data.coins ?? 0,
            tokens: data.tokens ?? 0,
            gems: data.gems ?? 0,

            water: data.water ?? 0,
            air: data.air ?? 0,
            earth: data.earth ?? 0,
            fire: data.fire ?? 0,

            wood: data.wood ?? 0,
            stone: data.stone ?? 0,
            iron: data.iron ?? 0,
            gold: data.gold ?? 0,
            crystal: data.crystal ?? 0,
          },

          claimedQuestIds:
            data.claimedQuestIds ?? [],

          initialized: true,
        });
      } else {
        set({
          resources: {
            ...STARTING_RESOURCES,
          },

          claimedQuestIds: [],

          initialized: true,
        });

        void get().persist();
      }
    },

    persist: async () => {
      const {
        resources,
        claimedQuestIds,
        backend,
      } = get();

      await backend.save({
        ...resources,
        claimedQuestIds,
      });
    },

    addCoins: (amount) => {
      if (!isValidAmount(amount)) {
        return;
      }

      set((state) => ({
        resources: {
          ...state.resources,
          coins:
            state.resources.coins + amount,
        },
      }));

      void get().persist();
    },

    spendCoins: (amount) => {
      if (
        !isValidAmount(amount) ||
        get().resources.coins < amount
      ) {
        return false;
      }

      set((state) => ({
        resources: {
          ...state.resources,
          coins:
            state.resources.coins - amount,
        },
      }));

      void get().persist();

      return true;
    },

    addTokens: (amount) => {
      if (!isValidAmount(amount)) {
        return;
      }

      set((state) => ({
        resources: {
          ...state.resources,
          tokens:
            state.resources.tokens + amount,
        },
      }));

      void get().persist();
    },

    spendTokens: (amount) => {
      if (
        !isValidAmount(amount) ||
        get().resources.tokens < amount
      ) {
        return false;
      }

      set((state) => ({
        resources: {
          ...state.resources,
          tokens:
            state.resources.tokens - amount,
        },
      }));

      void get().persist();

      return true;
    },

    addGems: (amount) => {
      if (!isValidAmount(amount)) {
        return;
      }

      set((state) => ({
        resources: {
          ...state.resources,
          gems:
            state.resources.gems + amount,
        },
      }));

      void get().persist();
    },

    spendGems: (amount) => {
      if (
        !isValidAmount(amount) ||
        get().resources.gems < amount
      ) {
        return false;
      }

      set((state) => ({
        resources: {
          ...state.resources,
          gems:
            state.resources.gems - amount,
        },
      }));

      void get().persist();

      return true;
    },

    addWater: (amount) => {
      get().addResource('water', amount);
    },

    addAir: (amount) => {
      get().addResource('air', amount);
    },

    addEarth: (amount) => {
      get().addResource('earth', amount);
    },

    addFire: (amount) => {
      get().addResource('fire', amount);
    },

    spendWater: (amount) => {
      return get().spendResource(
        'water',
        amount,
      );
    },

    spendAir: (amount) => {
      return get().spendResource(
        'air',
        amount,
      );
    },

    spendEarth: (amount) => {
      return get().spendResource(
        'earth',
        amount,
      );
    },

    spendFire: (amount) => {
      return get().spendResource(
        'fire',
        amount,
      );
    },

    addWood: (amount) => {
      get().addResource('wood', amount);
    },

    addStone: (amount) => {
      get().addResource('stone', amount);
    },

    addIron: (amount) => {
      get().addResource('iron', amount);
    },

    addGold: (amount) => {
      get().addResource('gold', amount);
    },

    addCrystal: (amount) => {
      get().addResource('crystal', amount);
    },

    spendWood: (amount) => {
      return get().spendResource(
        'wood',
        amount,
      );
    },

    spendStone: (amount) => {
      return get().spendResource(
        'stone',
        amount,
      );
    },

    spendIron: (amount) => {
      return get().spendResource(
        'iron',
        amount,
      );
    },

    spendGold: (amount) => {
      return get().spendResource(
        'gold',
        amount,
      );
    },

    spendCrystal: (amount) => {
      return get().spendResource(
        'crystal',
        amount,
      );
    },

    addResource: (key, amount) => {
      if (!isValidAmount(amount)) {
        return;
      }

      set((state) => ({
        resources: {
          ...state.resources,
          [key]:
            state.resources[key] + amount,
        },
      }));

      void get().persist();
    },

    spendResource: (key, amount) => {
      if (!isValidAmount(amount)) {
        return false;
      }

      const current =
        get().resources[key];

      if (current < amount) {
        return false;
      }

      set((state) => ({
        resources: {
          ...state.resources,
          [key]:
            state.resources[key] - amount,
        },
      }));

      void get().persist();

      return true;
    },

    getResource: (key) => {
      return get().resources[key];
    },

         claimQuest: (questId) => {
      const quest = QUESTS.find(
        (q) => q.id === questId,
      );

      if (!quest) {
        return;
      }

      if (
        get().claimedQuestIds.includes(
          questId,
        )
      ) {
        return;
      }

      if (!get().canClaimQuest(questId)) {
        return;
      }

      // REAL consumption: the cost (what the character "takes")
      // is deducted from the player's resources before the reward
      // is granted. If anything is missing, the trade is aborted so
      // nothing is created out of thin air.
      const cost =
        (quest.cost ?? {}) as Partial<PlayerResources>;

      const current =
        get().resources;

      for (const _k in cost) {
        const key = _k as keyof PlayerResources;
        const amount =
          Number(cost[key] ?? 0);

        if (amount > 0) {
          if (
            (current[key] ?? 0) < amount
          ) {
            return;
          }
        }
      }

      set((state) => {
        const nextResources = {
          ...state.resources,
        };

        for (const _k in cost) {
          const key = _k as keyof PlayerResources;
          const amount =
            Number(cost[key] ?? 0);

          if (amount > 0) {
            nextResources[key] =
              (nextResources[key] ?? 0) - amount;
          }
        }

        return {
          resources: {
            ...nextResources,

            coins:
              nextResources.coins +
              quest.reward.coins,

            tokens:
              nextResources.tokens +
              quest.reward.tokens,

            gems:
              nextResources.gems +
              quest.reward.gems,
          },

          claimedQuestIds: [
            ...state.claimedQuestIds,
            questId,
          ],
        };
      });

      void get().persist();
    },

    canClaimQuest: (questId) => {
      const quest = QUESTS.find(
        (q) => q.id === questId,
      );

      if (!quest) {
        return false;
      }

      if (
        get().claimedQuestIds.includes(
          questId,
        )
      ) {
        return false;
      }

      return quest.condition.test(
        get().buildQuestContext(),
      );
    },

    buildQuestContext: () => {
      const {
        resources,
        claimedQuestIds,
      } = get();

      return {
        coins: resources.coins,
        tokens: resources.tokens,
        gems: resources.gems,

        water: resources.water,
        air: resources.air,
        earth: resources.earth,
        fire: resources.fire,

        wood: resources.wood,
        stone: resources.stone,

        food:
          useGameStore
            .getState()
            .gameState
            ?.resources?.food ?? 0,

        housesBuilt: 1,

        questsClaimed:
          claimedQuestIds.length,
      };
    },

    reset: () => {
      set({
        resources: {
          ...STARTING_RESOURCES,
        },

        claimedQuestIds: [],
      });

      void get().persist();
    },
  }));