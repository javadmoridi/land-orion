export type WalletAddress = string;
export type PlayerStatus = 'connecting' | 'in-game' | 'offline';

export type OrionUnitStatus =
  | 'ready'
  | 'battle'
  | 'hospital';

/**
 * Enhanced runtime state for an Orion unit.
 * Tracks battle/hospital timestamps for real-time recovery.
 */
export interface OrionUnitRuntime {
  id: string;
  status: OrionUnitStatus;
  battleStartedAt?: number;   // timestamp when battle started
  battleEndsAt?: number;      // timestamp when battle finishes
  hospitalStartedAt?: number; // timestamp when hospital stay started
  hospitalEndsAt?: number;    // timestamp when hospital finishes
  battleDurationMs?: number;  // original battle duration
  hospitalDurationMs?: number;// original hospital duration
}

export interface WalletSession {
  address: WalletAddress;
  connectedAt: string;
  provider: 'ton-connect';
}

export interface PlayerProfile {
  id: string;
  walletAddress: WalletAddress;
  username: string;
  level: number;
  experience: number;
  status: PlayerStatus;
  inventory: InventoryItem[];
  land: LandPlot[];
  createdAt: string;
  lastSeenAt: string;
}

export interface OrionUnitState {
  id: string;
  status: OrionUnitStatus;
  battleStartedAt?: number;
  battleEndsAt?: number;
  hospitalStartedAt?: number;
  hospitalEndsAt?: number;
}

export interface MinerState {
  level: number;

  /**
   * Timestamp of the last production calculation.
   * Production is calculated from elapsed real time.
   */
  lastCollectedAt: number;

  /**
   * Allows the miner system to keep accumulated fractions
   * between collections.
   */
  fractionalWater: number;
  fractionalAir: number;
  fractionalEarth: number;
  fractionalFire: number;
}

export interface GameState {
  playerId: string;

  progress: {
    completedMissions: string[];
    currentMissionId?: string;
    lastAction: string;
  };

  inventory: InventoryItem[];

  resources: Record<string, number>;

  currency: Record<string, number>;

  status: PlayerStatus;

  /**
   * Runtime/persistent state of individual Orions.
   *
   * Orions not present in this object are treated as "ready".
   */
  orionStates?: OrionUnitState[];

  /**
   * Enhanced runtime state for Orions with battle/hospital tracking.
   * Keyed by Orion unit ID.
   */
  orionRuntime?: Record<string, OrionUnitRuntime>;

  /**
   * Miner progression and production state.
   */
  miner?: MinerState;

  /**
   * Current hospital treatment data.
   */
  hospital?: {
    treatmentDurationMs: number;
  };

  /**
   * Current battle configuration.
   */
  battle?: {
    durationMs: number;
  };

  /**
   * Bot War (PvE) progression. Persisted to Supabase as part of
   * game_data.gameState on every saveGame() call.
   */
  war?: WarState;
}

/**
 * Progress of the player in the Bot War game mode (666 levels).
 */
export interface WarState {
  /** Next level the player has to fight (1..666). */
  currentLevel: number;
  /** Highest level cleared so far. */
  highestLevel: number;
  /** Total battles won. */
  wins: number;
  /** Total battles lost. */
  losses: number;
  /** Total Orion tokens earned from war rewards. */
  totalRewardTokens: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  quantity: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

  /** Level of a hatched Orion. */
  level?: number;

  /** Icon path shown in the inventory. */
  image?: string;
}

export interface ResourceBalance {
  id: string;
  name: string;
  amount: number;
}

export interface CurrencyBalance {
  id: string;
  symbol: string;
  amount: number;
}

export interface LandPlot {
  id: string;
  ownerId: string;
  coordinates: {
    x: number;
    y: number;
  };
  size: number;
  buildings: string[];
  level: number;
}

export interface BackendSavePayload {
  player: PlayerProfile;
  gameState: GameState;
  land: LandPlot[];
  savedAt: string;
}