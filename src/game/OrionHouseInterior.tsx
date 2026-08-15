import { useMemo, useState } from 'react';
import { useGameStore } from './gameStore';
import {
  FOOD_CATALOG,
  type FoodDefinition,
  type FoodMaterial,
} from './foodCatalog';

const HOUSE_IMAGE = '/assets/orion-house-interior.png';
const KITCHEN_IMAGE = '/assets/orion-kitchen.png';

const GRID_COLS = 20;
const GRID_ROWS = 10;

interface Item {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image?: string;
}

function getMaterialAmount(
  material: FoodMaterial,
  resources: Record<string, number>,
  inventory: { id: string; quantity: number }[],
): number {
  if (material.type === 'resource') {
    return resources[material.id] ?? 0;
  }
  return (
    inventory.find((item) => item.id === material.id)?.quantity ?? 0
  );
}

function canCook(
  food: FoodDefinition,
  resources: Record<string, number>,
  inventory: { id: string; quantity: number }[],
): boolean {
  return food.ingredients.every(
    (ingredient) =>
      getMaterialAmount(ingredient, resources, inventory) >=
      ingredient.quantity,
  );
}

export function OrionHouseInterior({
  onExit,
}: {
  onExit: () => void;
}) {
  const [kitchenOpen, setKitchenOpen] = useState(false);
  const [selectedFood, setSelectedFood] =
    useState<FoodDefinition | null>(null);

  const gameState = useGameStore((state) => state.gameState);
  const spendResource = useGameStore((state) => state.spendResource);
  const removeFromInventory = useGameStore(
    (state) => state.removeFromInventory,
  );
  const addToInventory = useGameStore((state) => state.addToInventory);

  const resources = gameState?.resources ?? {};
  const inventory = gameState?.inventory ?? [];

  const foodsByLevel = useMemo(() => {
    const grouped = new Map<number, FoodDefinition[]>();

    for (const food of FOOD_CATALOG) {
      const list = grouped.get(food.level) ?? [];
      list.push(food);
      grouped.set(food.level, list);
    }

    return Array.from(grouped.entries()).sort(([a], [b]) => a - b);
  }, []);

  const cookFood = (food: FoodDefinition) => {
    if (!canCook(food, resources, inventory)) return;

    for (const ingredient of food.ingredients) {
      if (ingredient.type === 'resource') {
        const success = spendResource(
          ingredient.id,
          ingredient.quantity,
        );
        if (!success) return;
      } else {
        const success = removeFromInventory(
          ingredient.id,
          ingredient.quantity,
        );
        if (!success) return;
      }
    }

    addToInventory({
      id: `food:${food.id}`,
      name: food.name,
      type: 'food',
      quantity: 1,
      rarity:
        food.level >= 10
          ? 'mythic'
          : food.level >= 8
            ? 'legendary'
            : food.level >= 6
              ? 'epic'
              : food.level >= 4
                ? 'rare'
                : 'common',
      image: food.image,
    });

    setSelectedFood(null);
  };

  const items: Item[] = [
    {
      id: 'kitchen',
      x: 11,
      y: 6,
      width: 4,
      height: 3,
      image: KITCHEN_IMAGE,
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img
        src={HOUSE_IMAGE}
        alt="Orion House Interior"
        style={{
          width: '90%',
          height: '90%',
          objectFit: 'contain',
          imageRendering: 'pixelated',
        }}
      />

      <div
        style={{
          position: 'absolute',
          width: '90%',
          height: '90%',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (item.id === 'kitchen') {
                setKitchenOpen(true);
              }
            }}
            style={{
              gridColumn: `${item.x + 1} / span ${item.width}`,
              gridRow: `${item.y + 1} / span ${item.height}`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 5,
              cursor: 'pointer',
            }}
          >
            <img
              src={item.image}
              alt={item.id}
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                imageRendering: 'pixelated',
              }}
            />
          </div>
        ))}
      </div>

      {/* ==================== KITCHEN WINDOW ==================== */}
      {kitchenOpen && (
        <div
          onClick={() => setKitchenOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.78)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            overflow: 'auto',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(1100px, 96vw)',
              maxHeight: '92vh',
              overflow: 'auto',
              background:
                'linear-gradient(180deg, #241b16, #120e0c)',
              color: 'white',
              border: '2px solid rgba(255,255,255,.15)',
              borderRadius: 18,
              padding: 24,
              boxSizing: 'border-box',
              boxShadow: '0 20px 80px rgba(0,0,0,.6)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
                marginBottom: 20,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 28 }}>
                  Orion Kitchen
                </h2>
                <div
                  style={{
                    marginTop: 6,
                    opacity: 0.7,
                    fontSize: 14,
                  }}
                >
                  Cook food using your resources and inventory.
                </div>
              </div>

              <button
                onClick={() => setKitchenOpen(false)}
                style={{
                  border: 0,
                  background: 'rgba(255,255,255,.1)',
                  color: 'white',
                  borderRadius: 10,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Close
              </button>
            </div>

            {foodsByLevel.map(([level, foods]) => (
              <div key={level} style={{ marginBottom: 28 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 20 }}>
                  Level {level}
                </h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 14,
                  }}
                >
                  {foods.map((food) => {
                    const available = canCook(
                      food,
                      resources,
                      inventory,
                    );

                    return (
                      <button
                        key={food.id}
                        onClick={() => setSelectedFood(food)}
                        style={{
                          border: '1px solid rgba(255,255,255,.12)',
                          borderRadius: 14,
                          background: available
                            ? 'rgba(255,255,255,.08)'
                            : 'rgba(255,255,255,.035)',
                          color: 'white',
                          padding: 12,
                          cursor: 'pointer',
                          textAlign: 'left',
                          opacity: available ? 1 : 0.55,
                        }}
                      >
                        <img
                          src={food.image}
                          alt={food.name}
                          draggable={false}
                          style={{
                            width: '100%',
                            height: 130,
                            objectFit: 'contain',
                            imageRendering: 'pixelated',
                            display: 'block',
                            marginBottom: 8,
                          }}
                        />
                        <div style={{ fontWeight: 800, fontSize: 15 }}>
                          {food.name}
                        </div>
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 12,
                            opacity: 0.65,
                          }}
                        >
                          XP: {food.xp}
                        </div>
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 12,
                            color: available ? '#9cff9c' : '#ff8f8f',
                          }}
                        >
                          {available
                            ? 'Ready to cook'
                            : 'Missing ingredients'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== FOOD DETAILS / COOK ==================== */}
      {selectedFood && (
        <div
          onClick={() => setSelectedFood(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.65)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(500px, 94vw)',
              background: '#1d1714',
              color: 'white',
              borderRadius: 18,
              padding: 24,
              border: '1px solid rgba(255,255,255,.15)',
              boxShadow: '0 20px 70px rgba(0,0,0,.7)',
            }}
          >
            <img
              src={selectedFood.image}
              alt={selectedFood.name}
              draggable={false}
              style={{
                width: '100%',
                height: 220,
                objectFit: 'contain',
                imageRendering: 'pixelated',
                display: 'block',
              }}
            />

            <h2 style={{ margin: '10px 0 4px' }}>
              {selectedFood.name}
            </h2>
            <div style={{ opacity: 0.7, marginBottom: 18 }}>
              Level {selectedFood.level} · XP {selectedFood.xp}
            </div>

            <div style={{ fontWeight: 700, marginBottom: 10 }}>
              Ingredients
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                marginBottom: 20,
              }}
            >
              {selectedFood.ingredients.map((ingredient) => {
                const amount = getMaterialAmount(
                  ingredient,
                  resources,
                  inventory,
                );
                const enough = amount >= ingredient.quantity;

                return (
                  <div
                    key={ingredient.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255,255,255,.06)',
                      borderRadius: 10,
                      padding: '9px 12px',
                    }}
                  >
                    <span>{ingredient.name}</span>
                    <span
                      style={{
                        color: enough ? '#8dff8d' : '#ff8585',
                        fontWeight: 700,
                      }}
                    >
                      {amount} / {ingredient.quantity}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setSelectedFood(null)}
                style={{
                  flex: 1,
                  padding: 12,
                  border: 0,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,.1)',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => cookFood(selectedFood)}
                disabled={!canCook(selectedFood, resources, inventory)}
                style={{
                  flex: 1,
                  padding: 12,
                  border: 0,
                  borderRadius: 10,
                  background: canCook(
                    selectedFood,
                    resources,
                    inventory,
                  )
                    ? '#2e8b57'
                    : '#555',
                  color: 'white',
                  cursor: canCook(
                    selectedFood,
                    resources,
                    inventory,
                  )
                    ? 'pointer'
                    : 'not-allowed',
                  fontWeight: 800,
                }}
              >
                Cook
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onExit}
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 30px',
          borderRadius: 12,
          background: '#222',
          color: 'white',
          border: '1px solid #555',
          cursor: 'pointer',
        }}
      >
        Exit House
      </button>
    </div>
  );
}