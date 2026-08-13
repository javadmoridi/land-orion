import { create } from 'zustand';
import { useEffect, useState } from 'react';
import { useGameStore } from './useGameStore';
import { PICKAXE_MIN_RANK, TOOLS } from './toolCatalog';

// ===========================================================================
// Resource nodes on the ground: trees + mineral nodes (stone/iron/gold/crystal).
//
// Harvest probability (shared by every source):
//   85% -> 1, 10% -> 1.5, 5% -> 2
//
// Regrow times:
//   tree    -> 2h
//   stone   -> 4h
//   iron    -> 8h
//   gold    -> 18h
//   crystal -> 48h
// ===========================================================================

export type ResourceKind =
  | 'tree'
  | 'stone'
  | 'iron'
  | 'gold'
  | 'crystal';

export type MineralKind = Exclude<ResourceKind, 'tree'>;

export interface ResourceNode {
  id: string;
  kind: ResourceKind;
  x: number;
  y: number;
  /** Footprint in grid cells (trees 5x5, minerals 2x2). */
  size: number;
  harvested: boolean;
  /** Timestamp (ms) when the node becomes available again. */
  readyAt: number;
}

export const REGROW_MS: Record<MineralKind, number> = {
  stone: 4 * 3600 * 1000,
  iron: 8 * 3600 * 1000,
  gold: 18 * 3600 * 1000,
  crystal: 48 * 3600 * 1000,
};

export const TREE_REGROW_MS = 2 * 3600 * 1000;

export const NODE_IMAGE: Record<ResourceKind, string> = {
  tree: '/assets/tree.png',
  stone: '/assets/orion-stone.png',
  iron: '/assets/orion-iron.png',
  gold: '/assets/orion-gold.png',
  crystal: '/assets/orion-crystal.png',
};

export const NODE_LABEL: Record<ResourceKind, string> = {
  tree: 'Tree',
  stone: 'Stone',
  iron: 'Iron',
  gold: 'Gold',
  crystal: 'Crystal',
};

const RESOURCE_KEY: Record<ResourceKind, string> = {
  tree: 'wood',
  stone: 'stone',
  iron: 'iron',
  gold: 'gold',
  crystal: 'crystal',
};

// Node footprint in grid cells per kind.
const NODE_SIZE: Record<ResourceKind, number> = {
  tree: 5,
  stone: 4,
  iron: 4,
  gold: 4,
  crystal: 6,
};

// 9 trees keep the bottom-right corner.
const TREE_POS = [
  { x: 25, y: 25 },
  { x: 30, y: 25 },
  { x: 35, y: 25 },
  { x: 25, y: 30 },
  { x: 30, y: 30 },
  { x: 35, y: 30 },
  { x: 25, y: 35 },
  { x: 30, y: 35 },
  { x: 35, y: 35 },
];

// ===========================================================================
// MINERAL GRID
//
// Layout:
//
// [ Stone ] [ Iron ] [ Gold ]
// [ Stone ] [ Iron ] [ Gold ]
// [ Stone ] [ Iron ] [ Crystal ]
// [ Stone ] [ Stone ]
//
// The minerals are grouped together in the bottom-left area.
// ===========================================================================

const GROUND_POS: { kind: ResourceKind; x: number; y: number }[] = [
  // Row 1
  { kind: 'stone', x: 2, y: 25 },
  { kind: 'iron', x: 6, y: 25 },
  { kind: 'gold', x: 10, y: 25 },

  // Row 2
  { kind: 'stone', x: 2, y: 29 },
  { kind: 'iron', x: 6, y: 29 },
  { kind: 'gold', x: 10, y: 29 },

  // Row 3
  { kind: 'stone', x: 2, y: 33 },
  { kind: 'iron', x: 6, y: 33 },
  { kind: 'crystal', x: 10, y: 33 },

  // Row 4
  { kind: 'stone', x: 2, y: 37 },
  { kind: 'stone', x: 6, y: 37 },
];

function makeNodes(): ResourceNode[] {
  const nodes: ResourceNode[] = [];

  TREE_POS.forEach((p) => {
    nodes.push({
      id: `tree-${p.x}-${p.y}`,
      kind: 'tree',
      x: p.x,
      y: p.y,
      size: NODE_SIZE.tree,
      harvested: false,
      readyAt: 0,
    });
  });

  GROUND_POS.forEach((p) => {
    nodes.push({
      id: `${p.kind}-${p.x}-${p.y}`,
      kind: p.kind,
      x: p.x,
      y: p.y,
      size: NODE_SIZE[p.kind],
      harvested: false,
      readyAt: 0,
    });
  });

  return nodes;
}

export function isNodeAvailable(
  node: ResourceNode,
  now: number
): boolean {
  return !node.harvested || now >= node.readyAt;
}

/** Roll the harvest amount: 85% -> 1, 10% -> 1.5, 5% -> 2. */
export function rollResourceAmount(): number {
  const r = Math.random();

  if (r < 0.85) return 1;
  if (r < 0.95) return 1.5;

  return 2;
}

function regrowMsFor(kind: ResourceKind): number {
  if (kind === 'tree') return TREE_REGROW_MS;

  return REGROW_MS[kind];
}

function getMaxPickaxeRank(
  game: { hasItem: (id: string) => boolean }
): number {
  const ids = [
    'stone-pickaxe',
    'iron-pickaxe',
    'gold-pickaxe',
    'crystal-pickaxe',
  ];

  let max = 0;

  ids.forEach((id, idx) => {
    if (game.hasItem(id)) {
      max = Math.max(max, idx + 1);
    }
  });

  return max;
}

function toolName(id: string): string {
  return TOOLS.find((t) => t.id === id)?.name ?? id;
}

/** The pickaxe to consume — lowest tier the player owns that meets the rank. */
function pickaxeToConsume(
  game: { hasItem: (id: string) => boolean },
  requiredRank: number
): string | null {
  const ids = [
    'stone-pickaxe',
    'iron-pickaxe',
    'gold-pickaxe',
    'crystal-pickaxe',
  ];

  for (let i = requiredRank - 1; i < ids.length; i++) {
    if (game.hasItem(ids[i])) {
      return ids[i];
    }
  }

  return null;
}

const PICKAXE_NAMES = [
  'Stone',
  'Iron',
  'Gold',
  'Crystal',
];

export interface HarvestResult {
  ok: boolean;
  reason?: 'regrowing' | 'no-tool' | 'unknown';
  amount?: number;
  kind?: ResourceKind;
}

interface ResourceNodeState {
  nodes: ResourceNode[];
  message: string | null;
  harvest: (nodeId: string) => HarvestResult;
  clearMessage: () => void;
}

export const useResourceNodes = create<ResourceNodeState>(
  (set, get) => ({
    nodes: makeNodes(),
    message: null,

    harvest: (nodeId) => {
      const now = Date.now();

      const node = get().nodes.find(
        (n) => n.id === nodeId
      );

      if (!node) {
        return {
          ok: false,
          reason: 'unknown',
        };
      }

      if (!isNodeAvailable(node, now)) {
        return {
          ok: false,
          reason: 'regrowing',
        };
      }

      const game = useGameStore.getState();

      if (node.kind === 'tree') {
        if (!game.hasItem('orion-axe')) {
          set({
            message:
              'You need the Orion Axe to cut trees.',
          });

          return {
            ok: false,
            reason: 'no-tool',
          };
        }
      } else {
        const required =
          PICKAXE_MIN_RANK[node.kind];

        if (getMaxPickaxeRank(game) < required) {
          const name =
            PICKAXE_NAMES[required - 1];

          set({
            message:
              required === 4
                ? `You need the Crystal Pickaxe to mine ${NODE_LABEL[node.kind]}.`
                : `You need a ${name} Pickaxe (or better) to mine ${NODE_LABEL[node.kind]}.`,
          });

          return {
            ok: false,
            reason: 'no-tool',
          };
        }
      }

      const amount = rollResourceAmount();

      const key = RESOURCE_KEY[node.kind];

      game.addResource(key, amount);

      // Tools are single-use:
      // the axe/pickaxe breaks after harvesting one item.
      let usedTool: string | null = null;

      if (node.kind === 'tree') {
        game.removeFromInventory(
          'orion-axe',
          1
        );

        usedTool = toolName('orion-axe');
      } else {
        const toolId = pickaxeToConsume(
          game,
          PICKAXE_MIN_RANK[node.kind]
        );

        if (toolId) {
          game.removeFromInventory(
            toolId,
            1
          );

          usedTool = toolName(toolId);
        }
      }

      set({
        nodes: get().nodes.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                harvested: true,
                readyAt:
                  now +
                  regrowMsFor(node.kind),
              }
            : n
        ),

        message: usedTool
          ? `+${amount} ${NODE_LABEL[node.kind]} (${usedTool} used)`
          : `+${amount} ${NODE_LABEL[node.kind]}`,
      });

      return {
        ok: true,
        amount,
        kind: node.kind,
      };
    },

    clearMessage: () =>
      set({
        message: null,
      }),
  })
);

/** Live clock hook used to tick regrow countdowns. */
export function useNow(
  intervalMs = 1000
): number {
  const [now, setNow] = useState(
    () => Date.now()
  );

  useEffect(() => {
    const t = window.setInterval(
      () => setNow(Date.now()),
      intervalMs
    );

    return () =>
      window.clearInterval(t);
  }, [intervalMs]);

  return now;
}

export function formatDuration(
  ms: number
): string {
  const totalSeconds = Math.floor(
    ms / 1000
  );

  const h = Math.floor(
    totalSeconds / 3600
  );

  const m = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const s = totalSeconds % 60;

  if (h > 0) {
    return `${h}:${m
      .toString()
      .padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  }

  return `${m}:${s
    .toString()
    .padStart(2, '0')}`;
}