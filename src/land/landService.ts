import type { LandPlot } from '../types';

export function createLandPlot(ownerId: string, x: number, y: number): LandPlot {
  return {
    id: `land-${ownerId}-${x}-${y}`,
    ownerId,
    coordinates: { x, y },
    size: 1,
    buildings: [],
    level: 1,
  };
}

export function createUpgradePlan() {
  return {
    level: 2,
    cost: { wood: 50, stone: 25 },
    buildingSlots: 2,
  };
}
