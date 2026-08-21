import type { PlayerResources } from '../resourceStore';

export type QuestCharacterId =
  | 'lyra'
  | 'kael'
  | 'nyx'
  | 'aeris'
  | 'orion';

export type QuestRequirement = Partial<
  Pick<
    PlayerResources,
    | 'water'
    | 'air'
    | 'earth'
    | 'fire'
    | 'wood'
    | 'stone'
    | 'iron'
    | 'gold'
    | 'crystal'
  >
> & {
  food?: number;
};

export interface QuestCharacter {
  id: QuestCharacterId;
  name: string;
  title: string;
  image: string;
}

export interface QuestReward
  extends Partial<PlayerResources> {}

export interface Quest {
  id: string;
  characterId: QuestCharacterId;

  title: string;
  description: string;

  requirements: QuestRequirement;
  reward: QuestReward;
}