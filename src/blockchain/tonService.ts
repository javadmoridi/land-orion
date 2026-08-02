export interface TonContractPlan {
  name: string;
  type: 'jetton' | 'collection' | 'market' | 'registry';
  status: 'planned';
}

export function createTonContractPlan(name: string, type: TonContractPlan['type']): TonContractPlan {
  return {
    name,
    type,
    status: 'planned',
  };
}

export const TON_COMPATIBLE_ONLY = true;
