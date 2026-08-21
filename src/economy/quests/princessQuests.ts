import type { PlayerResources } from '../resourceStore';

export interface PrincessQuest {
  id: string;
  characterId: 'lyra';
  title: string;
  description: string;

  itemId: string;
  itemName: string;
  itemImage: string;

  amount: number;

  rewardCoins: number;

  condition: {
    label: string;
    test: (ctx: Record<string, number>) => boolean;
  };

  reward: PlayerResources;
}

function createReward(
  coins: number
): PlayerResources {
  return {
    coins,
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

function createQuest(
  id: number,
  itemId: string,
  itemName: string,
  amount: number,
  rewardCoins: number
): PrincessQuest {
  return {
    id: `princess-${id}`,
    characterId: 'lyra',

    title: `Royal ${itemName} Delivery`,

    description:
      `Deliver ${amount} ${itemName}.`,

    itemId,
    itemName,

    itemImage:
      `/assets/${itemId}.png`,

    amount,

    rewardCoins,

    condition: {
      label: `Have ${amount} ${itemName}`,

      test: (ctx) =>
        (ctx[itemId] ?? 0) >= amount,
    },

    reward: createReward(
      Math.max(
        500,
        Math.min(1000, rewardCoins)
      )
    ),
  };
}

/*
|--------------------------------------------------------------------------
| 50 PRINCESS QUESTS
|--------------------------------------------------------------------------
|
| فقط میوه
|
| حداقل پاداش: 500 سکه
| حداکثر پاداش: 1000 سکه
|
|--------------------------------------------------------------------------
*/

export const PRINCESS_QUESTS: PrincessQuest[] = [

  createQuest(
    1,
    'apple',
    'Apple',
    20,
    500
  ),

  createQuest(
    2,
    'apple',
    'Apple',
    35,
    525
  ),

  createQuest(
    3,
    'apple',
    'Apple',
    50,
    750
  ),

  createQuest(
    4,
    'apple',
    'Apple',
    70,
    850
  ),

  createQuest(
    5,
    'apple',
    'Apple',
    90,
    950
  ),

  createQuest(
    6,
    'banana',
    'Banana',
    15,
    500
  ),

  createQuest(
    7,
    'banana',
    'Banana',
    25,
    550
  ),

  createQuest(
    8,
    'banana',
    'Banana',
    40,
    700
  ),

  createQuest(
    9,
    'banana',
    'Banana',
    55,
    825
  ),

  createQuest(
    10,
    'banana',
    'Banana',
    70,
    1000
  ),

  createQuest(
    11,
    'orange',
    'Orange',
    10,
    500
  ),

  createQuest(
    12,
    'orange',
    'Orange',
    20,
    600
  ),

  createQuest(
    13,
    'orange',
    'Orange',
    30,
    700
  ),

  createQuest(
    14,
    'orange',
    'Orange',
    40,
    850
  ),

  createQuest(
    15,
    'orange',
    'Orange',
    50,
    1000
  ),

  createQuest(
    16,
    'pear',
    'Pear',
    20,
    500
  ),

  createQuest(
    17,
    'pear',
    'Pear',
    30,
    600
  ),

  createQuest(
    18,
    'pear',
    'Pear',
    45,
    750
  ),

  createQuest(
    19,
    'pear',
    'Pear',
    60,
    900
  ),

  createQuest(
    20,
    'pear',
    'Pear',
    70,
    1000
  ),

  createQuest(
    21,
    'grape',
    'Grape',
    10,
    500
  ),

  createQuest(
    22,
    'grape',
    'Grape',
    15,
    600
  ),

  createQuest(
    23,
    'grape',
    'Grape',
    25,
    700
  ),

  createQuest(
    24,
    'grape',
    'Grape',
    35,
    850
  ),

  createQuest(
    25,
    'grape',
    'Grape',
    45,
    1000
  ),

  createQuest(
    26,
    'watermelon',
    'Watermelon',
    10,
    500
  ),

  createQuest(
    27,
    'watermelon',
    'Watermelon',
    12,
    600
  ),

  createQuest(
    28,
    'watermelon',
    'Watermelon',
    15,
    750
  ),

  createQuest(
    29,
    'watermelon',
    'Watermelon',
    18,
    900
  ),

  createQuest(
    30,
    'watermelon',
    'Watermelon',
    20,
    1000
  ),

  createQuest(
    31,
    'mango',
    'Mango',
    10,
    500
  ),

  createQuest(
    32,
    'mango',
    'Mango',
    15,
    625
  ),

  createQuest(
    33,
    'mango',
    'Mango',
    20,
    750
  ),

  createQuest(
    34,
    'mango',
    'Mango',
    25,
    875
  ),

  createQuest(
    35,
    'mango',
    'Mango',
    30,
    1000
  ),

  createQuest(
    36,
    'pineapple',
    'Pineapple',
    10,
    500
  ),

  createQuest(
    37,
    'pineapple',
    'Pineapple',
    12,
    600
  ),

  createQuest(
    38,
    'pineapple',
    'Pineapple',
    15,
    750
  ),

  createQuest(
    39,
    'pineapple',
    'Pineapple',
    18,
    900
  ),

  createQuest(
    40,
    'pineapple',
    'Pineapple',
    20,
    1000
  ),

  createQuest(
    41,
    'crystal-apple',
    'Crystal Apple',
    10,
    700
  ),

  createQuest(
    42,
    'crystal-apple',
    'Crystal Apple',
    12,
    800
  ),

  createQuest(
    43,
    'crystal-apple',
    'Crystal Apple',
    14,
    875
  ),

  createQuest(
    44,
    'crystal-apple',
    'Crystal Apple',
    16,
    950
  ),

  createQuest(
    45,
    'crystal-apple',
    'Crystal Apple',
    18,
    1000
  ),

  createQuest(
    46,
    'golden-fruit',
    'Golden Fruit',
    8,
    600
  ),

  createQuest(
    47,
    'golden-fruit',
    'Golden Fruit',
    10,
    700
  ),

  createQuest(
    48,
    'golden-fruit',
    'Golden Fruit',
    12,
    825
  ),

  createQuest(
    49,
    'golden-fruit',
    'Golden Fruit',
    14,
    925
  ),

  createQuest(
    50,
    'golden-fruit',
    'Golden Fruit',
    16,
    1000
  ),
];

export function getPrincessQuests(): PrincessQuest[] {
  return PRINCESS_QUESTS;
}

export function getPrincessQuestById(
  id: string
): PrincessQuest | undefined {
  return PRINCESS_QUESTS.find(
    (quest) => quest.id === id
  );
}