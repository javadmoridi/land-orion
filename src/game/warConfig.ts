// ============================================================================
// BOT WAR CONFIGURATION
//
// 666 levels. Robot power starts at 1 and is multiplied by 1.9 every level.
// The number of troops a player may bring grows by one every 10 levels
// (levels 1-10 -> 1 troop, 11-20 -> 2 troops, ...).
// The reward is 1 Orion token on level 1 and grows by a 1.4x factor per
// level.
// ============================================================================

export const WAR_MAX_LEVEL = 666;

/** Robot power multiplier applied per war level. */
export const WAR_ROBOT_POWER_FACTOR = 1.9;

/** Reward multiplier applied per war level. */
export const WAR_REWARD_FACTOR = 1.4;

/** Base reward (Orion tokens) for level 1. */
export const WAR_BASE_REWARD = 1;

/** Every N levels the player unlocks one extra troop slot. */
export const WAR_TROOP_SLOT_EVERY = 10;

/** Robot total power for a given war level (1-based). */
export function robotPowerForLevel(
  level: number,
): number {
  const safeLevel = Math.max(
    1,
    Math.min(
      WAR_MAX_LEVEL,
      Math.floor(level),
    ),
  );

  return Math.pow(
    WAR_ROBOT_POWER_FACTOR,
    safeLevel - 1,
  );
}

/**
 * How many troops (Orions) the player may select for a given war level.
 * Levels 1-10 -> 1 troop, 11-20 -> 2 troops, 21-30 -> 3 troops, ...
 */
export function troopsAllowedForLevel(
  level: number,
): number {
  const safeLevel = Math.max(
    1,
    Math.min(
      WAR_MAX_LEVEL,
      Math.floor(level),
    ),
  );

  return (
    Math.floor(
      (safeLevel - 1) /
        WAR_TROOP_SLOT_EVERY,
    ) + 1
  );
}

/** Orion token reward for clearing a given war level. */
export function warRewardTokens(
  level: number,
): number {
  const safeLevel = Math.max(
    1,
    Math.min(
      WAR_MAX_LEVEL,
      Math.floor(level),
    ),
  );

  return Math.max(
    1,
    Math.round(
      WAR_BASE_REWARD *
        Math.pow(
          WAR_REWARD_FACTOR,
          safeLevel - 1,
        ),
    ),
  );
}

/**
 * Formats very large numbers (robot powers grow exponentially) in a
 * compact, readable way.
 */
export function formatWarNumber(
  value: number,
): string {
  if (!Number.isFinite(value)) {
    return '∞';
  }

  if (value < 1000) {
    return String(
      Math.round(value * 100) / 100,
    );
  }

  if (value < 1_000_000) {
    return Math.round(
      value,
    ).toLocaleString('en-US');
  }

  return value.toExponential(2);
}