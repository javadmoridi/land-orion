import type {
  Quest,
  QuestRequirement,
} from './questTypes';
import type { PlayerResources } from '../resourceStore';

/*
|--------------------------------------------------------------------------
| NYX — WISE ELDER (پیر دانا)
|
| مواد خام می‌گیرد: چوب · سنگ · آهن · طلا · کریستال
| پاداش = ۱ توکن اوریون (ارز) در هر کوست.
|--------------------------------------------------------------------------
*/

function emptyReward(): PlayerResources {
  return {
    coins: 0,
    tokens: 0,
    gems: 0,
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
}

interface MaterialSpec {
  id:
    | 'wood'
    | 'stone'
    | 'iron'
    | 'gold'
    | 'crystal';
  name: string;
  image: string;
  amount: number;
}

const MATERIALS: MaterialSpec[] = [
  { id: 'wood', name: 'Wood', image: '/assets/orion-wood.png', amount: 60 },
  { id: 'stone', name: 'Stone', image: '/assets/orion-stone.png', amount: 40 },
  { id: 'iron', name: 'Iron', image: '/assets/orion-iron.png', amount: 20 },
  { id: 'gold', name: 'Gold', image: '/assets/orion-gold.png', amount: 12 },
  { id: 'crystal', name: 'Crystal', image: '/assets/orion-crystal.png', amount: 8 },
  { id: 'wood', name: 'Wood', image: '/assets/orion-wood.png', amount: 90 },
  { id: 'stone', name: 'Stone', image: '/assets/orion-stone.png', amount: 60 },
  { id: 'iron', name: 'Iron', image: '/assets/orion-iron.png', amount: 30 },
  { id: 'gold', name: 'Gold', image: '/assets/orion-gold.png', amount: 18 },
  { id: 'crystal', name: 'Crystal', image: '/assets/orion-crystal.png', amount: 12 },
  { id: 'wood', name: 'Wood', image: '/assets/orion-wood.png', amount: 120 },
  { id: 'stone', name: 'Stone', image: '/assets/orion-stone.png', amount: 80 },
  { id: 'iron', name: 'Iron', image: '/assets/orion-iron.png', amount: 40 },
  { id: 'gold', name: 'Gold', image: '/assets/orion-gold.png', amount: 24 },
  { id: 'crystal', name: 'Crystal', image: '/assets/orion-crystal.png', amount: 16 },
];

export const NYX_QUESTS: Quest[] =
  MATERIALS.map(
    (material, index) => {
      const requirement: QuestRequirement =
        {
          kind: 'resource',
          id: material.id,
          name: material.name,
          amount: material.amount,
          image: material.image,
        };

      return {
        id: `nyx-${String(index + 1).padStart(2, '0')}`,
        characterId: 'nyx',

        title: `${material.name} Tribute`,
        description: `The Wise Elder studies the old ways. Bring him ${material.amount} ${material.name}.`,

        requirement,

        condition: {
          label: `Have ${material.amount} ${material.name}`,
          test: (ctx) =>
            ctx[material.id] >=
            material.amount,
        },

        reward: {
          ...emptyReward(),
          tokens: 1,
        },

        cost: {
          [material.id]:
            material.amount,
        } as Partial<PlayerResources>,
      };
    },
  );
