import type {
  Quest,
  QuestCharacter,
  QuestCharacterId,
} from './quests/questTypes';

import { AERIS_QUESTS } from './quests/aerisQuests';
import { LYRA_QUESTS } from './quests/lyraQuests';
import { KAEL_QUESTS } from './quests/kaelQuests';
import { NYX_QUESTS } from './quests/nyxQuests';
import { ORION_QUESTS } from './quests/orionQuests';

export type {
  Quest,
  QuestCharacter,
  QuestCharacterId,
  QuestContext,
  QuestCondition,
  QuestRequirement,
  QuestInventoryCost,
} from './quests/questTypes';

/*
|--------------------------------------------------------------------------
| QUEST REGISTRY
|
| هر شخصیت یک فایل جداگانه دارد:
|   lyra   (شاه دخت)     → غذای پخته می‌گیرد، سکه می‌دهد (≤1000)
|   kael   (شاه زاده)    → آب/باد/خاک/آتش می‌گیرد، ارز اوریون می‌دهد (≤1)
|   nyx    (پیر دانا)    → چوب/سنگ/آهن/طلا/کریستال می‌گیرد، ارز می‌دهد (≤1)
|   aeris  (مادر بزرگ)   → میوه می‌گیرد، سکه می‌دهد (≤1000)
|   orion  (ریس بزرگ)    → جم + منابع مختلف می‌خواهد، جم می‌دهد (≤5)
|--------------------------------------------------------------------------
*/

const QUEST_POOLS: Record<
  QuestCharacterId,
  Quest[]
> = {
  lyra: LYRA_QUESTS,
  kael: KAEL_QUESTS,
  nyx: NYX_QUESTS,
  aeris: AERIS_QUESTS,
  orion: ORION_QUESTS,
};

export const QUEST_CHARACTERS: QuestCharacter[] =
  [
    {
      id: 'lyra',
      name: 'Lyra',
      title: 'The Princess',
      image: '/assets/princess.png',
    },
    {
      id: 'kael',
      name: 'Kael',
      title: 'The Prince',
      image: '/assets/prince.png',
    },
    {
      id: 'nyx',
      name: 'Nyx',
      title: 'Wise Elder',
      image: '/assets/wise-elder.png',
    },
    {
      id: 'aeris',
      name: 'Aeris',
      title: 'Grandmother',
      image: '/types/grandmother.png'.replace(
        '/types/',
        '/assets/',
      ),
    },
    {
      image: '/assets/grand-chief.png',
      id: 'orion',
      name: 'Orion',
      title: 'Grand Chief',
    },
  ];

/** All quests of one character (the daily pool). */
export function getCharacterQuests(
  characterId: QuestCharacterId,
): Quest[] {
  return QUEST_POOLS[
    characterId
  ];
}

/*
|--------------------------------------------------------------------------
| DAILY SELECTION — 3 RANDOM QUESTS PER CHARACTER PER DAY
|--------------------------------------------------------------------------
*/

/**
 * Deterministic per-day PRNG (mulberry32) seeded by
 * dayIndex + character so every player sees the same
 * quests on a given day and they rotate daily.
 */
function seededRandom(
  seed: number,
): () => number {
  let a = seed >>> 0;

  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;

    let t = Math.imul(
      a ^ (a >>> 15),
      1 | a,
    );

    t = (t +
      Math.imul(
        t ^ (t >>> 7),
        61 | t,
      )) ^
      t;

    return (
      (t ^ (t >>> 14)) >>> 0
    ) / 4294967296;
  };
}

export function getQuestDay(
  date = new Date(),
): number {
  const current = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const epoch = new Date(
    2024,
    0,
    1,
  );

  return Math.floor(
    (current.getTime() -
      epoch.getTime()) /
      86400000,
  );
}

export function getDailyQuestsForCharacter(
  characterId: QuestCharacterId,
  date = new Date(),
): Quest[] {
  const pool =
    getCharacterQuests(
      characterId,
    );

  if (pool.length === 0) {
    return [];
  }

  const day = getQuestDay(date);

  const seed =
    day * 31 +
    characterId.length *
      101 +
    characterId.charCodeAt(0);

  const random = seededRandom(seed);

  // Partial Fisher–Yates shuffle → first 3 picks.
  const indices = pool.map(
    (_, i) => i,
  );

  for (
    let i = 0;
    i < 3 && i < indices.length;
    i++
  ) {
    const j =
      i +
      Math.floor(
        random() *
          (indices.length - i),
      );

    [indices[i], indices[j]] = [
      indices[j],
      indices[i],
    ];
  }

  return indices
    .slice(0, 3)
    .map((i) => pool[i]);
}

export function getDailyQuests(
  date = new Date(),
): Quest[] {
  return QUEST_CHARACTERS.flatMap(
    (character) =>
      getDailyQuestsForCharacter(
        character.id,
        date,
      ),
  );
}

/** Flat list of all quests (for claim lookup). */
export const QUESTS: Quest[] =
  Object.values(QUEST_POOLS).flat();
