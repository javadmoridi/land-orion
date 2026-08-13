import React from 'react';

/**
 * Currency icons — real PNG artwork for the three in-game currencies.
 * Replace the emoji coins/tokens/gems across the UI with these images.
 */
export const CURRENCY_IMAGES = {
  coin: '/assets/currency_coin.png',
  token: '/assets/currency_token.png',
  gem: '/assets/currency_gem.png',
} as const;

export type CurrencyType = keyof typeof CURRENCY_IMAGES;

interface CurrencyIconProps {
  type: CurrencyType;
  size?: number;
  style?: React.CSSProperties;
}

export function CurrencyIcon({ type, size = 16, style }: CurrencyIconProps) {
  return (
    <img
      src={CURRENCY_IMAGES[type]}
      alt={type}
      width={size}
      height={size}
      style={{
        imageRendering: 'pixelated',
        verticalAlign: 'middle',
        display: 'inline-block',
        marginRight: 3,
        ...style,
      }}
    />
  );
}
