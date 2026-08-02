import type { CurrencyBalance, ResourceBalance } from '../types';

export function createResourceBalance(id: string, name: string, amount = 0): ResourceBalance {
  return { id, name, amount };
}

export function createCurrencyBalance(symbol: string, amount = 0): CurrencyBalance {
  return { id: `currency-${symbol}`, symbol, amount };
}

export function createRewardBundle() {
  return {
    resources: [createResourceBalance('wood', 'Wood', 10)],
    currency: [createCurrencyBalance('TON', 5)],
  };
}
