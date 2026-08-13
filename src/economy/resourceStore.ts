import { create } from 'zustand';
import { useGameStore } from '../game/useGameStore';

// ===========================================================================
// Land-Orion player resource system.
//
// Currencies:
//   coins  -> main in-game currency
//   tokens -> Orion Token placeholder
//
// Elemental resources:
//   water -> آب
//   air   -> باد
//   earth -> خاک
//   fire  -> آتش
//
// The four elemental resources are used by the Miner system.
// ===========================================================================

export interface PlayerResources {
  /** In-game soft currency. */
  coins: number;

  /** Hypothetical Orion Token. */
  tokens: number;

  /** Elemental resource: Water. */
  water: number;

  /** Elemental resource: Air. */
  air: number;

  /** Elemental resource: Earth. */
  earth: number;

  /** Elemental resource: Fire. */
  fire: number;
}

/** Snapshot of the world used to evaluate quest conditions. */
export interface QuestContext {
  coins: number;
  tokens: number;

  water: number;
  air: number;
  earth: number;
  fire: number;

  wood: number;
  stone: number;
  food: number;

  /** Number of houses currently placed on the island. */
  housesBuilt: number;

  /** Number of quests the player has already claimed. */
  questsClaimed: number;
}

export interface QuestCondition {
  /** Human-readable condition shown in the Quest UI. */
  label: string;

  /** Predicate evaluated against the current QuestContext. */
  test: (ctx: QuestContext) => boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  condition: QuestCondition;
  reward: PlayerResources;
}

/** Balances given to a brand new player. */
export const STARTING_RESOURCES: PlayerResources = {
  coins: 1000,
  tokens: 0,

  water: 0,
  air: 0,
  earth: 0,
  fire: 0,
};

// ---------------------------------------------------------------------------
// Quest definitions
// ---------------------------------------------------------------------------

export const QUESTS: Quest[] = [
  {
    id: 'collect-wood-20',
    title: 'Collect 20 Wood',
    description: 'Gather 20 wood from trees.',
    condition: {
      label: 'Have 20 wood',
      test: (ctx) => ctx.wood >= 20,
    },
    reward: {
      coins: 500,
      tokens: 0,
      water: 0,
      air: 0,
      earth: 0,
      fire: 0,
    },
  },

  {
    id: 'collect-stone-10',
    title: 'Collect 10 Stone',
    description: 'Gather 10 stone from rocks.',
    condition: {
      label: 'Have 10 stone',
      test: (ctx) => ctx.stone >= 10,
    },
    reward: {
      coins: 1000,
      tokens: 0,
      water: 0,
      air: 0,
      earth: 0,
      fire: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Persistence adapter
// ---------------------------------------------------------------------------

export interface ResourceSaveData {
  coins: number;
  tokens: number;

  water: number;
  air: number;
  earth: number;
  fire: number;

  claimedQuestIds: string[];
}

export interface ResourceBackend {
  load(): Promise<ResourceSaveData | null>;
  save(data: ResourceSaveData): Promise<void>;
}

const LOCAL_STORAGE_KEY = 'land-orion-resources';

const localResourceBackend: ResourceBackend = {
  async load(): Promise<ResourceSaveData | null> {
    if (typeof window === 'undefined') {
      return null;
    }

    const raw =
      window.localStorage.getItem(
        LOCAL_STORAGE_KEY
      );

    if (!raw) {
      return null;
    }

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

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface ResourceStoreState {
  /** Current player balances. */
  resources: PlayerResources;

  /** Quest ids whose rewards have already been claimed. */
  claimedQuestIds: string[];

  /** Persistence adapter. */
  backend: ResourceBackend;

  /** Whether initial state has been loaded. */
  initialized: boolean;

  // Initialization / persistence
  initialize: () => Promise<void>;
  persist: () => Promise<void>;

  // Coins
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;

  // Orion Token
  spendTokens: (amount: number) => boolean;
  addTokens: (amount: number) => void;

  // Elemental resources
  addWater: (amount: number) => void;
  addAir: (amount: number) => void;
  addEarth: (amount: number) => void;
  addFire: (amount: number) => void;

  spendWater: (amount: number) => boolean;
  spendAir: (amount: number) => boolean;
  spendEarth: (amount: number) => boolean;
  spendFire: (amount: number) => boolean;

  /** Add any supported elemental resource by key. */
  addElement: (
    element: 'water' | 'air' | 'earth' | 'fire',
    amount: number
  ) => void;

  /** Spend any supported elemental resource by key. */
  spendElement: (
    element: 'water' | 'air' | 'earth' | 'fire',
    amount: number
  ) => boolean;

  // Quests
  claimQuest: (questId: string) => void;
  canClaimQuest: (questId: string) => boolean;
  buildQuestContext: () => QuestContext;

  // Reset
  reset: () => void;
}

export const useResourceStore =
  create<ResourceStoreState>((set, get) => ({
    resources: {
      ...STARTING_RESOURCES,
    },

    claimedQuestIds: [],

    backend: localResourceBackend,

    initialized: false,

    // -----------------------------------------------------------------------
    // Initialize
    // -----------------------------------------------------------------------

    initialize: async () => {
      if (get().initialized) {
        return;
      }

      const data =
        await get().backend.load();

      if (data) {
        set({
          resources: {
            coins:
              typeof data.coins === 'number'
                ? data.coins
                : STARTING_RESOURCES.coins,

            tokens:
              typeof data.tokens === 'number'
                ? data.tokens
                : STARTING_RESOURCES.tokens,

            water:
              typeof data.water === 'number'
                ? data.water
                : 0,

            air:
              typeof data.air === 'number'
                ? data.air
                : 0,

            earth:
              typeof data.earth === 'number'
                ? data.earth
                : 0,

            fire:
              typeof data.fire === 'number'
                ? data.fire
                : 0,
          },

          claimedQuestIds:
            Array.isArray(data.claimedQuestIds)
              ? data.claimedQuestIds
              : [],

          initialized: true,
        });
      } else {
        set({
          resources: {
            ...STARTING_RESOURCES,
          },
          initialized: true,
        });

        void get().persist();
      }
    },

    // -----------------------------------------------------------------------
    // Persistence
    // -----------------------------------------------------------------------

    persist: async () => {
      const {
        resources,
        claimedQuestIds,
        backend,
      } = get();

      await backend.save({
        coins: resources.coins,
        tokens: resources.tokens,

        water: resources.water,
        air: resources.air,
        earth: resources.earth,
        fire: resources.fire,

        claimedQuestIds,
      });
    },

    // -----------------------------------------------------------------------
    // Coins
    // -----------------------------------------------------------------------

    addCoins: (amount) => {
      if (amount < 0) {
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
      if (amount < 0) {
        return false;
      }

      if (
        get().resources.coins <
        amount
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

    // -----------------------------------------------------------------------
    // Orion Token
    // -----------------------------------------------------------------------

    addTokens: (amount) => {
      if (amount < 0) {
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
      if (amount < 0) {
        return false;
      }

      if (
        get().resources.tokens <
        amount
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

    // -----------------------------------------------------------------------
    // Generic elemental resources
    // -----------------------------------------------------------------------

    addElement: (element, amount) => {
      if (amount < 0) {
        return;
      }

      set((state) => ({
        resources: {
          ...state.resources,
          [element]:
            state.resources[element] +
            amount,
        },
      }));

      void get().persist();
    },

    spendElement: (element, amount) => {
      if (amount < 0) {
        return false;
      }

      if (
        get().resources[element] <
        amount
      ) {
        return false;
      }

      set((state) => ({
        resources: {
          ...state.resources,
          [element]:
            state.resources[element] -
            amount,
        },
      }));

      void get().persist();

      return true;
    },

    // -----------------------------------------------------------------------
    // Water
    // -----------------------------------------------------------------------

    addWater: (amount) => {
      get().addElement('water', amount);
    },

    spendWater: (amount) => {
      return get().spendElement(
        'water',
        amount
      );
    },

    // -----------------------------------------------------------------------
    // Air
    // -----------------------------------------------------------------------

    addAir: (amount) => {
      get().addElement('air', amount);
    },

    spendAir: (amount) => {
      return get().spendElement(
        'air',
        amount
      );
    },

    // -----------------------------------------------------------------------
    // Earth
    // -----------------------------------------------------------------------

    addEarth: (amount) => {
      get().addElement('earth', amount);
    },

    spendEarth: (amount) => {
      return get().spendElement(
        'earth',
        amount
      );
    },

    // -----------------------------------------------------------------------
    // Fire
    // -----------------------------------------------------------------------

    addFire: (amount) => {
      get().addElement('fire', amount);
    },

    spendFire: (amount) => {
      return get().spendElement(
        'fire',
        amount
      );
    },

    // -----------------------------------------------------------------------
    // Quests
    // -----------------------------------------------------------------------

    claimQuest: (questId) => {
      const quest =
        QUESTS.find(
          (q) => q.id === questId
        );

      if (!quest) {
        return;
      }

      const {
        resources,
        claimedQuestIds,
      } = get();

      if (
        claimedQuestIds.includes(
          questId
        )
      ) {
        return;
      }

      if (
        !get().canClaimQuest(questId)
      ) {
        return;
      }

      set({
        resources: {
          coins:
            resources.coins +
            quest.reward.coins,

          tokens:
            resources.tokens +
            quest.reward.tokens,

          water:
            resources.water +
            quest.reward.water,

          air:
            resources.air +
            quest.reward.air,

          earth:
            resources.earth +
            quest.reward.earth,

          fire:
            resources.fire +
            quest.reward.fire,
        },

        claimedQuestIds: [
          ...claimedQuestIds,
          questId,
        ],
      });

      void get().persist();
    },

    canClaimQuest: (questId) => {
      const quest =
        QUESTS.find(
          (q) => q.id === questId
        );

      if (!quest) {
        return false;
      }

      if (
        get().claimedQuestIds.includes(
          questId
        )
      ) {
        return false;
      }

      return quest.condition.test(
        get().buildQuestContext()
      );
    },

    buildQuestContext: () => {
      const {
        resources,
        claimedQuestIds,
      } = get();

      const gameState =
        useGameStore.getState()
          .gameState;

      const harvested =
        gameState?.resources ?? {};

      return {
        coins: resources.coins,
        tokens: resources.tokens,

        water: resources.water,
        air: resources.air,
        earth: resources.earth,
        fire: resources.fire,

        wood:
          harvested.wood ?? 0,

        stone:
          harvested.stone ?? 0,

        food:
          harvested.food ?? 0,

        housesBuilt: 1,

        questsClaimed:
          claimedQuestIds.length,
      };
    },

    // -----------------------------------------------------------------------
    // Reset
    // -----------------------------------------------------------------------

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