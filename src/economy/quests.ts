import type { PlayerResources } from './resourceStore';

export type QuestCharacterId =
  | 'lyra'
  | 'kael'
  | 'nyx'
  | 'aeris'
  | 'orion';

export interface QuestContext {
  coins: number;
  tokens: number;
  gems: number;

  water: number;
  air: number;
  earth: number;
  fire: number;

  wood: number;
  stone: number;
  iron: number;
  gold: number;
  crystal: number;

  food: number;

  housesBuilt: number;
  questsClaimed: number;
}

export interface QuestCondition {
  label: string;
  test: (ctx: QuestContext) => boolean;
}

export interface QuestCharacter {
  id: QuestCharacterId;
  name: string;
  title: string;
  image: string;
}

export interface Quest extends Record<string, unknown> {
  id: string;
  characterId: QuestCharacterId;
  day: number;

  title: string;
  description: string;

  condition: QuestCondition;
  reward: PlayerResources;

  /**
   * Resources actually consumed when this quest is claimed
   * (what the character "takes"). When absent, nothing is spent.
   *
   * این فیلد باعث می‌شود هزینه واقعی (کاهش منابع) در کلیم دریافت
   * پاداش اعمال شود، نه فقط افزودن جایزه.
   */
  cost?: Partial<PlayerResources>;
}

/*
|--------------------------------------------------------------------------
| QUEST CHARACTERS
|--------------------------------------------------------------------------
*/

export const QUEST_CHARACTERS: QuestCharacter[] = [
  {
    id: 'lyra',
    name: 'Lyra',
    title: 'Guardian of Water',
    image: '/assets/princess.png',
  },

  {
    id: 'kael',
    name: 'Kael',
    title: 'Master of Earth',
    image: '/assets/prince.png',
  },

  {
    id: 'nyx',
    name: 'Nyx',
    title: 'Shadow Keeper',
    image: '/assets/wise-elder.png',
  },

  {
    id: 'aeris',
    name: 'Aeris',
    title: 'Wind Rider',
    image: '/assets/grandmother.png',
  },

  {
    id: 'orion',
    name: 'Orion',
    title: 'Founder of Orion',
    image: '/assets/grand-chief.png',
  },
];

/*
|--------------------------------------------------------------------------
| REWARD HELPER
|--------------------------------------------------------------------------
*/

function reward(
  coins = 0,
  tokens = 0,
  gems = 0,
  resources: Partial<PlayerResources> = {}
): PlayerResources {
  return {
    coins,
    tokens,
    gems,

    water: resources.water ?? 0,
    air: resources.air ?? 0,
    earth: resources.earth ?? 0,
    fire: resources.fire ?? 0,

    wood: resources.wood ?? 0,
    stone: resources.stone ?? 0,
    iron: resources.iron ?? 0,
    gold: resources.gold ?? 0,
    crystal: resources.crystal ?? 0,
  };
}

/*
|--------------------------------------------------------------------------
| QUEST HELPER
|--------------------------------------------------------------------------
*/

function quest(
  characterId: QuestCharacterId,
  day: number,
  id: string,
  title: string,
  description: string,
  label: string,
  test: (ctx: QuestContext) => boolean,
  questReward: PlayerResources,
  cost?: Partial<PlayerResources>
): Quest {
  const base: Quest = {
    id,
    characterId,
    day,
    title,
    description,

    condition: {
      label,
      test,
    },

    reward: questReward,
  };

  if (cost) {
    base.cost = cost;
  }

  return base;
}

/*
|--------------------------------------------------------------------------
| LYRA
|--------------------------------------------------------------------------
*/

const LYRA_QUESTS: Quest[] = [
  quest(
    'lyra',
    1,
    'lyra-water-1',
    'Water Collector',
    'Collect 10 water.',
    'Have 10 water',
    (ctx) => ctx.water >= 10,
    reward(500, 0, 0, {
      water: 2,
    })
  ),

  quest(
    'lyra',
    2,
    'lyra-water-2',
    'River Worker',
    'Collect 25 water.',
    'Have 25 water',
    (ctx) => ctx.water >= 25,
    reward(750, 0, 0, {
      water: 5,
    })
  ),

  quest(
    'lyra',
    3,
    'lyra-food-1',
    'Feed the Colony',
    'Collect 20 food.',
    'Have 20 food',
    (ctx) => ctx.food >= 20,
    reward(1000, 0, 0, {
      water: 5,
    })
  ),

  quest(
    'lyra',
    4,
    'lyra-water-3',
    'Deep Reservoir',
    'Collect 50 water.',
    'Have 50 water',
    (ctx) => ctx.water >= 50,
    reward(1500, 1, 0, {
      water: 10,
    })
  ),

  quest(
    'lyra',
    5,
    'lyra-food-2',
    'Food Supply',
    'Collect 50 food.',
    'Have 50 food',
    (ctx) => ctx.food >= 50,
    reward(2000, 1, 0, {
      water: 10,
    })
  ),

  quest(
    'lyra',
    6,
    'lyra-water-4',
    'Master of Water',
    'Collect 100 water.',
    'Have 100 water',
    (ctx) => ctx.water >= 100,
    reward(3000, 2, 1, {
      water: 20,
    })
  ),

  quest(
    'lyra',
    7,
    'lyra-final',
    'Guardian Challenge',
    'Reach 150 water.',
    'Have 150 water',
    (ctx) => ctx.water >= 150,
    reward(5000, 3, 2, {
      water: 25,
      crystal: 1,
    })
  ),
];

/*
|--------------------------------------------------------------------------
| KAEL
|--------------------------------------------------------------------------
*/

const KAEL_QUESTS: Quest[] = [
  // شاهزاده (نیم/کیل): سنگ، چوب، اهن، طلا، کریستال می‌گیرد
  // و بر اساس نرخ 0.5 تا 1.5، ارز (توکن) می‌دهد.
  // هزینه واقعی است: منابع کم می‌شوند و سپس پاداش می‌دهد.
  quest(
    'kael',
    1,
    'kael-wood-1',
    'Wood Trade',
    'Deliver 20 wood.',
    'Have 20 wood',
    (ctx) => ctx.wood >= 20,
    reward(500, 10, 0),
    { wood: 20 }
  ),

  quest(
    'kael',
    2,
    'kael-stone-1',
    'Stone Trade',
    'Deliver 15 stone.',
    'Have 15 stone',
    (ctx) => ctx.stone >= 15,
    reward(750, 9, 0),
    { stone: 15 }
  ),

  quest(
    'kael',
    3,
    'kael-wood-2',
    'Forest Trade',
    'Deliver 50 wood.',
    'Have 50 wood',
    (ctx) => ctx.wood >= 50,
    reward(1000, 40, 0),
    { wood: 50 }
  ),

  quest(
    'kael',
    4,
    'kael-stone-2',
    'Quarry Trade',
    'Deliver 40 stone.',
    'Have 40 stone',
    (ctx) => ctx.stone >= 40,
    reward(1500, 36, 0),
    { stone: 40 }
  ),

  quest(
    'kael',
    5,
    'kael-materials-1',
    'Materials Trade',
    'Deliver 75 wood and 50 stone.',
    'Have 75 wood and 50 stone',
    (ctx) =>
      ctx.wood >= 75 &&
      ctx.stone >= 50,
    reward(2000, 125, 1),
    { wood: 75, stone: 50 }
  ),

  quest(
    'kael',
    6,
    'kael-iron-1',
    'Iron Trade',
    'Deliver 10 iron.',
    'Have 10 iron',
    (ctx) => ctx.iron >= 10,
    reward(3000, 12, 1),
    { iron: 10 }
  ),

  quest(
    'kael',
    7,
    'kael-final',
    'Master Miner Trade',
    'Deliver 5 gold and 5 crystal.',
    'Have 5 gold and 5 crystal',
    (ctx) =>
      ctx.gold >= 5 &&
      ctx.crystal >= 5,
    reward(5000, 15, 2),
    { gold: 5, crystal: 5 }
  ),
];

/*
|--------------------------------------------------------------------------
| NYX
|--------------------------------------------------------------------------
*/

const NYX_QUESTS: Quest[] = [
  // پیر دانا (نیکس): اب، باد، خاک، اتش می‌گیرد
  // و بر اساس نرخ 0.5 تا 1.5، ارز (توکن) می‌دهد.
  // هزینه واقعی است: عناصر کم می‌شوند سپس توکن می‌دهد.
  quest(
    'nyx',
    1,
    'nyx-water-1',
    'Water Exchange',
    'Deliver 20 water.',
    'Have 20 water',
    (ctx) => ctx.water >= 20,
    reward(500, 10, 0),
    { water: 20 }
  ),

  quest(
    'nyx',
    2,
    'nyx-air-1',
    'Wind Exchange',
    'Deliver 20 air.',
    'Have 20 air',
    (ctx) => ctx.air >= 20,
    reward(750, 12, 0),
    { air: 20 }
  ),

  quest(
    'nyx',
    3,
    'nyx-earth-1',
    'Earth Exchange',
    'Deliver 20 earth.',
    'Have 20 earth',
    (ctx) => ctx.earth >= 20,
    reward(1000, 16, 0),
    { earth: 20 }
  ),

  quest(
    'nyx',
    4,
    'nyx-fire-1',
    'Fire Exchange',
    'Deliver 20 fire.',
    'Have 20 fire',
    (ctx) => ctx.fire >= 20,
    reward(1500, 18, 0),
    { fire: 20 }
  ),

  quest(
    'nyx',
    5,
    'nyx-elements',
    'Four Elements',
    'Deliver 20 of each element.',
    'Have 20 of each element',
    (ctx) =>
      ctx.water >= 20 &&
      ctx.air >= 20 &&
      ctx.earth >= 20 &&
      ctx.fire >= 20,
    reward(2000, 80, 1),
    { water: 20, air: 20, earth: 20, fire: 20 }
  ),

  quest(
    'nyx',
    6,
    'nyx-elements-2',
    'Elemental Blend',
    'Deliver 40 earth and 30 fire.',
    'Have 40 earth and 30 fire',
    (ctx) =>
      ctx.earth >= 40 &&
      ctx.fire >= 30,
    reward(3000, 84, 1),
    { earth: 40, fire: 30 }
  ),

  quest(
    'nyx',
    7,
    'nyx-final',
    'Essence Mastery',
    'Deliver 40 of each element.',
    'Have 40 of each element',
    (ctx) =>
      ctx.water >= 40 &&
      ctx.air >= 40 &&
      ctx.earth >= 40 &&
      ctx.fire >= 40,
    reward(5000, 240, 2),
    { water: 40, air: 40, earth: 40, fire: 40 }
  ),
];

/*
|--------------------------------------------------------------------------
| AERIS
|--------------------------------------------------------------------------
*/

const AERIS_QUESTS: Quest[] = [
  quest(
    'aeris',
    1,
    'aeris-air-1',
    'Touch the Wind',
    'Collect 10 air.',
    'Have 10 air',
    (ctx) => ctx.air >= 10,
    reward(500, 0, 0, {
      air: 2,
    })
  ),

  quest(
    'aeris',
    2,
    'aeris-air-2',
    'Wind Runner',
    'Collect 25 air.',
    'Have 25 air',
    (ctx) => ctx.air >= 25,
    reward(750, 0, 0, {
      air: 5,
    })
  ),

  quest(
    'aeris',
    3,
    'aeris-fire-1',
    'Spark of Fire',
    'Collect 10 fire.',
    'Have 10 fire',
    (ctx) => ctx.fire >= 10,
    reward(1000, 0, 0, {
      fire: 3,
    })
  ),

  quest(
    'aeris',
    4,
    'aeris-air-3',
    'Storm Rider',
    'Collect 50 air.',
    'Have 50 air',
    (ctx) => ctx.air >= 50,
    reward(1500, 1, 0, {
      air: 10,
    })
  ),

  quest(
    'aeris',
    5,
    'aeris-fire-2',
    'Flame Keeper',
    'Collect 25 fire.',
    'Have 25 fire',
    (ctx) => ctx.fire >= 25,
    reward(2000, 1, 0, {
      fire: 5,
    })
  ),

  quest(
    'aeris',
    6,
    'aeris-elements',
    'Element Master',
    'Collect 75 air and 50 fire.',
    'Have 75 air and 50 fire',
    (ctx) =>
      ctx.air >= 75 &&
      ctx.fire >= 50,
    reward(3500, 2, 1, {
      air: 15,
      fire: 10,
    })
  ),

  quest(
    'aeris',
    7,
    'aeris-final',
    'Voice of the Storm',
    'Reach 100 air and 75 fire.',
    'Have 100 air and 75 fire',
    (ctx) =>
      ctx.air >= 100 &&
      ctx.fire >= 75,
    reward(5500, 3, 2, {
      air: 20,
      fire: 15,
    })
  ),
];

/*
|--------------------------------------------------------------------------
| ORION
|--------------------------------------------------------------------------
*/

const ORION_QUESTS: Quest[] = [
  quest(
    'orion',
    1,
    'orion-start',
    'Begin the Journey',
    'Collect 10 wood.',
    'Have 10 wood',
    (ctx) => ctx.wood >= 10,
    reward(1000, 1, 0, {
      wood: 5,
    })
  ),

  quest(
    'orion',
    2,
    'orion-resources',
    'First Resources',
    'Collect 20 wood and 10 stone.',
    'Have 20 wood and 10 stone',
    (ctx) =>
      ctx.wood >= 20 &&
      ctx.stone >= 10,
    reward(1500, 1, 0, {
      wood: 5,
      stone: 5,
    })
  ),

  quest(
    'orion',
    3,
    'orion-elements',
    'Awaken the Elements',
    'Collect 10 water, air, earth and fire.',
    'Have 10 of each element',
    (ctx) =>
      ctx.water >= 10 &&
      ctx.air >= 10 &&
      ctx.earth >= 10 &&
      ctx.fire >= 10,
    reward(2500, 2, 1, {
      water: 5,
      air: 5,
      earth: 5,
      fire: 5,
    })
  ),

  quest(
    'orion',
    4,
    'orion-gold',
    'The First Treasure',
    'Collect 10 gold.',
    'Have 10 gold',
    (ctx) => ctx.gold >= 10,
    reward(3000, 2, 1, {
      gold: 5,
    })
  ),

  quest(
    'orion',
    5,
    'orion-crystal',
    'Crystal Awakening',
    'Collect 10 crystal.',
    'Have 10 crystal',
    (ctx) => ctx.crystal >= 10,
    reward(4000, 2, 1, {
      crystal: 5,
    })
  ),

  quest(
    'orion',
    6,
    'orion-colony',
    'Build the Colony',
    'Collect 100 wood and 75 stone.',
    'Have 100 wood and 75 stone',
    (ctx) =>
      ctx.wood >= 100 &&
      ctx.stone >= 75,
    reward(5000, 3, 2, {
      wood: 20,
      stone: 20,
      iron: 10,
    })
  ),

  quest(
    'orion',
    7,
    'orion-final',
    'Orion Founder',
    'Complete the first major resource milestone.',
    'Have 100 of at least four resources',
    (ctx) =>
      [
        ctx.water,
        ctx.air,
        ctx.earth,
        ctx.fire,
        ctx.wood,
        ctx.stone,
        ctx.iron,
        ctx.gold,
        ctx.crystal,
      ].filter(
        (value) => value >= 100
      ).length >= 4,
    reward(10000, 5, 5, {
      crystal: 10,
      gold: 10,
      iron: 10,
    })
  ),
];

/*
|--------------------------------------------------------------------------
| ALL QUESTS
|--------------------------------------------------------------------------
*/

export const QUESTS: Quest[] = [
  ...LYRA_QUESTS,
  ...KAEL_QUESTS,
  ...NYX_QUESTS,
  ...AERIS_QUESTS,
  ...ORION_QUESTS,
];

/*
|--------------------------------------------------------------------------
| CHARACTER
|--------------------------------------------------------------------------
*/

export function getQuestCharacter(
  characterId: QuestCharacterId
): QuestCharacter {
  return (
    QUEST_CHARACTERS.find(
      (character) =>
        character.id === characterId
    ) ?? QUEST_CHARACTERS[0]
  );
}

/*
|--------------------------------------------------------------------------
| CHARACTER QUESTS
|--------------------------------------------------------------------------
*/

export function getCharacterQuests(
  characterId: QuestCharacterId
): Quest[] {
  return QUESTS
    .filter(
      (quest) =>
        quest.characterId === characterId
    )
    .sort(
      (a, b) =>
        a.day - b.day
    );
}

/*
|--------------------------------------------------------------------------
| CURRENT QUEST DAY
|--------------------------------------------------------------------------
|
| روزها بر اساس تاریخ واقعی دستگاه کاربر محاسبه می‌شوند.
|
| روز 1 = کوست 1 و 2
| روز 2 = کوست 3 و 4
| روز 3 = کوست 5 و 6
| روز 4 = کوست 7 و 1
| روز 5 = کوست 2 و 3
| روز 6 = کوست 4 و 5
| روز 7 = کوست 6 و 7
|
| بعد از روز 7 دوباره چرخه از روز 1 شروع می‌شود.
|--------------------------------------------------------------------------
*/

export function getQuestDay(
  date = new Date()
): number {
  const startOfYear = new Date(
    date.getFullYear(),
    0,
    1
  );

  const currentDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const firstDay = new Date(
    startOfYear.getFullYear(),
    startOfYear.getMonth(),
    startOfYear.getDate()
  );

  const dayOfYear =
    Math.floor(
      (
        currentDay.getTime() -
        firstDay.getTime()
      ) /
        86400000
    ) + 1;

  return (
    ((dayOfYear - 1) % 7) + 1
  );
}

/*
|--------------------------------------------------------------------------
| DAILY QUESTS FOR ONE CHARACTER
|--------------------------------------------------------------------------
|
| نکته مهم:
| هر شخصیت همیشه دقیقاً 2 کوست در روز دارد.
|
| وقتی تاریخ عوض شود، getQuestDay تغییر می‌کند
| و دو کوست جدید برمی‌گردند.
|
|--------------------------------------------------------------------------
*/

export function getDailyQuestsForCharacter(
  characterId: QuestCharacterId,
  date = new Date()
): Quest[] {
  const quests =
    getCharacterQuests(
      characterId
    );

  if (quests.length === 0) {
    return [];
  }

  const day =
    getQuestDay(date);

  const firstIndex =
    ((day - 1) * 2) %
    quests.length;

  const secondIndex =
    (firstIndex + 1) %
    quests.length;

  return [
    quests[firstIndex],
    quests[secondIndex],
  ];
}

/*
|--------------------------------------------------------------------------
| SINGLE DAILY QUEST
|--------------------------------------------------------------------------
*/

export function getDailyQuest(
  characterId: QuestCharacterId,
  date = new Date()
): Quest {
  const dailyQuests =
    getDailyQuestsForCharacter(
      characterId,
      date
    );

  return (
    dailyQuests[0] ??
    getCharacterQuests(
      characterId
    )[0]
  );
}

/*
|--------------------------------------------------------------------------
| ALL DAILY QUESTS
|--------------------------------------------------------------------------
|
| 5 شخصیت × 2 کوست = 10 کوست در پنل
|
|--------------------------------------------------------------------------
*/

export function getDailyQuests(
  date = new Date()
): Quest[] {
  return QUEST_CHARACTERS.flatMap(
    (character) =>
      getDailyQuestsForCharacter(
        character.id,
        date
      )
  );
}