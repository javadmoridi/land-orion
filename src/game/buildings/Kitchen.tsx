import { BuildingBase } from './BuildingBase';

const KITCHEN_IMAGE = '/assets/orion-kitchen.png';

interface KitchenProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

/**
 * Orion Kitchen building — a clickable building with its own panel.
 * Currently a placeholder; cooking / food features come later.
 */
export function Kitchen({ x = 9, y = 9, width = 3, height = 3 }: KitchenProps) {
  return (
    <BuildingBase
      id="kitchen"
      image={KITCHEN_IMAGE}
      alt="Orion Kitchen"
      title="🍳 Orion Kitchen"
      x={x}
      y={y}
      width={width}
      height={height}
    >
      <p style={{ margin: 0, fontSize: '0.9rem', color: '#9fb0d0' }}>
        The Kitchen is being prepared. Cooking and food features are coming soon.
      </p>
    </BuildingBase>
  );
}
