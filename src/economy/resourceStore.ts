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
//   water -> Water
//   air   -> Air
//   earth -> Earth
//   fire  -> Fire
//
// Classic resources:
//   wood
//   stone
//   iron
//   gold
//   crystal
// ===========================================================================

export interface PlayerResources {
  coins: number;
  tokens: number;

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

// ---------------------------------------------------------------------------
// Quests
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

      wood: 0,
      stone: 0,
      iron: 0,
      gold: 0,
      crystal: 0,
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

      wood: 0,
      stone: 0,
      iron: 0,
      gold: 0,
      crystal: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

export interface ResourceSaveData {
  coins: number;
  tokens: number;

  water: number;
  air: number;
  earth: number;
  fire: number;

  wood: number;
  stone: number;
  iron: number;
  gold: number;
  crystal: number;

  claimedQuestIds: string[];
}

export interface ResourceBackend {
  load(): Promise<ResourceSaveData | null>;
  save(data: ResourceSaveData): Promise<void>;
}

const LOCAL_STORAGE_KEY =
  'land-orion-resources';

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
      return JSON.parse(
        raw
      ) as ResourceSaveData;
    } catch {
      return null;
    }
  },

  async save(
    data: ResourceSaveData
  ): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(data)
    );
  },
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

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

  addWater: (amount: number) => void;
  addAir: (amount: number) => void;
  addEarth: (amount: number) => void;
  addFire: (amount: number) => void;

  spendWater: (amount: number) => boolean;
  spendAir: (amount: number) => boolean;
  spendEarth: (amount: number) => boolean;
  spendFire: (amount: number) => boolean;

  addElement: (
    element:
      | 'water'
      | 'air'
      | 'earth'
      | 'fire',
    amount: number
  ) => void;

  spendElement: (
    element:
      | 'water'
      | 'air'
      | 'earth'
      | 'fire',
    amount: number
  ) => boolean;

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

  claimQuest: (questId: string) => void;
  canClaimQuest: (questId: string) => boolean;
  buildQuestContext: () => QuestContext;

  reset: () => void;
}

export const useResourceStore =
  create<ResourceStoreState>(
    (set, get) => ({
      resources: {
        ...STARTING_RESOURCES,
      },

      claimedQuestIds: [],

      backend:
        localResourceBackend,

      initialized: false,

      // ================================================================
      // Initialize
      // ================================================================

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
                  : 0,

              tokens:
                typeof data.tokens === 'number'
                  ? data.tokens
                  : 0,

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

              wood:
                typeof data.wood === 'number'
                  ? data.wood
                  : 0,

              stone:
                typeof data.stone === 'number'
                  ? data.stone
                  : 0,

              iron:
                typeof data.iron === 'number'
                  ? data.iron
                  : 0,

              gold:
                typeof data.gold === 'number'
                  ? data.gold
                  : 0,

              crystal:
                typeof data.crystal === 'number'
                  ? data.crystal
                  : 0,
            },

            claimedQuestIds:
              Array.isArray(
                data.claimedQuestIds
              )
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

      // ================================================================
      // Persistence
      // ================================================================

      persist: async () => {
        const {
          resources,
          claimedQuestIds,
          backend,
        } = get();

        await backend.save({
          coins:
            resources.coins,

          tokens:
            resources.tokens,

          water:
            resources.water,

          air:
            resources.air,

          earth:
            resources.earth,

          fire:
            resources.fire,

          wood:
            resources.wood,

          stone:
            resources.stone,

          iron:
            resources.iron,

          gold:
            resources.gold,

          crystal:
            resources.crystal,

          claimedQuestIds,
        });
      },

      // ================================================================
      // Coins
      // ================================================================

      addCoins: (amount) => {
        if (amount < 0) {
          return;
        }

        set((state) => ({
          resources: {
            ...state.resources,

            coins:
              state.resources.coins +
              amount,
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
              state.resources.coins -
              amount,
          },
        }));

        void get().persist();

        return true;
      },

      // ================================================================
      // Orion Token
      // ================================================================

      addTokens: (amount) => {
        if (amount < 0) {
          return;
        }

        set((state) => ({
          resources: {
            ...state.resources,

            tokens:
              state.resources.tokens +
              amount,
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
              state.resources.tokens -
              amount,
          },
        }));

        void get().persist();

        return true;
      },

      // ================================================================
      // Elemental resources
      // ================================================================

      addElement: (
        element,
        amount
      ) => {
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

      spendElement: (
        element,
        amount
      ) => {
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

      addWater: (amount) => {
        get().addElement(
          'water',
          amount
        );
      },

      spendWater: (amount) => {
        return get().spendElement(
          'water',
          amount
        );
      },

      addAir: (amount) => {
        get().addElement(
          'air',
          amount
        );
      },

      spendAir: (amount) => {
        return get().spendElement(
          'air',
          amount
        );
      },

      addEarth: (amount) => {
        get().addElement(
          'earth',
          amount
        );
      },

      spendEarth: (amount) => {
        return get().spendElement(
          'earth',
          amount
        );
      },

      addFire: (amount) => {
        get().addElement(
          'fire',
          amount
        );
      },

      spendFire: (amount) => {
        return get().spendElement(
          'fire',
          amount
        );
      },

      // ================================================================
      // Classic resources
      // ================================================================

      addWood: (amount) => {
        if (amount < 0) {
          return;
        }

        set((state) => ({
          resources: {
            ...state.resources,

            wood:
              state.resources.wood +
              amount,
          },
        }));

        void get().persist();
      },

      addStone: (amount) => {
        if (amount < 0) {
          return;
        }

        set((state) => ({
          resources: {
            ...state.resources,

            stone:
              state.resources.stone +
              amount,
          },
        }));

        void get().persist();
      },

      addIron: (amount) => {
        if (amount < 0) {
          return;
        }

        set((state) => ({
          resources: {
            ...state.resources,

            iron:
              state.resources.iron +
              amount,
          },
        }));

        void get().persist();
      },

      addGold: (amount) => {
        if (amount < 0) {
          return;
        }

        set((state) => ({
          resources: {
            ...state.resources,

            gold:
              state.resources.gold +
              amount,
          },
        }));

        void get().persist();
      },

      addCrystal: (amount) => {
        if (amount < 0) {
          return;
        }

        set((state) => ({
          resources: {
            ...state.resources,

            crystal:
              state.resources.crystal +
              amount,
          },
        }));

        void get().persist();
      },

      spendWood: (amount) => {
        if (
          amount < 0 ||
          get().resources.wood <
            amount
        ) {
          return false;
        }

        set((state) => ({
          resources: {
            ...state.resources,

            wood:
              state.resources.wood -
              amount,
          },
        }));

        void get().persist();

        return true;
      },

      spendStone: (amount) => {
        if (
          amount < 0 ||
          get().resources.stone <
            amount
        ) {
          return false;
        }

        set((state) => ({
          resources: {
            ...state.resources,

            stone:
              state.resources.stone -
              amount,
          },
        }));

        void get().persist();

        return true;
      },

      spendIron: (amount) => {
        if (
          amount < 0 ||
          get().resources.iron <
            amount
        ) {
          return false;
        }

        set((state) => ({
          resources: {
            ...state.resources,

            iron:
              state.resources.iron -
              amount,
          },
        }));

        void get().persist();

        return true;
      },

      spendGold: (amount) => {
        if (
          amount < 0 ||
          get().resources.gold <
            amount
        ) {
          return false;
        }

        set((state) => ({
          resources: {
            ...state.resources,

            gold:
              state.resources.gold -
              amount,
          },
        }));

        void get().persist();

        return true;
      },

      spendCrystal: (amount) => {
        if (
          amount < 0 ||
          get().resources.crystal <
            amount
        ) {
          return false;
        }

        set((state) => ({
          resources: {
            ...state.resources,

            crystal:
              state.resources.crystal -
              amount,
          },
        }));

        void get().persist();

        return true;
      },

      // ================================================================
      // Quests
      // ================================================================

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
          !get().canClaimQuest(
            questId
          )
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

            wood:
              resources.wood +
              quest.reward.wood,

            stone:
              resources.stone +
              quest.reward.stone,

            iron:
              resources.iron +
              quest.reward.iron,

            gold:
              resources.gold +
              quest.reward.gold,

            crystal:
              resources.crystal +
              quest.reward.crystal,
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
          coins:
            resources.coins,

          tokens:
            resources.tokens,

          water:
            resources.water,

          air:
            resources.air,

          earth:
            resources.earth,

          fire:
            resources.fire,

          wood:
            resources.wood +
            (harvested.wood ??
              0),

          stone:
            resources.stone +
            (harvested.stone ??
              0),

          food:
            harvested.food ?? 0,

          housesBuilt:
            1,

          questsClaimed:
            claimedQuestIds.length,
        };
      },

      // ================================================================
      // Reset
      // ================================================================

      reset: () => {
        set({
          resources: {
            ...STARTING_RESOURCES,
          },

          claimedQuestIds: [],
        });

        void get().persist();
      },
    })
  );