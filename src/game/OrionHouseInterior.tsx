import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from './useGameStore';
import { useGemStore } from '../economy/gemStore';
import {
  FOOD_CATALOG,
  getFoodById,
  getFoodCookMinutes,
  type FoodDefinition,
  type FoodMaterial,
  type FoodRarity,
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

function getFoodTime(food: FoodDefinition): number {
  return getFoodCookMinutes(food);
}

interface CookingJob {
  id: string;
  foodId: string;
  startedAt: number;
  finishAt: number;
  completed: boolean;
}

const COOK_STORAGE_KEY = 'land-orion-house-cooking-jobs';

const RARITY_ORDER: FoodRarity[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'mythic',
];

function rarityLabel(rarity: FoodRarity): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

function formatRemaining(seconds: number): string {
  const safe = Math.max(0, seconds);

  if (safe <= 0) {
    return 'Ready';
  }

  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;

  return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
}

function loadCookingJobs(): CookingJob[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(COOK_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (job): job is CookingJob =>
        !!job &&
        typeof job.id === 'string' &&
        typeof job.foodId === 'string' &&
        typeof job.startedAt === 'number' &&
        typeof job.finishAt === 'number' &&
        typeof job.completed === 'boolean',
    );
  } catch {
    return [];
  }
}

function saveCookingJobs(jobs: CookingJob[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    COOK_STORAGE_KEY,
    JSON.stringify(jobs),
  );
}

function getRemainingSeconds(job: CookingJob): number {
  if (job.completed) {
    return 0;
  }

  return Math.max(
    0,
    Math.ceil((job.finishAt - Date.now()) / 1000),
  );
}

function getQuickCookCost(job: CookingJob): number {
  const remainingSecs = getRemainingSeconds(job);

  if (remainingSecs <= 0) {
    return 0;
  }

  return Math.max(
    1,
    Math.ceil(remainingSecs / 60 / 5),
  );
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
  return food.ingredients.every((ingredient) => {
    const amount = getMaterialAmount(
      ingredient,
      resources,
      inventory,
    );

    return amount >= ingredient.quantity;
  });
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

  const spendResource = useGameStore(
    (state) => state.spendResource,
  );

  const removeFromInventory = useGameStore(
    (state) => state.removeFromInventory,
  );

  const addToInventory = useGameStore(
    (state) => state.addToInventory,
  );

  const resources = gameState?.resources ?? {};
  const inventory = gameState?.inventory ?? [];

  const gems = useGemStore((state) => state.gems);
  const spendGems = useGemStore((state) => state.spendGems);

  const [jobs, setJobs] = useState<CookingJob[]>(
    loadCookingJobs,
  );

  const [, forceTick] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      forceTick((value) => value + 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const updateJobs = (
    updater: (current: CookingJob[]) => CookingJob[],
  ) => {
    setJobs((current) => {
      const next = updater(current);
      saveCookingJobs(next);
      return next;
    });
  };

  const foodsByRarity = useMemo(() => {
    const grouped = new Map<FoodRarity, FoodDefinition[]>();

    for (const food of FOOD_CATALOG) {
      const list = grouped.get(food.rarity) ?? [];
      list.push(food);
      grouped.set(food.rarity, list);
    }

    return RARITY_ORDER.filter((rarity) =>
      grouped.has(rarity),
    ).map((rarity) => [rarity, grouped.get(rarity)!]);
  }, []);

  const cookFood = (food: FoodDefinition) => {
    if (!canCook(food, resources, inventory)) {
      return;
    }

    /*
     * First check every ingredient so that food materials are
     * never partially consumed if something is missing.
     */
    for (const ingredient of food.ingredients) {
      const amount = getMaterialAmount(
        ingredient,
        resources,
        inventory,
      );

      if (amount < ingredient.quantity) {
        return;
      }
    }

    /*
     * Consume the ingredients.
     */
    for (const ingredient of food.ingredients) {
      if (ingredient.type === 'resource') {
        const success = spendResource(
          ingredient.id,
          ingredient.quantity,
        );

        if (!success) {
          return;
        }
      } else {
        const success = removeFromInventory(
          ingredient.id,
          ingredient.quantity,
        );

        if (!success) {
          return;
        }
      }
    }

    /*
     * Start a timed cooking job. The prepared dish can be
     * collected once the timer finishes.
     */
    updateJobs((current) => [
      ...current,
      {
        id: `cook-${Date.now()}`,
        foodId: food.id,
        startedAt: Date.now(),
        finishAt: Date.now() + getFoodTime(food) * 60_000,
        completed: false,
      },
    ]);

    setMessage(null);
    setSelectedFood(null);
  };

  const finishJob = (jobId: string) => {
    updateJobs((current) =>
      current.map((job) =>
        job.id === jobId
          ? {
              ...job,
              completed: true,
              finishAt: Date.now(),
            }
          : job,
      ),
    );
  };

  const collectJob = (jobId: string) => {
    const job = jobs.find((item) => item.id === jobId);

    if (!job) {
      return;
    }

    if (job.completed || Date.now() >= job.finishAt) {
      const food = getFoodById(job.foodId);

      if (food) {
        addToInventory({
          id: `food:${food.id}`,
          name: food.name,
          type: 'food',
          quantity: 1,
          rarity:
            food.rarity === 'uncommon'
              ? 'common'
              : food.rarity,
          image: food.image,
        });
      }
    }

    updateJobs((current) =>
      current.filter((item) => item.id !== jobId),
    );
  };

  const quickCookJob = (jobId: string) => {
    const job = jobs.find((item) => item.id === jobId);

    if (!job) {
      return;
    }

    const remaining = getRemainingSeconds(job);

    if (remaining <= 0) {
      finishJob(jobId);
      return;
    }

    const cost = getQuickCookCost(job);

    if (!spendGems(cost)) {
      setMessage('Not enough gems');
      return;
    }

    setMessage(null);
    finishJob(jobId);
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
      {/* HOUSE */}
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

      {/* HOUSE CLICK GRID */}
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
                setSelectedFood(null);
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

      {/* ==================== KITCHEN ==================== */}

      {kitchenOpen && (
        <div
          onClick={() => setKitchenOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.82)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(1250px, 96vw)',
              height: 'min(760px, 92vh)',
              background:
                'linear-gradient(145deg, #24162f, #120c18)',
              color: 'white',
              border: '2px solid rgba(190,130,255,.3)',
              borderRadius: 24,
              boxShadow: '0 25px 90px rgba(0,0,0,.75)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* HEADER */}

            <div
              style={{
                height: 70,
                flexShrink: 0,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 60px',
                background: 'rgba(100,50,140,.35)',
                borderBottom:
                  '1px solid rgba(255,255,255,.1)',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 25,
                    fontWeight: 900,
                  }}
                >
                  Orion Kitchen
                </div>

                <div
                  style={{
                    marginTop: 3,
                    fontSize: 12,
                    opacity: 0.6,
                  }}
                >
                  {message ?? 'Choose a dish'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setKitchenOpen(false);
                  setSelectedFood(null);
                }}
                style={{
                  position: 'absolute',
                  right: 18,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 40,
                  height: 40,
                  border: 0,
                  borderRadius: '50%',
                  background: '#c83232',
                  color: 'white',
                  fontSize: 24,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            {/* ACTIVE COOKING JOBS */}

            {jobs.length > 0 && (
              <div
                style={{
                  flexShrink: 0,
                  maxHeight: 140,
                  overflowY: 'auto',
                  padding: '10px 16px',
                  background: 'rgba(60,30,80,.25)',
                  borderBottom:
                    '1px solid rgba(255,255,255,.12)',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    marginBottom: 8,
                  }}
                >
                  Cooking — your gems: {gems}
                </div>

                {jobs.map((job) => {
                  const food = getFoodById(job.foodId);

                  if (!food) {
                    return null;
                  }

                  const remaining = getRemainingSeconds(job);
                  const ready = remaining <= 0;
                  const cost = getQuickCookCost(job);

                  return (
                    <div
                      key={job.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '7px 10px',
                        marginBottom: 6,
                        borderRadius: 12,
                        background: ready
                          ? 'rgba(90,200,120,.18)'
                          : 'rgba(255,255,255,.06)',
                        border: `1px solid ${
                          ready
                            ? 'rgba(120,230,150,.5)'
                            : 'rgba(255,255,255,.12)'
                        }`,
                      }}
                    >
                      <img
                        src={food.image}
                        alt={food.name}
                        draggable={false}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 9,
                          background: '#211027',
                          objectFit: 'contain',
                          imageRendering: 'pixelated',
                          flexShrink: 0,
                        }}
                      />

                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 900,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {food.name}
                        </div>

                        <div
                          style={{
                            marginTop: 2,
                            fontSize: 12,
                            fontWeight: 800,
                            color: ready
                              ? '#8ff0a8'
                              : '#b9a6ff',
                          }}
                        >
                          {ready
                            ? 'Ready!'
                            : formatRemaining(remaining)}
                        </div>
                      </div>

                      {ready ? (
                        <button
                          type="button"
                          onClick={() => collectJob(job.id)}
                          style={{
                            border: 0,
                            borderRadius: 999,
                            padding: '9px 16px',
                            background: '#39bf6b',
                            color: 'white',
                            fontSize: 13,
                            fontWeight: 900,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                          }}
                        >
                          Collect
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            quickCookJob(job.id)
                          }
                          disabled={gems < cost}
                          style={{
                            border: 0,
                            borderRadius: 999,
                            padding: '9px 14px',
                            background:
                              gems >= cost
                                ? '#7444d8'
                                : '#4a4250',
                            color: 'white',
                            fontSize: 12,
                            fontWeight: 900,
                            cursor:
                              gems >= cost
                                ? 'pointer'
                                : 'not-allowed',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                          }}
                        >
                          ◆ {cost} gems
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TWO SIDES */}

            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                overflow: 'hidden',
              }}
            >
              {/* ================= LEFT ================= */}

              <div
                style={{
                  width: '55%',
                  minWidth: 0,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  padding: 16,
                  borderRight:
                    '1px solid rgba(255,255,255,.1)',
                  background:
                    'rgba(30,15,43,.65)',

                  /* Firefox */
                  scrollbarWidth: 'none',

                  /* Legacy IE/Edge scrollbar hiding */
                  msOverflowStyle: 'none',
                }}
                className="orion-kitchen-left"
              >
                {foodsByRarity.map(([rarity, foods]) => (
                  <div
                    key={rarity}
                    style={{
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        marginBottom: 8,
                        fontSize: 17,
                        fontWeight: 900,
                      }}
                    >
                      {rarityLabel(rarity)}
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(3, minmax(0, 1fr))',
                        gap: 9,
                      }}
                    >
                      {foods.map((food) => {
                        const selected =
                          selectedFood?.id === food.id;

                        const available = canCook(
                          food,
                          resources,
                          inventory,
                        );

                        return (
                          <button
                            key={food.id}
                            type="button"
                            onClick={() =>
                              setSelectedFood(food)
                            }
                            style={{
                              minWidth: 0,
                              padding: 8,
                              borderRadius: 15,
                              border: selected
                                ? '2px solid #c77dff'
                                : '1px solid rgba(255,255,255,.12)',
                              background: selected
                                ? 'linear-gradient(145deg,#704095,#45225e)'
                                : 'rgba(255,255,255,.055)',
                              color: 'white',
                              cursor: 'pointer',
                              textAlign: 'center',
                              opacity: available ? 1 : 0.55,
                              boxShadow: selected
                                ? '0 0 20px rgba(180,100,255,.2)'
                                : 'none',
                            }}
                          >
                            <div
                              style={{
                                width: '100%',
                                height: 88,
                                borderRadius: 12,
                                overflow: 'hidden',
                                background: '#211027',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <img
                                src={food.image}
                                alt={food.name}
                                draggable={false}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  imageRendering: 'pixelated',
                                }}
                              />
                            </div>

                            <div
                              style={{
                                marginTop: 6,
                                fontWeight: 900,
                                fontSize: 12,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {food.name}
                            </div>

                            <div
                              style={{
                                marginTop: 3,
                                fontSize: 10,
                                opacity: 0.55,
                              }}
                            >
                              {food.xp} XP
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* ================= RIGHT ================= */}

              <div
                style={{
                  width: '45%',
                  minWidth: 0,
                  overflow: 'hidden',
                  padding: 18,
                  background:
                    'linear-gradient(180deg,#2c153d,#1b0d25)',
                  boxSizing: 'border-box',
                }}
              >
                {!selectedFood && (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      opacity: 0.45,
                      fontSize: 17,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 44,
                          marginBottom: 12,
                        }}
                      >
                        🍳
                      </div>

                      Select a dish on the left
                      <br />
                      to get started
                    </div>
                  </div>
                )}

                {selectedFood && (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: 0,
                    }}
                  >
                    {/* FOOD IMAGE */}

                    <div
                      style={{
                        width: '100%',
                        height: 175,
                        flexShrink: 0,
                        borderRadius: 18,
                        overflow: 'hidden',
                        background: '#211027',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border:
                          '1px solid rgba(255,255,255,.1)',
                      }}
                    >
                      <img
                        src={selectedFood.image}
                        alt={selectedFood.name}
                        draggable={false}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          imageRendering: 'pixelated',
                        }}
                      />
                    </div>

                    {/* NAME */}

                    <h2
                      style={{
                        margin: '10px 0 8px',
                        fontSize: 22,
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                    >
                      {selectedFood.name}
                    </h2>

                    {/* XP + TIME */}

                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        marginBottom: 10,
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          padding: '8px 11px',
                          borderRadius: 12,
                          background:
                            'rgba(132,70,180,.35)',
                          border:
                            '1px solid rgba(200,130,255,.18)',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            opacity: 0.6,
                          }}
                        >
                          XP
                        </div>

                        <div
                          style={{
                            marginTop: 2,
                            fontSize: 16,
                            fontWeight: 900,
                          }}
                        >
                          {selectedFood.xp}
                        </div>
                      </div>

                      <div
                        style={{
                          flex: 1,
                          padding: '8px 11px',
                          borderRadius: 12,
                          background:
                            'rgba(132,70,180,.35)',
                          border:
                            '1px solid rgba(200,130,255,.18)',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            opacity: 0.6,
                          }}
                        >
                          Cooking time
                        </div>

                        <div
                          style={{
                            marginTop: 2,
                            fontSize: 16,
                            fontWeight: 900,
                          }}
                        >
                          {getFoodTime(selectedFood)} min
                        </div>
                      </div>
                    </div>

                    {/* INGREDIENT TITLE */}

                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 900,
                        marginBottom: 7,
                        flexShrink: 0,
                      }}
                    >
                      Ingredients
                    </div>

                    {/* INGREDIENTS */}

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 5,
                        flex: 1,
                        minHeight: 0,
                        overflow: 'hidden',
                      }}
                    >
                      {selectedFood.ingredients.map(
                        (ingredient) => {
                          const amount =
                            getMaterialAmount(
                              ingredient,
                              resources,
                              inventory,
                            );

                          const enough =
                            amount >=
                            ingredient.quantity;

                          return (
                            <div
                              key={ingredient.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent:
                                  'space-between',
                                gap: 8,
                                padding: '6px 9px',
                                minHeight: 42,
                                borderRadius: 11,
                                background:
                                  'rgba(255,255,255,.055)',
                                border:
                                  '1px solid rgba(255,255,255,.08)',
                                boxSizing: 'border-box',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 7,
                                  minWidth: 0,
                                }}
                              >
                                <div
                                  style={{
                                    width: 32,
                                    height: 32,
                                    flexShrink: 0,
                                    borderRadius: 8,
                                    background:
                                      '#211027',
                                    display: 'flex',
                                    alignItems:
                                      'center',
                                    justifyContent:
                                      'center',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <img
                                    src={`/assets/${ingredient.id}.png`}
                                    alt={
                                      ingredient.name
                                    }
                                    draggable={false}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit:
                                        'contain',
                                    }}
                                  />
                                </div>

                                <span
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    overflow: 'hidden',
                                    textOverflow:
                                      'ellipsis',
                                    whiteSpace:
                                      'nowrap',
                                  }}
                                >
                                  {ingredient.name}
                                </span>
                              </div>

                              <span
                                style={{
                                  flexShrink: 0,
                                  fontSize: 12,
                                  fontWeight: 900,
                                  color: enough
                                    ? '#8dff9c'
                                    : '#ff7777',
                                }}
                              >
                                {amount} /{' '}
                                {ingredient.quantity}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>

                    {/* COOK BUTTON */}

                    <button
                      type="button"
                      onClick={() =>
                        cookFood(selectedFood)
                      }
                      disabled={
                        !canCook(
                          selectedFood,
                          resources,
                          inventory,
                        )
                      }
                      style={{
                        width: '100%',
                        marginTop: 10,
                        padding: '12px 16px',
                        flexShrink: 0,
                        border: 0,
                        borderRadius: 13,
                        background: canCook(
                          selectedFood,
                          resources,
                          inventory,
                        )
                          ? 'linear-gradient(90deg,#9b4dca,#7036a0)'
                          : '#4b4650',
                        color: 'white',
                        cursor: canCook(
                          selectedFood,
                          resources,
                          inventory,
                        )
                          ? 'pointer'
                          : 'not-allowed',
                        fontSize: 14,
                        fontWeight: 900,
                        boxShadow: canCook(
                          selectedFood,
                          resources,
                          inventory,
                        )
                          ? '0 8px 25px rgba(140,60,200,.3)'
                          : 'none',
                      }}
                    >
                      {canCook(
                        selectedFood,
                        resources,
                        inventory,
                      )
                        ? `Cook · ${getFoodTime(
                            selectedFood,
                          )} min`
                        : 'Not enough ingredients'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXIT HOUSE */}

      <button
        type="button"
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
          zIndex: 20,
        }}
      >
        Exit House
      </button>

      {/* HIDE LEFT SCROLLBAR */}

      <style>
        {`
          .orion-kitchen-left::-webkit-scrollbar {
            width: 0;
            height: 0;
            display: none;
          }

          .orion-kitchen-left {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        `}
      </style>
    </div>
  );
}