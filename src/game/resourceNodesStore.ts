import { create } from 'zustand';
import { useEffect, useState } from 'react';
import { useGameStore } from './useGameStore';
import {
  PICKAXE_MIN_RANK,
  TOOLS,
} from './toolCatalog';

// ===========================================================================
// Resource nodes
//
// Every node is persisted in localStorage.
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

export type MineralKind =
  Exclude<ResourceKind, 'tree'>;

export interface ResourceNode {
  id: string;
  kind: ResourceKind;
  x: number;
  y: number;
  size: number;
  harvested: boolean;
  readyAt: number;
}

export const REGROW_MS: Record<
  MineralKind,
  number
> = {
  stone:
    4 * 3600 * 1000,

  iron:
    8 * 3600 * 1000,

  gold:
    18 * 3600 * 1000,

  crystal:
    48 * 3600 * 1000,
};

export const TREE_REGROW_MS =
  2 * 3600 * 1000;

export const NODE_IMAGE: Record<
  ResourceKind,
  string
> = {
  tree:
    '/assets/tree.png',

  stone:
    '/assets/orion-stone.png',

  iron:
    '/assets/orion-iron.png',

  gold:
    '/assets/orion-gold.png',

  crystal:
    '/assets/orion-crystal.png',
};

export const NODE_LABEL: Record<
  ResourceKind,
  string
> = {
  tree: 'Tree',
  stone: 'Stone',
  iron: 'Iron',
  gold: 'Gold',
  crystal: 'Crystal',
};

const RESOURCE_KEY: Record<
  ResourceKind,
  string
> = {
  tree: 'wood',
  stone: 'stone',
  iron: 'iron',
  gold: 'gold',
  crystal: 'crystal',
};

const NODE_SIZE: Record<
  ResourceKind,
  number
> = {
  tree: 5,
  stone: 4,
  iron: 4,
  gold: 4,
  crystal: 6,
};

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

const GROUND_POS: {
  kind: ResourceKind;
  x: number;
  y: number;
}[] = [
  { kind: 'stone', x: 2, y: 25 },
  { kind: 'iron', x: 6, y: 25 },
  { kind: 'gold', x: 10, y: 25 },

  { kind: 'stone', x: 2, y: 29 },
  { kind: 'iron', x: 6, y: 29 },
  { kind: 'gold', x: 10, y: 29 },

  { kind: 'stone', x: 2, y: 33 },
  { kind: 'iron', x: 6, y: 33 },
  { kind: 'crystal', x: 10, y: 33 },

  { kind: 'stone', x: 2, y: 37 },
  { kind: 'stone', x: 6, y: 37 },
];

const RESOURCE_NODES_STORAGE_KEY =
  'land-orion-resource-nodes';

function makeNodes(): ResourceNode[] {
  const nodes: ResourceNode[] =
    [];

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

function loadSavedNodes(): ResourceNode[] {
  if (
    typeof window ===
    'undefined'
  ) {
    return makeNodes();
  }

  const raw =
    window.localStorage.getItem(
      RESOURCE_NODES_STORAGE_KEY
    );

  if (!raw) {
    return makeNodes();
  }

  try {
    const parsed =
      JSON.parse(raw);

    if (
      !Array.isArray(parsed)
    ) {
      return makeNodes();
    }

    const defaults =
      makeNodes();

    /*
     * Merge saved data with current map definitions.
     * This protects the game if new nodes are added later.
     */
    return defaults.map(
      (defaultNode) => {
        const saved =
          parsed.find(
            (item: unknown) =>
              typeof item ===
                'object' &&
              item !== null &&
              'id' in item &&
              (
                item as {
                  id?: unknown;
                }
              ).id ===
                defaultNode.id
          ) as
            | Partial<ResourceNode>
            | undefined;

        if (!saved) {
          return defaultNode;
        }

        return {
          ...defaultNode,

          harvested:
            typeof saved.harvested ===
            'boolean'
              ? saved.harvested
              : defaultNode.harvested,

          readyAt:
            typeof saved.readyAt ===
            'number'
              ? saved.readyAt
              : defaultNode.readyAt,
        };
      }
    );
  } catch {
    return makeNodes();
  }
}

function saveNodes(
  nodes: ResourceNode[]
): void {
  if (
    typeof window ===
    'undefined'
  ) {
    return;
  }

  window.localStorage.setItem(
    RESOURCE_NODES_STORAGE_KEY,
    JSON.stringify(nodes)
  );
}

export function isNodeAvailable(
  node: ResourceNode,
  now: number
): boolean {
  return (
    !node.harvested ||
    now >= node.readyAt
  );
}

/** 85% -> 1, 10% -> 1.5, 5% -> 2. */
export function rollResourceAmount(): number {
  const r =
    Math.random();

  if (r < 0.85) {
    return 1;
  }

  if (r < 0.95) {
    return 1.5;
  }

  return 2;
}

function regrowMsFor(
  kind: ResourceKind
): number {
  if (
    kind === 'tree'
  ) {
    return TREE_REGROW_MS;
  }

  return REGROW_MS[kind];
}

function getMaxPickaxeRank(
  game: {
    hasItem: (
      id: string
    ) => boolean;
  }
): number {
  const ids = [
    'stone-pickaxe',
    'iron-pickaxe',
    'gold-pickaxe',
    'crystal-pickaxe',
  ];

  let max = 0;

  ids.forEach(
    (id, index) => {
      if (
        game.hasItem(id)
      ) {
        max = Math.max(
          max,
          index + 1
        );
      }
    }
  );

  return max;
}

function toolName(
  id: string
): string {
  return (
    TOOLS.find(
      (tool) =>
        tool.id === id
    )?.name ?? id
  );
}

function pickaxeToConsume(
  game: {
    hasItem: (
      id: string
    ) => boolean;
  },
  requiredRank: number
): string | null {
  const ids = [
    'stone-pickaxe',
    'iron-pickaxe',
    'gold-pickaxe',
    'crystal-pickaxe',
  ];

  for (
    let i =
      requiredRank - 1;
    i < ids.length;
    i++
  ) {
    if (
      game.hasItem(ids[i])
    ) {
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
  reason?:
    | 'regrowing'
    | 'no-tool'
    | 'unknown';
  amount?: number;
  kind?: ResourceKind;
}

interface ResourceNodeState {
  nodes: ResourceNode[];
  message: string | null;

  harvest: (
    nodeId: string
  ) => HarvestResult;

  clearMessage: () => void;
}

export const useResourceNodes =
  create<ResourceNodeState>(
    (set, get) => ({
      /*
       * Load saved nodes immediately when the store is created.
       */
      nodes:
        loadSavedNodes(),

      message: null,

      // ================================================================
      // HARVEST
      // ================================================================

      harvest: (nodeId) => {
        const now =
          Date.now();

        const node =
          get().nodes.find(
            (item) =>
              item.id ===
              nodeId
          );

        if (!node) {
          return {
            ok: false,
            reason:
              'unknown',
          };
        }

        /*
         * If the regrow timer has not finished,
         * the resource cannot be harvested.
         */
        if (
          !isNodeAvailable(
            node,
            now
          )
        ) {
          return {
            ok: false,
            reason:
              'regrowing',
          };
        }

        const game =
          useGameStore.getState();

        // --------------------------------------------------------------
        // TREE
        // --------------------------------------------------------------

        if (
          node.kind ===
          'tree'
        ) {
          if (
            !game.hasItem(
              'orion-axe'
            )
          ) {
            set({
              message:
                'You need the Orion Axe to cut trees.',
            });

            return {
              ok: false,
              reason:
                'no-tool',
            };
          }
        }

        // --------------------------------------------------------------
        // MINERALS
        // --------------------------------------------------------------

        else {
          const required =
            PICKAXE_MIN_RANK[
              node.kind
            ];

          if (
            getMaxPickaxeRank(
              game
            ) < required
          ) {
            const name =
              PICKAXE_NAMES[
                required - 1
              ];

            set({
              message:
                required === 4
                  ? `You need the Crystal Pickaxe to mine ${NODE_LABEL[node.kind]}.`
                  : `You need a ${name} Pickaxe (or better) to mine ${NODE_LABEL[node.kind]}.`,
            });

            return {
              ok: false,
              reason:
                'no-tool',
            };
          }
        }

        // --------------------------------------------------------------
        // HARVEST
        // --------------------------------------------------------------

        const amount =
          rollResourceAmount();

        const key =
          RESOURCE_KEY[
            node.kind
          ];

        game.addResource(
          key,
          amount
        );

        // --------------------------------------------------------------
        // CONSUME TOOL
        // --------------------------------------------------------------

        let usedTool:
          | string
          | null = null;

        if (
          node.kind ===
          'tree'
        ) {
          game.removeFromInventory(
            'orion-axe',
            1
          );

          usedTool =
            toolName(
              'orion-axe'
            );
        } else {
          const toolId =
            pickaxeToConsume(
              game,
              PICKAXE_MIN_RANK[
                node.kind
              ]
            );

          if (toolId) {
            game.removeFromInventory(
              toolId,
              1
            );

            usedTool =
              toolName(
                toolId
              );
          }
        }

        // --------------------------------------------------------------
        // START REGROW TIMER
        // --------------------------------------------------------------

        const readyAt =
          now +
          regrowMsFor(
            node.kind
          );

        const nextNodes =
          get().nodes.map(
            (item) =>
              item.id ===
              nodeId
                ? {
                    ...item,
                    harvested:
                      true,
                    readyAt,
                  }
                : item
          );

        /*
         * IMPORTANT:
         * Save the harvested state AND readyAt immediately.
         */
        set({
          nodes:
            nextNodes,

          message:
            usedTool
              ? `+${amount} ${NODE_LABEL[node.kind]} (${usedTool} used)`
              : `+${amount} ${NODE_LABEL[node.kind]}`,
        });

        saveNodes(
          nextNodes
        );

        return {
          ok: true,
          amount,
          kind: node.kind,
        };
      },

      clearMessage: () => {
        set({
          message: null,
        });
      },
    })
  );

// ===========================================================================
// REAL-TIME CLOCK
// ===========================================================================

export function useNow(
  intervalMs = 1000
): number {
  const [
    now,
    setNow,
  ] = useState(
    () => Date.now()
  );

  useEffect(() => {
    const timer =
      window.setInterval(
        () =>
          setNow(
            Date.now()
          ),
        intervalMs
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [
    intervalMs,
  ]);

  return now;
}

// ===========================================================================
// TIME FORMAT
// ===========================================================================

export function formatDuration(
  ms: number
): string {
  const totalSeconds =
    Math.max(
      0,
      Math.floor(
        ms / 1000
      )
    );

  const h =
    Math.floor(
      totalSeconds / 3600
    );

  const m =
    Math.floor(
      (totalSeconds % 3600) /
        60
    );

  const s =
    totalSeconds % 60;

  if (h > 0) {
    return `${h}:${m
      .toString()
      .padStart(
        2,
        '0'
      )}:${s
      .toString()
      .padStart(
        2,
        '0')}`;
  }

  return `${m}:${s
    .toString()
    .padStart(
      2,
      '0'
    )}`;
}