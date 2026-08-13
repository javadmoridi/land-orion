import type { EggRarity } from './eggCatalog';

// ===========================================================================
// Orion hatch system.
//
// Eggs are bought with Orion Coins (💎 Tokens) and hatched in the Incubator.
// Each egg hatches into a dedicated FRUIT (see eggCatalog.ts -> EggDef.fruit)
// that has its own icon.
//
// Hatch speed is measured in GAME TICKS (the world ticks at 20 ticks/sec, the
// same rate as Minecraft). A common egg hatches in 25 ticks (~1.25s); rarer
// eggs hatch in 50 ticks (~2.5s). Hatching is therefore almost instantaneous,
// letting players cycle eggs quickly.
// ===========================================================================

/** Ticks per second of the Orion world clock. */
export const TICKS_PER_SECOND = 20;
/** One game tick expressed in milliseconds. */
export const TICK_MS = 1000 / TICKS_PER_SECOND;

/**
 * Hatch duration, in game ticks, per egg rarity.
 * 1 game tick = 50ms (20 ticks/sec)
 */
export const HATCH_TIME_TICKS: Record<EggRarity, number> = {
  common: 72000, // 1 hour
  rare: 576000, // 8 hours
  epic: 1152000, // 16 hours
  legendary: 1728000, // 24 hours
  mythic: 3456000, // 48 hours
};

/** Hatch duration in milliseconds for a given egg rarity. */
export function hatchTimeMs(rarity: EggRarity): number {
  return HATCH_TIME_TICKS[rarity] * TICK_MS;
}

export const RARITY_LABEL: Record<EggRarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  mythic: 'Mythic',
};

export function rarityColor(rarity: EggRarity): string {
  switch (rarity) {
    case 'common':
      return '#9fb0d0';
    case 'rare':
      return '#4f7cff';
    case 'epic':
      return '#b14fff';
    case 'legendary':
      return '#ffd700';
    case 'mythic':
      return '#ff6b6b';
    default:
      return '#9fb0d0';
  }
}
