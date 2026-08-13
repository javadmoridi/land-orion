export type WalletAddress = string;
export type PlayerStatus = 'connecting' | 'in-game' | 'offline';

export type OrionUnitStatus =
  | 'ready'
  | 'battle'
  | 'hospital';

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