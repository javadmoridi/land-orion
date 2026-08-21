import type {
  Quest,
  QuestRequirement,
} from './questTypes';
import type { PlayerResources } from '../resourceStore';

/*
|--------------------------------------------------------------------------
| KAEL — PRINCE (شاه زاده)
|
| المان‌ها را می‌گیرد: Water · Air · Earth · Fire
| (آیکن‌های این ۴ آیتم در بازی همان orion-element-*.png هستند)
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

interface ElementSpec {
  id: 'water' | 'air' | 'earth' | 'fire';
  name: string;
  image: string;
  amount: number;
}

const ELEMENTS: ElementSpec[] = [
  { id: 'water', name: 'Orion Water', image: '/assets/orion-element-water.png', amount: 2 },
  { id: 'air', name: 'Orion Air', image: '/assets/orion-element-air.png', amount: 2 },
  { id: 'earth', name: 'Orion Earth', image: '/assets/orion-element-earth.png', amount: 2 },
  { id: 'fire', name: 'Orion Fire', image: '/assets/orion-element-fire.png', amount: 2 },
  { id: 'water', name: 'Orion Water', image: '/assets/orion-element-water.png', amount: 3 },
  { id: 'air', name: 'Orion Air', image: '/assets/orion-element-air.png', amount: 3 },
  { id: 'earth', name: 'Orion Earth', image: '/assets/orion-element-earth.png', amount: 3 },
  { id: 'fire', name: 'Orion Fire', image: '/assets/orion-element-fire.png', amount: 3 },
  { id: 'water', name: 'Orion Water', image: '/assets/orion-element-water.png', amount: 4 },
  { id: 'air', name: 'Orion Air', image: '/assets/orion-element-air.png', amount: 4 },
  { id: 'earth', name: 'Orion Earth', image: '/assets/orion-element-earth.png', amount: 4 },
  { id: 'fire', name: 'Orion Fire', image: '/assets/orion-element-fire.png', amount: 4 },
  { id: 'water', name: 'Orion Water', image: '/assets/orion-element-water.png', amount: 6 },
  { id: 'air', name: 'Orion Air', image: '/assets/orion-element-air.png', amount: 6 },
  { id: 'earth', name: 'Orion Earth', image: '/assets/orion-element-earth.png', amount: 6 },
];

export const KAEL_QUESTS: Quest[] = ELEMENTS.map(
  (element, index) => {
    const requirement: QuestRequirement =
      {
        kind: 'resource',
        id: element.id,
        name: element.name,
        amount: element.amount,
        image: element.image,
      };

    return {
      id: `kael-${String(index + 1).padStart(2, '0')}`,
      characterId: 'kael',

      title: `${element.name} Offering`,
      description: `Prince Kael channels the elements. Bring him ${element.amount} ${element.name}.`,

      requirement,

      condition: {
        label: `Have ${element.amount} ${element.name}`,
        test: (ctx) =>
          ctx[element.id] >=
          element.amount,
      },

      reward: {
        ...emptyReward(),
        tokens: 1,
      },

      cost: {
        [element.id]: element.amount,
      } as Partial<PlayerResources>,
    };
  },
);
