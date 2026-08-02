export type WalletAddress = string;
export type PlayerStatus = 'connecting' | 'in-game' | 'offline';

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
}

export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  quantity: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
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
  coordinates: { x: number; y: number };
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
